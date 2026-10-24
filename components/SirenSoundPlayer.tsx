"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, BellRing, Sparkles, AlertOctagon } from "lucide-react";
import { soundSynth } from "@/lib/soundSynthesizer";

export default function SirenSoundPlayer() {
  const [isMorsePlaying, setIsMorsePlaying] = useState<boolean>(false);
  const [flashBeacon, setFlashBeacon] = useState<boolean>(false);

  const handleWhistle = () => {
    soundSynth.playWhistle();
  };

  const handleToggleMorse = () => {
    if (isMorsePlaying) {
      soundSynth.stopSos(setIsMorsePlaying);
    } else {
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
            <span>산악 조난 소리/시각 구조 신호</span>
          </p>
          <span className="text-[10px] text-slate-400">Web Audio 오프라인 합성</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Whistle Button */}
          <button
            onClick={handleWhistle}
            className="p-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Volume2 className="w-4 h-4" />
            <span>고주파 호루라기 (1회)</span>
          </button>

          {/* SOS Morse Code Siren */}
          <button
            onClick={handleToggleMorse}
            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border ${
              isMorsePlaying
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/40 animate-pulse"
                : "bg-red-600/20 hover:bg-red-600/30 border-red-500/40 text-red-300"
            }`}
          >
            {isMorsePlaying ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>SOS 사이렌 정지</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>SOS 모스부호 반복</span>
              </>
            )}
          </button>

          {/* Flash Beacon */}
          <button
            onClick={handleToggleFlash}
            className="p-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-xs font-bold text-indigo-300 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>야간 화면 점멸 비콘</span>
          </button>
        </div>
      </div>
    </>
  );
}
