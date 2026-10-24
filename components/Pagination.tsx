"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers window (up to 7 or 10 pages displayed at once)
  const maxVisiblePages = 7;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePageClick = (page: number) => {
    if (page === currentPage) return;
    onPageChange(page);
    const target = document.getElementById("petitions-list");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-3 select-none">
      {/* Numeric Pagination Bar */}
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        {/* Previous Button */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center space-x-1 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            currentPage === 1
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>이전</span>
        </button>

        {/* First page jump if startPage > 1 */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageClick(1)}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-1 text-slate-400 text-xs">...</span>
            )}
          </>
        )}

        {/* Page Number Buttons */}
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isCurrent
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Last page jump if endPage < totalPages */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-1 text-slate-400 text-xs">...</span>
            )}
            <button
              onClick={() => handlePageClick(totalPages)}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center space-x-1 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            currentPage === totalPages
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
          }`}
        >
          <span>다음</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Page Summary Info */}
      <p className="text-xs text-slate-400 font-medium">
        전체 {totalPages}페이지 중 {currentPage}페이지
      </p>
    </div>
  );
}
