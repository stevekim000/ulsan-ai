"use client";

import React from "react";
import Link from "next/link";
import { Petition } from "@/types/petition";
import { ProgressBar } from "./ProgressBar";
import { useAuth } from "@/hooks/useAuth";
import { getEffectiveStatus, formatPetitionDateRange, getDDayText, cleanStudentName } from "@/lib/petitionUtils";
import { Clock, Users, Lock, Globe, MessageSquare, Calendar } from "lucide-react";

interface PetitionCardProps {
  petition: Petition;
}

export function PetitionCard({ petition }: PetitionCardProps) {
  const { isAdmin } = useAuth();
  const effectiveStatus = getEffectiveStatus(petition);
  const dDay = getDDayText(petition);
  const dateRange = formatPetitionDateRange(petition);
  const authorCleanName = cleanStudentName(petition.authorName);

  // Status style helper
  const getStatusBadge = (status: Petition["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            <span>검토 대기 중</span>
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center space-x-1">
            <span>{petition.type === "general" ? "답변 거부" : "반려"}</span>
          </span>
        );
      case "active":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span>진행 중</span>
          </span>
        );
      case "waiting_answer":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-300 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>답변 대기 중</span>
          </span>
        );
      case "answered":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center space-x-1">
            <MessageSquare className="w-3 h-3 text-emerald-600" />
            <span>답변 완료</span>
          </span>
        );
      case "expired":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-300">
            만료
          </span>
        );
    }
  };

  return (
    <Link
      href={`/petitions/${petition.id}`}
      className="block group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          {getStatusBadge(effectiveStatus)}
          
          <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded border border-slate-200">
            {petition.category}
          </span>

          {petition.type === "general" ? (
            <span className="px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 rounded border border-purple-200 flex items-center space-x-1">
              <Lock className="w-2.5 h-2.5" />
              <span>일반건의</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs font-medium bg-sky-50 text-sky-700 rounded border border-sky-200 flex items-center space-x-1">
              <Globe className="w-2.5 h-2.5" />
              <span>공개청원</span>
            </span>
          )}
        </div>

        {dDay && (
          <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            {dDay}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1 mb-2">
        {petition.title}
      </h3>

      {/* Content Preview */}
      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
        {petition.content}
      </p>

      {/* Progress Bar or General Suggestion Indicator */}
      <div className="mb-4">
        {petition.type === "public" ? (
          <ProgressBar current={petition.agreeCount || 0} goal={petition.goalCount || 50} />
        ) : (
          <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-xs text-purple-700">
            <span className="flex items-center space-x-1 font-medium">
              <Lock className="w-3 h-3" />
              <span>1:1 비공개 일반 건의</span>
            </span>
            <span className="font-bold">
              {petition.status === "answered" ? "답변 완료" : "답변 대기"}
            </span>
          </div>
        )}
      </div>

      {/* Footer Meta Info */}
      <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-100">
        {petition.type === "general" || isAdmin ? (
          <div className="flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>작성자: <span className="font-semibold text-slate-700">{authorCleanName}</span></span>
            {isAdmin && petition.type === "public" && (
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-200">
                관리자
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-[11px]">{dateRange ? `청원 기간: ${dateRange}` : "공개 청원"}</span>
          </div>
        )}

        <span className="text-blue-600 font-semibold group-hover:underline flex items-center">
          자세히 보기 →
        </span>
      </div>
    </Link>
  );
}

