"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  getDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Petition, PetitionStatus } from "@/types/petition";
import { PetitionCard } from "@/components/PetitionCard";
import { Pagination } from "@/components/Pagination";
import { getEffectiveStatus, formatPetitionDateRange, getDDayText, parseDate } from "@/lib/petitionUtils";
import { 
  User as UserIcon, 
  FileText, 
  ThumbsUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  PlusCircle, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Calendar,
  MessageSquare,
  Sparkles,
  LogIn
} from "lucide-react";

const ITEMS_PER_PAGE = 5;

export default function MyPage() {
  const router = useRouter();
  const { user, userProfile, displayName, isAdmin, loading: authLoading, loginWithGoogle, schoolDomain } = useAuth();

  const [activeTab, setActiveTab] = useState<"my" | "agreed">("my");
  const [myPetitions, setMyPetitions] = useState<Petition[]>([]);
  const [agreedPetitions, setAgreedPetitions] = useState<Petition[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [myCurrentPage, setMyCurrentPage] = useState<number>(1);
  const [agreedCurrentPage, setAgreedCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (!user?.uid) {
      setLoadingData(false);
      return;
    }

    const uid = user.uid;

    async function fetchUserActivity(targetUid: string) {
      setLoadingData(true);
      try {
        // 1. Fetch petitions written by the user
        const petitionsRef = collection(db, "petitions");
        const myQuery = query(petitionsRef, where("authorId", "==", targetUid));
        const mySnapshot = await getDocs(myQuery);
        
        const authoredList: Petition[] = [];
        mySnapshot.forEach((d) => {
          authoredList.push({ id: d.id, ...d.data() } as Petition);
        });

        // Sort by createdAt descending
        authoredList.sort((a, b) => {
          const dateA = parseDate(a.createdAt)?.getTime() || 0;
          const dateB = parseDate(b.createdAt)?.getTime() || 0;
          return dateB - dateA;
        });

        setMyPetitions(authoredList);

        // 2. Fetch public petitions that the user agreed to
        const publicQuery = query(petitionsRef, where("type", "==", "public"));
        const publicSnapshot = await getDocs(publicQuery);

        const agreedList: Petition[] = [];
        // Check agreement subcollection for each petition in parallel
        const agreementChecks = publicSnapshot.docs.map(async (pDoc) => {
          const petitionData = { id: pDoc.id, ...pDoc.data() } as Petition;
          try {
            const agreementRef = doc(db, "petitions", pDoc.id, "agreements", targetUid);
            const agreementSnap = await getDoc(agreementRef);
            if (agreementSnap.exists()) {
              agreedList.push(petitionData);
            }
          } catch (err) {
            // Ignore error on individual check
          }
        });

        await Promise.all(agreementChecks);

        // Sort agreed petitions by createdAt descending
        agreedList.sort((a, b) => {
          const dateA = parseDate(a.createdAt)?.getTime() || 0;
          const dateB = parseDate(b.createdAt)?.getTime() || 0;
          return dateB - dateA;
        });

        setAgreedPetitions(agreedList);
      } catch (err) {
        console.error("Error fetching my page data:", err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchUserActivity(uid);
  }, [user]);

  // Loading state
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">내 활동 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          <UserIcon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">로그인이 필요한 페이지입니다</h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            내가 작성한 청원과 동의한 내역을 확인하려면 학교 구글 계정(@{schoolDomain})으로 로그인해 주세요.
          </p>
        </div>

        <button
          onClick={loginWithGoogle}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
        >
          <LogIn className="w-4 h-4" />
          <span>구글 계정으로 로그인</span>
        </button>
      </div>
    );
  }

  // Activity stats calculations
  const totalAuthored = myPetitions.length;
  const totalAgreed = agreedPetitions.length;
  const totalAnswered = myPetitions.filter((p) => getEffectiveStatus(p) === "answered").length;
  const totalPendingOrActive = myPetitions.filter((p) => {
    const s = getEffectiveStatus(p);
    return s === "active" || s === "pending" || s === "waiting_answer";
  }).length;

  // Pagination calculations
  const myTotalPages = Math.ceil(myPetitions.length / ITEMS_PER_PAGE);
  const myStartIndex = (myCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMyPetitions = myPetitions.slice(myStartIndex, myStartIndex + ITEMS_PER_PAGE);

  const agreedTotalPages = Math.ceil(agreedPetitions.length / ITEMS_PER_PAGE);
  const agreedStartIndex = (agreedCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAgreedPetitions = agreedPetitions.slice(agreedStartIndex, agreedStartIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      {/* Profile & Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden relative">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Info */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {displayName}
              </h1>
              {isAdmin ? (
                <span className="text-xs bg-purple-500/30 text-purple-200 border border-purple-400/40 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-purple-300" />
                  <span>학생회 관리자</span>
                </span>
              ) : (
                <span className="text-xs bg-blue-500/20 text-blue-200 border border-blue-400/30 font-semibold px-2 py-0.5 rounded-full">
                  재학생
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 font-mono">{user.email}</p>
          </div>

          {/* New Petition Action Button */}
          <div className="flex items-center space-x-3">
            <Link
              href="/petitions/new"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>청원 작성하기</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-[11px] text-slate-400 block mb-1 font-medium">내가 쓴 청원</span>
            <span className="text-2xl font-extrabold text-white font-mono">{totalAuthored}</span>
            <span className="text-[11px] text-slate-400 ml-1">건</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-[11px] text-slate-400 block mb-1 font-medium">내가 동의한 청원</span>
            <span className="text-2xl font-extrabold text-blue-300 font-mono">{totalAgreed}</span>
            <span className="text-[11px] text-slate-400 ml-1">건</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-[11px] text-slate-400 block mb-1 font-medium">진행/검토 중</span>
            <span className="text-2xl font-extrabold text-amber-300 font-mono">{totalPendingOrActive}</span>
            <span className="text-[11px] text-slate-400 ml-1">건</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-[11px] text-slate-400 block mb-1 font-medium">답변 완료</span>
            <span className="text-2xl font-extrabold text-emerald-300 font-mono">{totalAnswered}</span>
            <span className="text-[11px] text-slate-400 ml-1">건</span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div id="petitions-list" className="space-y-6">
        {/* Tab Navigation Buttons */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => {
              setActiveTab("my");
              setMyCurrentPage(1);
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "my"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>내가 작성한 청원</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "my" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {myPetitions.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("agreed");
              setAgreedCurrentPage(1);
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "agreed"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>내가 동의한 청원</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "agreed" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {agreedPetitions.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {loadingData ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            청원 데이터를 불러오고 있습니다...
          </div>
        ) : activeTab === "my" ? (
          myPetitions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-800">아직 작성한 청원이 없습니다.</p>
                <p className="text-xs text-slate-500">
                  학교 생활에 건의하고 싶은 내용이나 좋은 아이디어가 있다면 첫 청원을 등록해보세요!
                </p>
              </div>
              <Link
                href="/petitions/new"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>청원 작성하기</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {paginatedMyPetitions.map((petition) => {
                  const effectiveStatus = getEffectiveStatus(petition);
                  const dDay = getDDayText(petition);
                  const dateRange = formatPetitionDateRange(petition);

                  return (
                    <div
                      key={petition.id}
                      className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-sm transition-all hover:shadow-md ${
                        effectiveStatus === "rejected"
                          ? "border-red-200 bg-red-50/20"
                          : effectiveStatus === "answered"
                          ? "border-emerald-200"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                            {petition.category}
                          </span>

                          {petition.type === "general" ? (
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center space-x-1">
                              <Lock className="w-3 h-3" />
                              <span>1:1 일반건의</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center space-x-1">
                              <Globe className="w-3 h-3" />
                              <span>공개청원</span>
                            </span>
                          )}

                          {/* Status Badge */}
                          {effectiveStatus === "pending" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>검토 대기 중</span>
                            </span>
                          )}
                          {effectiveStatus === "rejected" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-200">
                              {petition.type === "general" ? "답변 거부" : "반려"}
                            </span>
                          )}
                          {effectiveStatus === "active" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              진행 중
                            </span>
                          )}
                          {effectiveStatus === "waiting_answer" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-300">
                              답변 대기 중
                            </span>
                          )}
                          {effectiveStatus === "answered" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center space-x-1">
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              <span>답변 완료</span>
                            </span>
                          )}
                          {effectiveStatus === "expired" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-300">
                              만료
                            </span>
                          )}
                        </div>

                        {dDay && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                            {dDay}
                          </span>
                        )}
                      </div>

                      <Link href={`/petitions/${petition.id}`} className="group block">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                          {petition.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                          {petition.content}
                        </p>
                      </Link>

                      {/* Rejection Notice in card */}
                      {effectiveStatus === "rejected" && petition.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4 text-xs text-red-800 space-y-1">
                          <p className="font-bold flex items-center space-x-1 text-red-900">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>{petition.type === "general" ? "답변 거부 사유" : "관리자 반려 사유"}</span>
                          </p>
                          <p className="leading-relaxed pl-4">{petition.rejectionReason}</p>
                        </div>
                      )}

                      {/* Official Answer Preview in card */}
                      {effectiveStatus === "answered" && petition.officialAnswer && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-4 text-xs text-emerald-900 space-y-1">
                          <p className="font-bold flex items-center space-x-1 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>학생회/학교 공식 답변 등록됨</span>
                          </p>
                          <p className="line-clamp-2 leading-relaxed text-slate-700 pl-4">
                            {petition.officialAnswer.content}
                          </p>
                        </div>
                      )}

                      {/* Footer Info */}
                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-2">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-[11px]">
                              {dateRange ? `청원 기간: ${dateRange}` : "등록일 확인"}
                            </span>
                          </span>
                          {petition.type === "public" && (
                            <span className="text-slate-600 font-medium">
                              동의 참여: <strong className="text-blue-600 font-mono">{petition.agreeCount || 0}</strong> / {petition.goalCount || 50}명
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/petitions/${petition.id}`}
                          className="text-blue-600 font-bold hover:underline flex items-center space-x-1"
                        >
                          <span>청원 상세 보기</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination for authored petitions */}
              <Pagination
                currentPage={myCurrentPage}
                totalPages={myTotalPages}
                onPageChange={setMyCurrentPage}
              />
            </div>
          )
        ) : (
          agreedPetitions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-800">아직 동의(투표)한 청원이 없습니다.</p>
                <p className="text-xs text-slate-500">
                  학생들이 올린 공개청원을 확인하고 학교의 긍정적인 변화에 투표로 동참해보세요!
                </p>
              </div>
              <Link
                href="/#petitions-list"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                <span>공개청원 목록 둘러보기</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedAgreedPetitions.map((petition) => (
                  <PetitionCard key={petition.id} petition={petition} />
                ))}
              </div>

              {/* Pagination for agreed petitions */}
              <Pagination
                currentPage={agreedCurrentPage}
                totalPages={agreedTotalPages}
                onPageChange={setAgreedCurrentPage}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
