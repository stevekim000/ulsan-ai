"use client";

import React from "react";
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  PhoneCall, 
  Sparkles, 
  MessageSquare,
  FileText,
  HeartHandshake
} from "lucide-react";
import { RescueTimelineEvent, Student } from "@/types/rescue";

interface ParentTrustReportProps {
  timeline: RescueTimelineEvent[];
  emergencyStudent?: Student;
}

export default function ParentTrustReport({
  timeline,
  emergencyStudent,
}: ParentTrustReportProps) {
  return (
    <div className="space-y-6 text-white">
      {/* Top Trust & Empathy Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                <HeartHandshake className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-black text-white">
                학부모 실시간 안심 투명 리포트
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                공식 신뢰 채널
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed break-keep">
              수학여행 중 발생하는 학생의 모든 안전 조치 상황을 교직원과 학부모가 <b>1초의 왜곡이나 은폐 없이 투명하게 공유</b>하여 불안을 해소하고 상호 신뢰를 형성합니다.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">현장 책임 인솔교사</span>
              <span className="font-extrabold text-white">김선생 교사 외 2명</span>
            </div>
            <a
              href="tel:010-0000-0000"
              className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-colors"
              title="학교 상황실 직통 연락"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Active Incident Status for Parents */}
      {emergencyStudent && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping inline-block" />
              <h3 className="text-sm font-extrabold text-amber-300">
                실시간 조난 학생 수색 및 보호 현황
              </h3>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold">
              구조팀 현장 출동 중
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">대상 학생</span>
              <span className="font-bold text-white text-sm">
                2학년 3반 {emergencyStudent.name}
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">AI 정밀 추정 위치</span>
              <span className="font-bold text-blue-400 text-sm">
                진달래밭 대피소 인근 (해발 1,500m)
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">학생 음성 상태</span>
              <span className="font-bold text-emerald-400 text-sm">
                의식 명료 · 음성 제보 정상 수신
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Transparent Action Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-extrabold text-white">
              실시간 사건 대응 및 구조 조치 타임라인
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            실시간 업데이트 중
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {timeline.map((evt) => {
            const isAlert = evt.type === "alert";
            const isAI = evt.type === "ai_analysis";
            const isRescue = evt.type === "rescue_team";

            const timeStr = new Date(evt.timestamp).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            return (
              <div key={evt.id} className="relative group">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                    isAlert
                      ? "bg-red-500 ring-4 ring-red-500/20"
                      : isAI
                      ? "bg-blue-500 ring-4 ring-blue-500/20"
                      : isRescue
                      ? "bg-amber-500 ring-4 ring-amber-500/20"
                      : "bg-emerald-500 ring-4 ring-emerald-500/20"
                  }`}
                />

                <div className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl transition-all space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-white flex items-center gap-2">
                      {isAI && <Sparkles className="w-4 h-4 text-blue-400" />}
                      {isRescue && <Radio className="w-4 h-4 text-amber-400" />}
                      <span>{evt.title}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {timeStr} · <b className="text-indigo-300 font-normal">{evt.actor}</b>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {evt.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
