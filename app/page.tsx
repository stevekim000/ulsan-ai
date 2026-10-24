"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, query, orderBy, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Petition, PetitionCategory, PetitionStatus } from "@/types/petition";
import { PetitionCard } from "@/components/PetitionCard";
import { FilterBar } from "@/components/FilterBar";
import { Pagination } from "@/components/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { getEffectiveStatus, parseDate } from "@/lib/petitionUtils";
import { AlertCircle, PlusCircle, Clock, Lock } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const ITEMS_PER_PAGE = 6;

export default function HomePage() {
  const { user, isAdmin } = useAuth();
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<PetitionStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<PetitionCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    async function fetchPetitions() {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "petitions"));

        const list: Petition[] = snapshot.docs.map((doc: DocumentData) => ({
          id: doc.id,
          ...doc.data(),
        })) as Petition[];

        // Client-side sort by createdAt descending using parseDate
        list.sort((a, b) => {
          const dateA = parseDate(a.createdAt)?.getTime() || 0;
          const dateB = parseDate(b.createdAt)?.getTime() || 0;
          return dateB - dateA;
        });

        setPetitions(list);
      } catch (err) {
        console.error("Firestore fetch error:", err);
        setPetitions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPetitions();
  }, []);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, searchQuery]);

  // Calculate pending review count for admins (public petitions waiting review)
  const pendingCount = petitions.filter(
    (p) => p.type === "public" && getEffectiveStatus(p) === "pending"
  ).length;

  // Calculate waiting answer count for admins (general petitions waiting answer)
  const generalWaitingCount = petitions.filter(
    (p) => p.type === "general" && (getEffectiveStatus(p) === "waiting_answer" || getEffectiveStatus(p) === "pending")
  ).length;

  // Calculate pending review count for logged-in author
  const userPendingCount = user
    ? petitions.filter(
        (p) => p.authorId === user.uid && getEffectiveStatus(p) === "pending"
      ).length
    : 0;
  const hasUserPending = userPendingCount > 0;

  // Filtering Logic
  const filteredPetitions = petitions.filter((item) => {
    const effectiveStatus = getEffectiveStatus(item);

    // 1. General petitions (비공개 일반 건의): 로비(메인) 목록에서는 일반 사용자에게 노출하지 않고 공개청원만 노출 (관리자만 로비에서 확인 가능)
    if (item.type === "general") {
      if (!isAdmin) {
        return false;
      }
      // 일반 건의 중 답변 완료된 청원은 '전체 청원(all)'에는 노출되지 않고 '답변 완료(answered)' 필터에서만 노출
      if (statusFilter === "all" && effectiveStatus === "answered") {
        return false;
      }
    }

    // 2. Pending public petitions (검토 대기중 공개청원): Only visible to admin and author
    if (effectiveStatus === "pending") {
      const isAuthor = user && item.authorId === user.uid;
      if (!isAdmin && !isAuthor) {
        return false;
      }
    }

    // 3. Rejected petitions (반려된 청원 / 답변 거부): Only visible to the author who submitted it or admin
    if (effectiveStatus === "rejected") {
      const isAuthor = user && item.authorId === user.uid;
      if (!isAdmin && !isAuthor) {
        return false;
      }
      // 답변 거부 또는 반려된 청원은 '전체 청원(all)' 칸에서 제외하고 '반려(rejected)' 필터에서만 노출
      if (statusFilter === "all") {
        return false;
      }
    }

    // Status Filter
    if (statusFilter !== "all" && effectiveStatus !== statusFilter) {
      return false;
    }
    // Category Filter
    if (categoryFilter !== "all" && item.category !== categoryFilter) {
      return false;
    }
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || "").toLowerCase().includes(q);
      const matchContent = (item.content || "").toLowerCase().includes(q);
      const matchAuthor = (item.authorName || "").toLowerCase().includes(q);
      return matchTitle || matchContent || matchAuthor;
    }
    return true;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredPetitions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPetitions = filteredPetitions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleResetFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Banner / Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {siteConfig.name}이란?
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl break-keep">
            학생들이 학교생활 속에서 느끼는 불편 사항이나 개선이 필요한 점, 교내 아이디어 등을 직접 제안하고,<br />
            투표를 통해 학생들의 뜻을 모아 학교의 변화를 만들어가는 학생 청원
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/petitions/new"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>청원 작성하기</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div id="petitions-list">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                <Image src="/school-logo.png" alt="학교 로고" width={20} height={20} className="w-full h-full object-cover" />
              </div>
              <span>공개청원 목록</span>
            </h2>
          </div>
          
          <span className="text-xs font-semibold text-slate-600 bg-slate-200/60 px-3 py-1 rounded-full">
            총 {filteredPetitions.length}건
          </span>
        </div>

        {/* Admin Pending Petitions Alert Banner */}
        {isAdmin && pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">검토 대기 중인 청원이 {pendingCount}건 있습니다.</p>
                <p className="text-xs text-amber-700">일반 사용자가 제시한 청원은 관리자의 검토 및 승인을 거쳐 전교생에게 공개됩니다.</p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter("pending")}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 transition-colors shadow-sm whitespace-nowrap"
            >
              검토 대기 청원 확인하기
            </button>
          </div>
        )}

        {/* Admin General Petitions Waiting Answer Alert Banner */}
        {isAdmin && generalWaitingCount > 0 && (
          <div className="bg-purple-50 border border-purple-300 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-purple-900 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-700 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">답변 대기 중인 일반 건의가 {generalWaitingCount}건 있습니다.</p>
                <p className="text-xs text-purple-700">학생들이 작성한 1:1 비공개 건의로, 관리자(학생회/선생님)의 확인 및 답변 작성이 필요합니다.</p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter("waiting_answer")}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shrink-0 transition-colors shadow-sm whitespace-nowrap"
            >
              답변 대기 건의 확인하기
            </button>
          </div>
        )}

        {/* User Author Pending Petitions Alert Banner */}
        {!isAdmin && userPendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">내가 작성한 청원 중 {userPendingCount}건이 관리자 검토 대기 중입니다.</p>
                <p className="text-xs text-amber-700">관리자(학생회/선생님)의 검토 및 승인이 완료되면 모든 학생에게 공개 청원으로 전환됩니다.</p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter("pending")}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 transition-colors shadow-sm whitespace-nowrap"
            >
              내 검토 대기 청원 보기
            </button>
          </div>
        )}

        <FilterBar
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onReset={handleResetFilters}
          isAdmin={isAdmin}
          hasUserPending={hasUserPending}
        />

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-12 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : paginatedPetitions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedPetitions.map((petition) => (
                <PetitionCard key={petition.id} petition={petition} />
              ))}
            </div>

            {/* Google-Style Pagination Bar */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">조건에 맞는 청원이 없습니다.</h3>
            <p className="text-xs text-slate-500">검색어나 선택된 필터를 변경하여 다시 확인해 보세요.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 text-xs font-bold text-blue-600 hover:underline"
            >
              필터 전체 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
