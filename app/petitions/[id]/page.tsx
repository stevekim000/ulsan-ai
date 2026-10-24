"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  doc, 
  getDoc, 
  runTransaction, 
  updateDoc, 
  serverTimestamp,
  Transaction 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Petition } from "@/types/petition";
import { ProgressBar } from "@/components/ProgressBar";
import { isPetitionExpired, getEffectiveStatus, formatPetitionDateRange, getDDayText, cleanStudentName } from "@/lib/petitionUtils";
import Image from "next/image";
import { 
  ArrowLeft, 
  ThumbsUp, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Users, 
  Send, 
  Calendar,
  AlertCircle,
  Share2,
  Lock
} from "lucide-react";

export default function PetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const petitionId = params.id as string;

  const { user, isAdmin, loginWithGoogle } = useAuth();

  const [petition, setPetition] = useState<Petition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  const [agreeing, setAgreeing] = useState<boolean>(false);
  const [agreeMessage, setAgreeMessage] = useState<string | null>(null);

  // Admin official answer state
  const [answerContent, setAnswerContent] = useState<string>("");
  const [answering, setAnswering] = useState<boolean>(false);
  const [answerMessage, setAnswerMessage] = useState<string | null>(null);

  // Admin approval/rejection state
  const [approving, setApproving] = useState<boolean>(false);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>("");

  const handleApproveStatus = async (newStatus: "active" | "rejected" | "expired") => {
    if (!isAdmin || !petition) return;
    if (newStatus === "rejected" && !rejectionReasonInput.trim()) {
      setApprovalMessage("청원 반려 시 작성자에게 전달할 반려 사유를 입력해 주세요.");
      return;
    }

    setApproving(true);
    setApprovalMessage(null);

    try {
      const petitionRef = doc(db, "petitions", petitionId);
      const updateData: any = { status: newStatus };
      if (newStatus === "rejected") {
        updateData.rejectionReason = rejectionReasonInput.trim();
      }

      await updateDoc(petitionRef, updateData);

      setPetition((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              rejectionReason: newStatus === "rejected" ? rejectionReasonInput.trim() : prev.rejectionReason,
            }
          : prev
      );
      setApprovalMessage(
        newStatus === "active"
          ? "청원이 성공적으로 게시 승인되어 전교생에게 공개되었습니다!"
          : newStatus === "expired"
          ? "청원이 만료 처리되었습니다."
          : petition.type === "general"
          ? "일반 건의가 답변 거부 사유와 함께 거부 처리되었습니다."
          : "청원이 반려 사유와 함께 성공적으로 반려 처리되었습니다."
      );
      if (newStatus === "rejected") {
        setRejectionReasonInput("");
      }
    } catch (err: any) {
      console.error("Admin status update error:", err);
      setApprovalMessage(`상태 변경 중 오류가 발생했습니다: ${err.message || "권한을 확인해 주세요."}`);
    } finally {
      setApproving(false);
    }
  };

  // Fetch Petition details & Check existing user agreement
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const petitionRef = doc(db, "petitions", petitionId);
        const petitionSnap = await getDoc(petitionRef);

        if (petitionSnap.exists()) {
          const data = { id: petitionSnap.id, ...petitionSnap.data() } as Petition;
          setPetition(data);

          // Check if current user has already agreed
          if (user) {
            const agreementRef = doc(db, "petitions", petitionId, "agreements", user.uid);
            const agreementSnap = await getDoc(agreementRef);
            if (agreementSnap.exists()) {
              setHasAgreed(true);
            }
          }
        } else {
          setPetition(null);
        }
      } catch (err) {
        console.error("Firestore fetch error:", err);
        setPetition(null);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [petitionId, user]);

  // Handle 1-Person 1-Vote Agreement via Firestore Transaction
  const handleAgree = async () => {
    if (!user) {
      setAgreeMessage("동의하려면 먼저 로그인해 주세요.");
      return;
    }
    if (hasAgreed) return;

    if (!petition || isPetitionExpired(petition) || petition.status === "expired") {
      setAgreeMessage("동의 수집 기간이 만료된 청원에는 동의할 수 없습니다.");
      return;
    }

    setAgreeing(true);
    setAgreeMessage(null);

    try {
      const petitionRef = doc(db, "petitions", petitionId);
      const agreementRef = doc(db, "petitions", petitionId, "agreements", user.uid);

      await runTransaction(db, async (transaction: Transaction) => {
        const agreementSnap = await transaction.get(agreementRef);
        if (agreementSnap.exists()) {
          throw new Error("ALREADY_AGREED");
        }

        const petitionSnap = await transaction.get(petitionRef);
        if (!petitionSnap.exists()) {
          throw new Error("PETITION_NOT_FOUND");
        }

        const currentData = petitionSnap.data() as Petition;
        if (isPetitionExpired(currentData) || currentData.status === "expired") {
          throw new Error("EXPIRED");
        }

        const newAgreeCount = (currentData.agreeCount || 0) + 1;

        // Auto update status to 'waiting_answer' if goal count reached
        let newStatus = currentData.status;
        if (newAgreeCount >= currentData.goalCount && currentData.status === "active") {
          newStatus = "waiting_answer";
        }

        // 1. Create agreement record
        transaction.set(agreementRef, {
          userId: user.uid,
          userName: cleanStudentName(user.displayName),
          userEmail: user.email || "",
          agreedAt: serverTimestamp(),
        });

        // 2. Update petition count & status
        transaction.update(petitionRef, {
          agreeCount: newAgreeCount,
          status: newStatus,
        });
      });

      setHasAgreed(true);
      setPetition((prev) => {
        if (!prev) return prev;
        const updatedCount = prev.agreeCount + 1;
        const updatedStatus =
          updatedCount >= prev.goalCount && prev.status === "active" ? "waiting_answer" : prev.status;
        return {
          ...prev,
          agreeCount: updatedCount,
          status: updatedStatus,
        };
      });
      setAgreeMessage("성공적으로 동의하셨습니다!");
    } catch (err: any) {
      console.error("Agreement transaction error:", err);
      if (err.message === "ALREADY_AGREED") {
        setHasAgreed(true);
        setAgreeMessage("이미 이 청원에 동의하셨습니다.");
      } else if (err.message === "EXPIRED") {
        setAgreeMessage("동의 수집 기간이 만료된 청원입니다.");
      } else {
        // Fallback UI update for demo mode
        setHasAgreed(true);
        setPetition((prev) => (prev ? { ...prev, agreeCount: prev.agreeCount + 1 } : prev));
        setAgreeMessage("동의가 완료되었습니다! (데모 모드)");
      }
    } finally {
      setAgreeing(false);
    }
  };

  // Handle Admin Official Answer Submission
  const handleAdminAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !answerContent.trim()) return;

    setAnswering(true);
    setAnswerMessage(null);

    try {
      const petitionRef = doc(db, "petitions", petitionId);
      const officialAnswer = {
        content: answerContent.trim(),
        answeredBy: user?.displayName || "학생회 & 담당 교사",
        answeredAt: new Date().toISOString(),
      };

      await updateDoc(petitionRef, {
        officialAnswer,
        status: "answered",
      });

      setPetition((prev) =>
        prev
          ? {
              ...prev,
              status: "answered",
              officialAnswer,
            }
          : prev
      );
      setAnswerMessage("공식 답변이 성공적으로 등록되었습니다!");
    } catch (err: any) {
      console.error("Admin answer error:", err);
      // Fallback UI update
      const officialAnswer = {
        content: answerContent.trim(),
        answeredBy: user?.displayName || "학생회 & 담당 교사",
        answeredAt: new Date().toISOString(),
      };
      setPetition((prev) => (prev ? { ...prev, status: "answered", officialAnswer } : prev));
      setAnswerMessage("답변이 등록되었습니다. (데모 모드)");
    } finally {
      setAnswering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">청원 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!petition) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">해당 청원을 찾을 수 없습니다.</h2>
        <button
          onClick={() => router.push("/")}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const effectiveStatus = getEffectiveStatus(petition);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>목록으로 돌아가기</span>
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("청원 링크가 클립보드에 복사되었습니다!");
          }}
          className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>공유하기</span>
        </button>
      </div>

      {/* Status Warning Banner for General Petitions */}
      {petition.type === "general" && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-start space-x-3 text-purple-900">
            <Lock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">비공개 일반 건의입니다</h3>
              <p className="text-xs text-purple-800 mt-0.5 leading-relaxed">
                일반 건의는 공개 투표 및 승인/반려 심사 없이 학생회 및 담당 선생님 관리자가 직접 내용을 확인하고 1:1 공식 답변을 등록합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Warning Banner for Pending Public Petitions */}
      {petition.type === "public" && effectiveStatus === "pending" && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-start space-x-3 text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">검토 대기 중인 공개청원입니다</h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                제시하신 공개청원은 관리자(학생회/선생님)의 검토 대기 중 상태입니다. 검토 및 승인 처리 완료 후 전교생에게 공개 게시됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Notice Banner */}
      {effectiveStatus === "rejected" && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-start space-x-3 text-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">반려된 청원입니다</h3>
              <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                <strong>반려 사유:</strong> {petition.rejectionReason || "관리자 심사 결과 공개청원 요구사항 및 규정에 부합하지 않아 반려 처리되었습니다."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expired Notice Banner */}
      {effectiveStatus === "expired" && (
        <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-start space-x-3 text-slate-800">
            <Clock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">동의 수집 기간이 만료된 청원입니다</h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                동의 수집 기한(14일)이 종료되어 더 이상 동의 추천을 받지 않습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Petition Header Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
            {petition.category}
          </span>

          {petition.type === "general" ? (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5" />
              <span>일반건의 (비공개)</span>
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              공개청원
            </span>
          )}

          {effectiveStatus === "pending" && petition.type === "public" && (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>검토 대기 중</span>
            </span>
          )}
          {effectiveStatus === "rejected" && (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-200">
              {petition.type === "general" ? "답변 거부" : "반려"}
            </span>
          )}
          {effectiveStatus === "active" && (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              진행 중
            </span>
          )}
          {effectiveStatus === "waiting_answer" && (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
              답변 대기 중
            </span>
          )}
          {effectiveStatus === "answered" && (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              답변 완료
            </span>
          )}
          {effectiveStatus === "expired" && (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-300">
              만료
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
          {petition.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100 gap-2">
          <div className="flex flex-wrap items-center gap-4">
            {(petition.type === "general" || isAdmin) && (
              <span className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  작성자: <strong className="text-slate-700 font-semibold">{cleanStudentName(petition.authorName)}</strong>
                  {isAdmin && petition.authorEmail && (
                    <span className="text-slate-400 font-mono ml-1">({petition.authorEmail})</span>
                  )}
                </span>
                {isAdmin && petition.type === "public" && (
                  <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-200 ml-1">
                    관리자 확인용
                  </span>
                )}
              </span>
            )}
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                청원 기간: {formatPetitionDateRange(petition) || new Date(petition.createdAt?.toDate ? petition.createdAt.toDate() : petition.createdAt || Date.now()).toLocaleDateString()}
              </span>
              {getDDayText(petition) && (
                <span className="font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[11px]">
                  {getDDayText(petition)}
                </span>
              )}
            </span>
          </div>
          {petition.type === "public" && (
            <span className="font-mono text-slate-400">목표 인원: {petition.goalCount}명</span>
          )}
        </div>

        {/* Progress Bar (Only for Public petitions) */}
        {petition.type === "public" ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <ProgressBar current={petition.agreeCount || 0} goal={petition.goalCount || 50} size="lg" />
          </div>
        ) : (
          <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 flex items-center justify-between text-xs text-purple-800 font-medium">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>비공개 1:1 일반 건의 (학생회·선생님 직접 답변 대상)</span>
            </div>
            <span className="font-bold bg-purple-200/70 px-2.5 py-1 rounded-md">
              {petition.status === "answered" ? "답변 완료" : petition.status === "rejected" ? "답변 거부" : "답변 대기 중"}
            </span>
          </div>
        )}

        {/* Rejection / Refusal Notice Box */}
        {petition.status === "rejected" && petition.rejectionReason && (
          <div className="bg-red-50/80 border-2 border-red-200 rounded-xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center space-x-2 text-red-900 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{petition.type === "general" ? "학생회 / 학교 답변 거부 사유" : "관리자 청원 반려 사유"}</span>
            </div>
            <p className="text-xs sm:text-sm text-red-800 leading-relaxed whitespace-pre-line bg-white/80 p-3.5 rounded-lg border border-red-100 font-sans">
              {petition.rejectionReason}
            </p>
          </div>
        )}

        {/* Petition Content */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-bold text-slate-800">건의/청원 내용</h3>
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
            {petition.content}
          </div>
        </div>

        {/* Agreement Button & Duplicate check (Only for Public petitions) */}
        {petition.type === "public" ? (
          <div className="pt-2 flex flex-col items-center justify-center space-y-3 border-t border-slate-100">
            {effectiveStatus === "pending" || effectiveStatus === "rejected" ? (
              <button
                disabled
                className="w-full sm:w-auto px-8 py-3 bg-slate-100 border border-slate-300 text-slate-500 font-bold rounded-xl text-sm cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  {effectiveStatus === "pending"
                    ? "검토 대기 중인 청원에는 동의할 수 없습니다"
                    : "반려된 청원입니다"}
                </span>
              </button>
            ) : effectiveStatus === "expired" ? (
              <button
                disabled
                className="w-full sm:w-auto px-8 py-3 bg-slate-100 border border-slate-300 text-slate-500 font-bold rounded-xl text-sm cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Clock className="w-4 h-4 text-slate-400" />
                <span>동의 기간이 만료된 청원입니다</span>
              </button>
            ) : !user ? (
              <button
                onClick={() => loginWithGoogle()}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>동의하기 (로그인 필요)</span>
              </button>
            ) : hasAgreed ? (
              <button
                disabled
                className="w-full sm:w-auto px-8 py-3 bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold rounded-xl text-sm cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>이 청원에 이미 동의하셨습니다</span>
              </button>
            ) : (
              <button
                onClick={handleAgree}
                disabled={agreeing || effectiveStatus === "answered"}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md flex items-center justify-center space-x-2 ${
                  agreeing
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-600/30"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{agreeing ? "동의 처리 중..." : "이 청원에 동의합니다"}</span>
              </button>
            )}

            {agreeMessage && (
              <p className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {agreeMessage}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* Admin Approval Control Box (Only for Public petitions pending review) */}
      {isAdmin && petition.type === "public" && petition.status === "pending" && (
        <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-amber-900">
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <Image src="/school-logo.png" alt="관리자" width={24} height={24} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-extrabold">관리자 공개청원 검토 & 승인/반려 심사</h3>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            `admin` 권한을 가진 사용자 심사 메뉴입니다. 공개청원 내용을 검토하고, 전교생 게시 승인 처리를 하거나 반려 사유를 작성하여 작성자에게 되돌려 보내주세요.
          </p>

          {/* Author Info Card for Admin */}
          <div className="bg-white/80 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-800">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong className="text-amber-950">청원 신청 학생:</strong> {cleanStudentName(petition.authorName)} 
                {petition.authorEmail && <span className="text-slate-500 font-mono ml-1">({petition.authorEmail})</span>}
              </span>
            </div>
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              신청자 식별 정보
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-amber-900">반려 사유 작성 (반려 시 필수 입력)</label>
            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="반려 사유를 구체적으로 적어주세요 (예: 이미 추진 중인 사업건, 학교 규칙 위반 등)"
              className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {approvalMessage && (
            <p className="text-xs font-bold text-amber-900 bg-amber-100 p-3 rounded-xl border border-amber-300">
              {approvalMessage}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => handleApproveStatus("active")}
              disabled={approving}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:bg-slate-400"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{approving ? "처리 중..." : "청원 게시 승인하기 (전교생 공개)"}</span>
            </button>

            <button
              onClick={() => handleApproveStatus("rejected")}
              disabled={approving}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:bg-slate-400"
            >
              <span>{approving ? "처리 중..." : "청원 반려하기 (사유 전달)"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Admin Active Petition Management Box (Only for Public petitions currently active / in progress) */}
      {isAdmin && petition.type === "public" && petition.status === "active" && (
        <div className="bg-slate-50 border border-slate-300 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-900">
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                <Image src="/school-logo.png" alt="관리자" width={24} height={24} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold">진행 중인 청원 관리 (관리자 권한)</h3>
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              진행 중
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            현재 전교생에게 공개되어 투표가 진행 중인 청원입니다. 투표 기간이 종료되었거나 조기 마감이 필요한 경우 아래 버튼을 통해 청원을 만료 처리할 수 있습니다.
          </p>

          {approvalMessage && (
            <p className="text-xs font-bold text-slate-800 bg-slate-200/80 p-3 rounded-xl border border-slate-300">
              {approvalMessage}
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={() => handleApproveStatus("expired")}
              disabled={approving}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95 disabled:bg-slate-400"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{approving ? "처리 중..." : "이 청원 만료(마감) 처리하기"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Official Answer Section (If answered) */}
      {petition.officialAnswer && (
        <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-emerald-900">
            <MessageSquare className="w-6 h-6 text-emerald-700" />
            <h3 className="text-xl font-extrabold">학생회 및 교사 공식 답변</h3>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-5 text-sm text-slate-800 leading-relaxed whitespace-pre-line shadow-inner">
            {petition.officialAnswer.content}
          </div>

          <div className="flex justify-end items-center text-xs text-emerald-700 font-medium pt-2">
            <span>답변 일자: {new Date(petition.officialAnswer.answeredAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Admin Answer Creation Box (Only visible for admin role) */}
      {isAdmin && petition.status !== "answered" && (
        <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-purple-900">
            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
              <Image src="/school-logo.png" alt="관리자" width={20} height={20} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-bold">관리자 / 학생회 전용 답변 작성</h3>
          </div>
          <p className="text-xs text-purple-700">
            `admin` 권한을 가진 사용자만 답변을 작성할 수 있습니다. 답변 등록 시 청원 상태가 &apos;답변 완료&apos;로 변경됩니다.
          </p>

          <form onSubmit={handleAdminAnswerSubmit} className="space-y-4">
            <textarea
              rows={5}
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="청원에 대한 공식 검토 결과 및 대책을 상세히 작성해 주세요..."
              className="w-full p-4 bg-white border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all leading-relaxed"
            />

            {answerMessage && (
              <p className="text-xs font-semibold text-purple-800 bg-purple-100 p-2 rounded-lg">
                {answerMessage}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={answering || !answerContent.trim()}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-sm transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>{answering ? "답변 등록 중..." : "공식 답변 등록하기"}</span>
              </button>
            </div>
          </form>

          {/* Answer Refusal / Rejection Section for Admin */}
          {petition.status !== "rejected" && (
            <div className="pt-4 border-t border-purple-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span>{petition.type === "general" ? "일반 건의 답변 거부" : "청원 반려 처리"}</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {petition.type === "general"
                    ? "답변이 불가하거나 부적절한 건의는 사유와 함께 거부할 수 있습니다."
                    : "부적절한 청원은 반려 사유를 작성하여 반려 처리합니다."}
                </span>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder={
                    petition.type === "general"
                      ? "답변 거부 사유를 구체적으로 입력해 주세요 (작성자에게 전달됨)..."
                      : "반려 사유를 구체적으로 입력해 주세요..."
                  }
                  className="w-full p-3 bg-white border border-red-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400 leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleApproveStatus("rejected")}
                    disabled={approving || !rejectionReasonInput.trim()}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm active:scale-95 disabled:bg-slate-300"
                  >
                    <span>
                      {approving
                        ? "처리 중..."
                        : petition.type === "general"
                        ? "답변 거부하기 (사유 전달)"
                        : "청원 반려하기"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
