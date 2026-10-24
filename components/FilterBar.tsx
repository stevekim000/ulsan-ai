"use client";

import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { PetitionCategory, PetitionStatus } from "@/types/petition";

interface FilterBarProps {
  statusFilter: PetitionStatus | "all";
  setStatusFilter: (status: PetitionStatus | "all") => void;
  categoryFilter: PetitionCategory | "all";
  setCategoryFilter: (category: PetitionCategory | "all") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onReset: () => void;
  isAdmin?: boolean;
  hasUserPending?: boolean;
}

export function FilterBar({
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  onReset,
  isAdmin = false,
  hasUserPending = false,
}: FilterBarProps) {
  const allStatuses: { label: string; value: PetitionStatus | "all" }[] = [
    { label: "전체 청원", value: "all" },
    { label: "검토 대기 중", value: "pending" },
    { label: "진행 중", value: "active" },
    { label: "답변 대기 중", value: "waiting_answer" },
    { label: "답변 완료", value: "answered" },
    { label: "만료", value: "expired" },
    { label: "반려", value: "rejected" },
  ];

  const userStatuses: { label: string; value: PetitionStatus | "all" }[] = hasUserPending
    ? [
        { label: "전체 청원", value: "all" },
        { label: "검토 대기 중", value: "pending" },
        { label: "진행 중", value: "active" },
        { label: "만료", value: "expired" },
      ]
    : [
        { label: "전체 청원", value: "all" },
        { label: "진행 중", value: "active" },
        { label: "만료", value: "expired" },
      ];

  const statuses = isAdmin ? allStatuses : userStatuses;

  const categories: { label: string; value: PetitionCategory | "all" }[] = [
    { label: "전체", value: "all" },
    { label: "시설/환경", value: "시설/환경" },
    { label: "학사/수업", value: "학사/수업" },
    { label: "학생복지", value: "학생복지" },
    { label: "기타", value: "기타" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 mb-6">
      {/* Search Input & Reset */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="청원 제목 또는 내용 검색..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-1.5 px-4 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>필터 초기화</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
        {statuses.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto text-xs">
        {categories.map((cat) => {
          const isActive = categoryFilter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-bold border border-blue-300"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
