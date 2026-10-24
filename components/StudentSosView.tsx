"use client";

import React, { useState, useEffect } from "react";
import { AlertOctagon, ShieldAlert, HeartHandshake, PhoneCall, CheckCircle, Info, Sparkles, Navigation, Radio, Volume2 } from "lucide-react";
import OfflineCompassBar from "@/components/OfflineCompassBar";
import VoiceLocationAnalyzer from "@/components/VoiceLocationAnalyzer";
import SirenSoundPlayer from "@/components/SirenSoundPlayer";
import { NetworkStatus, LocationPoint, AIEstimateResult } from "@/types/rescue";
import { addTimelineEvent, getTeacherMessages, TeacherBroadcastMessage } from "@/lib/storage";

interface StudentSosViewProps {
  onAiAnalysisDone: (result: AIEstimateResult) => void;
  networkStatus: NetworkStatus;
  setNetworkStatus: (status: NetworkStatus) => void;
}

export default function StudentSosView({
  onAiAnalysisDone,
  networkStatus,
  setNetworkStatus,
}: StudentSosViewProps) {
  const [isSosActive, setIsSosActive] = useState<boolean>(true);
  const [sosSentTime, setSosSentTime] = useState<string>("방금 전 (13:42:05)");
  const [batterySaver, setBatterySaver] = useState<boolean>(true);
  const [teacherMsgs, setTeacherMsgs] = useState<TeacherBroadcastMessage[]>([]);

  useEffect(() => {
    setTeacherMsgs(getTeacherMessages());
    const interval = setInterval(() => {
      setTeacherMsgs(getTeacherMessages());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const mockCurrentLocation: LocationPoint = {
    lat: 33.3605,
    lng: 126.5532,
    altitude: 1485,
    accuracy: 45,
    heading: 275,
    timestamp: Date.now(),
  };

  const handleTriggerSOS = () => {
    setIsSosActive(true);
    setSosSentTime("방금 전");
    addTimelineEvent({
      timestamp: Date.now(),
      title: "학생 단말기 긴급 조난 SOS 버튼 터치",
      content: "김민준 학생이 [긴급 SOS]를 발동했습니다. 현재 한라산 성판악 코스 해발 1,485m 구간.",
      type: "alert",
      actor: "김민준 학생",
    });
  };

  const handleResolve = () => {
    setIsSosActive(false);
    addTimelineEvent({
      timestamp: Date.now(),
      title: "학생 안전 확인 및 대열 복귀",
      content: "인솔 교사 및 산악구조대와 접촉하여 학생이 무사히 구조되었습니다.",
      type: "resolved",
      actor: "산울림 구조팀",
    });
  };

  return (
    <div className={`space-y-6 ${batterySaver ? "bg-slate-950" : "bg-slate-900"} rounded-3xl p-4 sm:p-6 text-white border border-slate-800 transition-colors`}>
      {/* Top Banner: Emergency Status */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isSosActive
          ? "bg-red-950/70 border-red-500/60 shadow-xl shadow-red-950/50"
          : "bg-emerald-950/60 border-emerald-500/40"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 ${
              isSosActive ? "bg-red-600 animate-pulse" : "bg-emerald-600"
            }`}>
              {isSosActive ? <AlertOctagon className="w-7 h-7" /> : <CheckCircle className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  {isSosActive ? "🚨 조난 긴급 SOS 모드 가동 중" : "✅ 안전 상태 (대열 동행 중)"}
                </h2>
                <span className="text-[11px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                  한라산 수학여행
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isSosActive
                  ? `인솔 교사 및 119 구조대에게 위치와 음성이 실시간 공유되고 있습니다. (${sosSentTime})`
                  : "현재 정상적으로 대열에 속해 있습니다."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {isSosActive ? (
              <button
                onClick={handleResolve}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
              >
                구조 완료 (상황 해제)
              </button>
            ) : (
              <button
                onClick={handleTriggerSOS}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95 animate-bounce"
              >
                긴급 조난 SOS 발동
              </button>
            )}
          </div>
        </div>
      </div>

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

      {/* Requirement 1: Offline Compass & GPS Sensor Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-bold flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span>오프라인 GPS 및 환경 센서 (인터넷 두절 상태 지원)</span>
          </span>
          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px]">
            <input
              type="checkbox"
              checked={batterySaver}
              onChange={(e) => setBatterySaver(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600"
            />
            <span className="text-slate-300">비상 배터리 절전 모드</span>
          </label>
        </div>

        <OfflineCompassBar
          currentLocation={mockCurrentLocation}
          networkStatus={networkStatus}
          onNetworkChange={setNetworkStatus}
          batteryLevel={batterySaver ? 32 : 55}
        />
      </div>

      {/* Requirement 2: Voice-to-Landmark AI Engine */}
      <VoiceLocationAnalyzer
        currentAltitude={mockCurrentLocation.altitude}
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
