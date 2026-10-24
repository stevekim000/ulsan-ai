"use client";

import React from "react";

interface ProgressBarProps {
  current: number;
  goal: number;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({ current, goal, showDetails = true, size = "md" }: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((current / goal) * 100));

  const heightClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className="w-full">
      {showDetails && (
        <div className="flex justify-between items-center text-xs sm:text-sm mb-1.5 font-medium">
          <span className="text-slate-600">
            동의 진행률 <strong className="text-blue-700 font-bold">{percentage}%</strong>
          </span>
          <span className="text-slate-500">
            <strong className="text-slate-900 font-semibold">{current}명</strong> / {goal}명
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 ${heightClasses[size]}`}>
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
