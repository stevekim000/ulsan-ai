"use client";

import React, { useState, useEffect } from "react";
import { Info, Radio } from "lucide-react";
import VoiceLocationAnalyzer from "@/components/VoiceLocationAnalyzer";
import SirenSoundPlayer from "@/components/SirenSoundPlayer";
import MountainWeatherCard from "@/components/MountainWeatherCard";
import { AIEstimateResult } from "@/types/rescue";
import { getTeacherMessages, TeacherBroadcastMessage } from "@/lib/storage";

interface StudentSosViewProps {
  onAiAnalysisDone: (result: AIEstimateResult) => void;
}

export default function StudentSosView({
  onAiAnalysisDone,
}: StudentSosViewProps) {
  const [teacherMsgs, setTeacherMsgs] = useState<TeacherBroadcastMessage[]>([]);

  useEffect(() => {
    setTeacherMsgs(getTeacherMessages());
    const interval = setInterval(() => {
      setTeacherMsgs(getTeacherMessages());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 bg-slate-950 rounded-3xl p-4 sm:p-6 text-white border border-slate-800">

      {/* Teacher Directive Broadcast Received Banner */}
      {teacherMsgs.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-950/90 to-blue-950/80 border border-indigo-500/50 rounded-2xl p-4 shadow-lg flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
            <Radio className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                <span>📡 {teacherMsgs[0].sender}의 긴급 무전 지침</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono">
                  {new Date(teacherMsgs[0].timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">실시간 수신</span>
            </div>
            <p className="text-xs font-bold text-white bg-black/30 p-2.5 rounded-xl border border-indigo-500/20 leading-relaxed">
              "{teacherMsgs[0].message}"
            </p>
          </div>
        </div>
      )}

      {/* Mountain Real-time Weather & Upcoming Forecast */}
      <MountainWeatherCard variant="student" />

      {/* Voice-to-Landmark AI Engine (테스트용: GPS 고도 미전달, 순수 음성 단서 분석) */}
      <VoiceLocationAnalyzer
        onAnalysisComplete={onAiAnalysisDone}
      />

      {/* Whistle / Siren Audio Tool */}
      <SirenSoundPlayer />

      {/* Mountain Survival Guide (산악 조난 행동 요령) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
        <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
          <Info className="w-4 h-4" />
          <span>산악 조난 시 학생 4대 안전 행동 요령</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <b className="text-white">1. 절대 계곡으로 내려가지 마세요:</b> 계곡은 통신이 전혀 안 터지고 절벽/낙석 위험이 큽니다. 등산로 쪽 능선으로 올라오세요.
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <b className="text-white">2. 현재 위치에서 이동 중지:</b> AI가 위치를 특정했으므로 마구 움직이면 수색팀과 엇갈립니다. 안전한 곳에 대기하세요.
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <b className="text-white">3. 체온 유지 최우선:</b> 한라산 고지대는 기온이 급강하합니다. 여벌 옷을 껴입고 바닥에 비닐이나 배낭을 깔고 앉으세요.
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <b className="text-white">4. 주기적 소리 신호:</b> 위 [호루라기] 버튼이나 입으로 소리를 질러 구조대에 위치를 알리세요.
          </div>
        </div>
      </div>
    </div>
  );
}
