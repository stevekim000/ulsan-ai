"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { PetitionCategory, PetitionType, PetitionStatus } from "@/types/petition";
import { cleanStudentName } from "@/lib/petitionUtils";
import Image from "next/image";
import { Send, Info, Lock, Globe, AlertCircle } from "lucide-react";

export default function NewPetitionPage() {
  const router = useRouter();
  const { user, isAdmin, loginWithGoogle, loading: authLoading, schoolDomain } = useAuth();

  const [type, setType] = useState<PetitionType>("public");
  const [category, setCategory] = useState<PetitionCategory>("시설/환경");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [goalCount, setGoalCount] = useState<number>(50);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categories: PetitionCategory[] = ["시설/환경", "학사/수업", "학생복지", "기타"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      setFormError("청원을 제출하려면 먼저 로그인해야 합니다.");
      return;
    }

    if (!title.trim() || title.trim().length < 5) {
      setFormError("제목을 5자 이상 입력해 주세요.");
      return;
    }

    if (!content.trim() || content.trim().length < 20) {
      setFormError("본문 내용은 최소 20자 이상 상세하게 작성해 주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const now = new Date();
      // 14 days deadline
      const expiresAtDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      // Public petitions start as 'pending' for admin review, General petitions start as 'waiting_answer' for direct admin response
      const initialStatus: PetitionStatus =
        type === "general" ? "waiting_answer" : isAdmin ? "active" : "pending";

      const petitionData = {
        title: title.trim(),
        category,
        type,
        content: content.trim(),
        authorId: user.uid,
        authorName: cleanStudentName(user.displayName),
        authorEmail: user.email || "",
        agreeCount: 0,
        goalCount: type === "general" ? 0 : Number(goalCount) || 50,
        status: initialStatus,
        createdAt: serverTimestamp(),
        expiresAt: type === "general" ? null : expiresAtDate,
      };

      const docRef = await addDoc(collection(db, "petitions"), petitionData);
      router.push(`/petitions/${docRef.id}?notice=${type === "general" ? "general" : initialStatus === "pending" ? "pending" : "created"}`);
    } catch (err: any) {
      console.error("Firestore Add Error:", err);
      // If mock key or offline fallback
      setFormError("청원 등록 중 오류가 발생했습니다. (Firebase 연결을 확인해 주세요)");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
              <Image src="/school-logo.png" alt="학교 로고" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span>청원 작성</span>
          </h1>
        </div>

        {/* Login notice if not authenticated */}
        {!user && !authLoading && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 text-xs sm:text-sm">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">로그인이 필요한 서비스입니다.</p>
                <p className="text-amber-700 text-xs">학교 구글 계정(@{schoolDomain})으로 로그인 후 청원을 등록할 수 있습니다.</p>
              </div>
            </div>
            <button
              onClick={() => loginWithGoogle()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shrink-0 transition-colors"
            >
              구글 로그인
            </button>
          </div>
        )}

        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs sm:text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Petition Type */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">청원 구분</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("public")}
                className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3 ${
                  type === "public"
                    ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className={`p-2 rounded-lg ${type === "public" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">공개청원</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    재학생 동의 수집
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType("general")}
                className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3 ${
                  type === "general"
                    ? "border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className={`p-2 rounded-lg ${type === "general" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">일반청원 / 건의</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    비공개 건의 (학생회 담당자 직접 확인 및 처리)
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">청원 카테고리</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    category === cat
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">청원 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 급식실 퇴식구 잔반 처리대 추가 설치 건의"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">청원 본문 내용</label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="청원하게 된 문제점, 제안하는 해결 방안, 기대 효과 등을 구체적으로 적어주세요. (최소 20자 이상)"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all leading-relaxed"
            />
          </div>

          {/* Metadata info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <Info className="w-4 h-4 text-blue-600" />
              <span>청원 처리 자동 설정 안내</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li><strong>관리자 승인 절차:</strong> 일반 사용자가 등록한 청원은 학생회/교사 관리자의 검토 및 승인 후 전교생에게 공개됩니다.</li>
              <li><strong>목표 동의 수:</strong> 50명 (달성 시 답변 대기 상태로 전환)</li>
              <li><strong>동의 마감일:</strong> 작성일 기준 14일 후 자동 설정</li>
              <li>욕설, 비방, 개인신상정보가 포함된 청원은 사전 통보 없이 삭제될 수 있습니다.</li>
            </ul>
          </div>

          {/* Submit button */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={submitting || !user}
              className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                submitting || !user
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-600/20"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "제출 중..." : "청원 등록 완료"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
