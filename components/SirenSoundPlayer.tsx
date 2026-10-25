"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, BellRing, Sparkles, AlertOctagon, Radio } from "lucide-react";
import { soundSynth } from "@/lib/soundSynthesizer";

export default function SirenSoundPlayer() {
  const [isMorsePlaying, setIsMorsePlaying] = useState<boolean>(false);
  const [isDualTonePlaying, setIsDualTonePlaying] = useState<boolean>(false);
  const [isWhistlePlaying, setIsWhistlePlaying] = useState<boolean>(false);
  const [flashBeacon, setFlashBeacon] = useState<boolean>(false);

  const handleTripleWhistle = () => {
    setIsWhistlePlaying(true);
    soundSynth.playTripleWhistle();
    setTimeout(() => {
      setIsWhistlePlaying(false);
    }, 1500);
  };

  const handleToggleDualTone = () => {
    if (isDualTonePlaying) {
      soundSynth.stopDualToneSiren(setIsDualTonePlaying);
    } else {
      // 다른 소리가 켜져있으면 정리
      if (isMorsePlaying) soundSynth.stopSos(setIsMorsePlaying);
      soundSynth.startDualToneSiren(setIsDualTonePlaying);
    }
  };

  const handleToggleMorse = () => {
    if (isMorsePlaying) {
      soundSynth.stopSos(setIsMorsePlaying);
    } else {
      if (isDualTonePlaying) soundSynth.stopDualToneSiren(setIsDualTonePlaying);
      soundSynth.startSosMorse(setIsMorsePlaying);
    }
  };

  const handleToggleFlash = () => {
    setFlashBeacon(!flashBeacon);
  };

  return (
    <>
      {/* Full screen flashing beacon mode when activated */}
      {flashBeacon && (
        <div
          onClick={handleToggleFlash}
          className="fixed inset-0 z-[9999] bg-white animate-pulse flex flex-col items-center justify-center p-6 cursor-pointer"
        >
          <div className="bg-red-600 text-white font-black px-6 py-4 rounded-3xl text-xl shadow-2xl flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 animate-spin" />
            <span>야간 구조 비콘 점멸 중! (화면 터치 시 종료)</span>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-white space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <BellRing className="w-4 h-4 text-amber-400" />
            <span>Web Audio 산악 조난 긴급 신호기 (핵심 기능 F)</span>
          </p>
          <span className="text-[10px] text-slate-400">외부 파일 없이 브라우저 즉시 합성</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {/* 1. 구조 신호 호루라기 (2.8kHz 3회 반복) */}
          <button
            onClick={handleTripleWhistle}
            disabled={isWhistlePlaying}
            className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border ${
              isWhistlePlaying
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 animate-pulse"
                : "bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/40 text-amber-300"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" />
              <span>구조 호루라기</span>
            </div>
            <span className="text-[9px] opacity-80">2.8kHz 3회 연속 패턴</span>
          </button>

          {/* 2. 비상 듀얼톤 사이렌 (650Hz / 950Hz) */}
          <button
            onClick={handleToggleDualTone}
            className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border ${
              isDualTonePlaying
                ? "bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/40 animate-pulse"
                : "bg-red-600/20 hover:bg-red-600/30 border-red-500/40 text-red-300"
            }`}
          >
            <div className="flex items-center gap-1.5">
              {isDualTonePlaying ? <VolumeX className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
              <span>{isDualTonePlaying ? "듀얼톤 사이렌 정지" : "비상 듀얼톤 사이렌"}</span>
            </div>
            <span className="text-[9px] opacity-80">650Hz ↔ 950Hz 교차</span>
          </button>

          {/* 3. SOS Morse Code Siren */}
          <button
            onClick={handleToggleMorse}
            className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border ${
              isMorsePlaying
                ? "bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/40 animate-pulse"
                : "bg-rose-600/20 hover:bg-rose-600/30 border-rose-500/40 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-1.5">
              {isMorsePlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMorsePlaying ? "SOS 모스 정지" : "SOS 모스부호"}</span>
            </div>
            <span className="text-[9px] opacity-80">... --- ... 반복</span>
          </button>

          {/* 4. Flash Beacon */}
          <button
            onClick={handleToggleFlash}
            className="p-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-xs font-bold text-indigo-300 flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>화면 점멸 비콘</span>
            </div>
            <span className="text-[9px] opacity-80">야간 백색 최대 밝기</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 leading-tight">
          * 본 신호 발생기는 현장 보조 도구이며, 구조를 보장하지 않습니다. 위급 상황 시 119 등 공식 긴급 구조 수단 연결을 최우선으로 하십시오.
        </p>
      </div>
    </>
  );
}
