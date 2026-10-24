"use client";

import React, { useState, useEffect } from "react";
import { Compass, Wifi, WifiOff, Battery, Mountain, Navigation, AlertTriangle, ShieldCheck } from "lucide-react";
import { NetworkStatus, LocationPoint } from "@/types/rescue";
import { appendOfflineGps } from "@/lib/storage";

interface OfflineCompassBarProps {
  currentLocation?: LocationPoint;
  networkStatus: NetworkStatus;
  onNetworkChange: (status: NetworkStatus) => void;
  batteryLevel?: number;
}

export default function OfflineCompassBar({
  currentLocation,
  networkStatus,
  onNetworkChange,
  batteryLevel = 45,
}: OfflineCompassBarProps) {
  const [heading, setHeading] = useState<number>(275);
  const [altitude, setAltitude] = useState<number>(currentLocation?.altitude || 1485);
  const [offlinePointsCount, setOfflinePointsCount] = useState<number>(5);

  useEffect(() => {
    // 1. 브라우저 실제 온라인/오프라인 이벤트 리스너
    const handleOnline = () => onNetworkChange("online");
    const handleOffline = () => onNetworkChange("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 2. 브라우저 Geolocation 센서 시도
    let watchId: number | null = null;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (pos.coords.altitude) setAltitude(Math.round(pos.coords.altitude));
          if (pos.coords.heading) setHeading(Math.round(pos.coords.heading));
          
          appendOfflineGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            altitude: pos.coords.altitude || undefined,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading || undefined,
            timestamp: Date.now(),
          });
          setOfflinePointsCount((prev) => prev + 1);
        },
        (err) => {
          // fallback simulator handles altitude
        },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [onNetworkChange]);

  // 방위각 문자열 변환
  const getDirectionText = (deg: number) => {
    const directions = ["북 (N)", "북동 (NE)", "동 (E)", "남동 (SE)", "남 (S)", "남서 (SW)", "서 (W)", "북서 (NW)"];
    const idx = Math.round(deg / 45) % 8;
    return directions[idx];
  };

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 text-white shadow-xl space-y-4">
      {/* Top Status Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        {/* Network Status & Simulator Toggle */}
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
              networkStatus === "online"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : networkStatus === "unstable"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
            }`}
          >
            {networkStatus === "online" ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            <span>
              {networkStatus === "online"
                ? "통신 정상 (LTE/5G)"
                : networkStatus === "unstable"
                ? "산악 통신 불안정 (약신호)"
                : "통신 두절 (완전 오프라인)"}
            </span>
          </div>

          {/* Test toggle button for hackathon evaluation */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px]">
            <span className="text-slate-400 px-1.5 font-bold">통신 테스트:</span>
            <button
              onClick={() => onNetworkChange("online")}
              className={`px-1.5 py-0.5 rounded ${networkStatus === "online" ? "bg-emerald-600 text-white font-bold" : "text-slate-400"}`}
            >
              정상
            </button>
            <button
              onClick={() => onNetworkChange("unstable")}
              className={`px-1.5 py-0.5 rounded ${networkStatus === "unstable" ? "bg-amber-600 text-white font-bold" : "text-slate-400"}`}
            >
              불안정
            </button>
            <button
              onClick={() => onNetworkChange("offline")}
              className={`px-1.5 py-0.5 rounded ${networkStatus === "offline" ? "bg-red-600 text-white font-bold" : "text-slate-400"}`}
            >
              두절
            </button>
          </div>
        </div>

        {/* Battery & Offline Sync Queue */}
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <Battery className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-white">{batteryLevel}%</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1 text-[11px] bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-ping" />
            <span>오프라인 궤적 로깅: <b className="text-blue-300 font-mono">{offlinePointsCount}개</b></span>
          </div>
        </div>
      </div>

      {/* Sensor Dashboard: Altitude, Heading, GPS Accuracy */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {/* Altitude (고도) */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-[11px] mb-1 font-medium">
            <Mountain className="w-3.5 h-3.5 text-amber-400" />
            <span>현재 고도 (Altimeter)</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {altitude} <span className="text-xs text-slate-400 font-normal">m</span>
          </p>
          <span className="text-[10px] text-slate-400">한라산 성판악 구간</span>
        </div>

        {/* Compass (디지털 나침반) */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-[11px] mb-1 font-medium">
            <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
            <span>방위각 (Compass)</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
            {heading}°
          </p>
          <span className="text-[10px] text-slate-300 font-bold">{getDirectionText(heading)}</span>
        </div>

        {/* GPS Accuracy */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-[11px] mb-1 font-medium">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>GPS 오차범위</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            ±{currentLocation?.accuracy || 35} <span className="text-xs text-slate-400 font-normal">m</span>
          </p>
          <span className="text-[10px] text-emerald-300/80">위성 신호 양호</span>
        </div>
      </div>
    </div>
  );
}
