"use client";

import React from "react";
import { 
  CheckCircle2, 
  MapPin, 
  Navigation, 
  HelpCircle, 
  Mountain, 
  ArrowRight,
  ShieldCheck,
  Check,
  Compass,
  AlertCircle
} from "lucide-react";
import { LocationCandidate } from "@/types/rescue";
import { TrailName } from "@/lib/mountainData";

interface CourseCandidatesViewProps {
  candidates: LocationCandidate[];
  selectedCourse?: TrailName;
  userSelectedConfirmed?: boolean;
  onSelectCourse: (course: TrailName) => void;
  onFocusMap?: (candidate: LocationCandidate) => void;
}

export default function CourseCandidatesView({
  candidates,
  selectedCourse,
  userSelectedConfirmed,
  onSelectCourse,
  onFocusMap,
}: CourseCandidatesViewProps) {
  if (!candidates || candidates.length === 0) return null;

  const getCourseColor = (course: TrailName) => {
    switch (course) {
      case "영실": return "border-amber-500/50 bg-amber-950/20 text-amber-400";
      case "성판악": return "border-emerald-500/50 bg-emerald-950/20 text-emerald-400";
      case "관음사": return "border-blue-500/50 bg-blue-950/20 text-blue-400";
      case "어리목": return "border-purple-500/50 bg-purple-950/20 text-purple-400";
      case "돈내코": return "border-cyan-500/50 bg-cyan-950/20 text-cyan-400";
      default: return "border-slate-700 bg-slate-900 text-slate-300";
    }
  };

  const getCourseBadgeBg = (course: TrailName) => {
    switch (course) {
      case "영실": return "bg-amber-500 text-slate-950";
      case "성판악": return "bg-emerald-500 text-slate-950";
      case "관음사": return "bg-blue-500 text-white";
      case "어리목": return "bg-purple-500 text-white";
      case "돈내코": return "bg-cyan-500 text-slate-950";
      default: return "bg-slate-700 text-white";
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <span>한라산 5대 코스 위치 후보군 (분산 추정)</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              {candidates.length}개 코스 독립 비교
            </span>
          </h3>
          <p className="text-[11px] text-slate-400">
            고도 단일 정보의 불확실성을 반영하여 5대 코스에 동일한 초기 후보 점수(각 20%)를 배정했습니다. 지형 특징을 비교해 확인하세요.
          </p>
        </div>

        {userSelectedConfirmed && selectedCourse && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>탐방객 선택: [{selectedCourse} 코스] 우선 타깃 설정됨</span>
          </div>
        )}
      </div>

      {/* 5 Course Independent Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {candidates.map((cand) => {
          const isSelected = selectedCourse === cand.course;

          return (
            <div
              key={cand.course}
              className={`rounded-2xl border p-4 shadow-xl transition-all duration-200 flex flex-col justify-between space-y-3.5 ${
                isSelected
                  ? "bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/50 shadow-emerald-950/40"
                  : "bg-slate-950/80 border-slate-800/90 hover:border-slate-700"
              }`}
            >
              <div className="space-y-3">
                {/* Card Top: Rank & Course Badge & Scores */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-white font-black text-xs flex items-center justify-center border border-slate-700">
                      {cand.rank}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${getCourseBadgeBg(cand.course)}`}>
                      {cand.course} 코스
                    </span>
                  </div>

                  {/* Separate Scores: Candidate Score vs Location Confidence */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[10px] text-slate-400">후보 점수:</span>
                      <span className="text-xs font-black text-amber-300 font-mono">
                        {cand.candidateScore}점
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-[10px] text-slate-400">위치 신뢰도:</span>
                      <span className="text-xs font-bold text-sky-400 font-mono">
                        {cand.locationConfidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estimated Area & Representative Landmark */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">추정 구역:</span>
                    <span className="font-bold text-white text-right">{cand.estimatedArea}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">대표 랜드마크:</span>
                    <span className="font-black text-amber-300 text-right">{cand.keyLandmark}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">고도 범위:</span>
                    <span className="font-mono text-slate-300">{cand.altitudeRange}</span>
                  </div>
                </div>

                {/* Terrain, Vegetation & Elevation Features */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="text-[11px] leading-relaxed">
                    <b className="text-slate-200">주변 지형 및 바닥:</b> {cand.terrainState}
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    <b className="text-slate-200">식생 및 환경:</b> {cand.vegetation}
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    <b className="text-slate-200">고도 지형 특징:</b> {cand.elevationFeature}
                  </div>
                </div>

                {/* Checklist (위치 추정 도움 체크리스트) */}
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-sky-400" />
                    <span>현장 식별 체크리스트:</span>
                  </p>
                  <ul className="space-y-1">
                    {cand.checklist.map((item, idx) => (
                      <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <span className="text-sky-400 mt-0.5">•</span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Additional Verification Question */}
                {cand.additionalQuestions && cand.additionalQuestions.length > 0 && (
                  <div className="text-[10px] text-amber-300/90 bg-amber-950/20 border border-amber-500/20 p-2 rounded-lg">
                    <b>추가 확인 질문:</b> {cand.additionalQuestions[0]}
                  </div>
                )}
              </div>

              {/* Card Bottom Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onFocusMap && onFocusMap(cand)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>지도 확인</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectCourse(cand.course)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-emerald-600/30 ring-1 ring-emerald-400"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>선택 완료됨</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>아! 이 코스 같다!</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Critical Verification Policy Notice */}
      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <b>안전 원칙:</b> 탐방객이 코스를 수동 선택하더라도 미검증 상태에서 정확도를 98%로 강제 부여하지 않으며, 실제 위치 신뢰도(35%)와 사용자 선택 여부를 명확히 구분하여 관제합니다.
          </span>
        </div>
      </div>
    </div>
  );
}
