"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CloudRain,
  CloudFog,
  Sun,
  Cloud,
  CloudLightning,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  RefreshCw,
  AlertTriangle,
  Clock,
  Calendar,
  Compass,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MountainWeatherResponse, WeatherIconType } from "@/types/weather";

interface MountainWeatherCardProps {
  variant?: "student" | "teacher";
  className?: string;
  defaultExpanded?: boolean;
}

export default function MountainWeatherCard({
  variant = "student",
  className = "",
  defaultExpanded = true,
}: MountainWeatherCardProps) {
  const [weather, setWeather] = useState<MountainWeatherResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"hourly" | "daily">("hourly");
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/weather");
      if (res.ok) {
        const data: MountainWeatherResponse = await res.json();
        setWeather(data);
        setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch (e) {
      console.error("Failed to load weather data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    // 3분마다 자동 기상 업데이트
    const timer = setInterval(fetchWeather, 180000);
    return () => clearInterval(timer);
  }, [fetchWeather]);

  const renderWeatherIcon = (iconType: WeatherIconType, className = "w-6 h-6") => {
    switch (iconType) {
      case "clear":
        return <Sun className={`${className} text-amber-400 animate-spin-slow`} />;
      case "partly_cloudy":
        return <Sun className={`${className} text-amber-300`} />;
      case "cloudy":
        return <Cloud className={`${className} text-slate-300`} />;
      case "fog":
        return <CloudFog className={`${className} text-sky-300 animate-pulse`} />;
      case "drizzle":
      case "rain":
        return <CloudRain className={`${className} text-blue-400`} />;
      case "heavy_rain":
        return <CloudRain className={`${className} text-indigo-400 animate-bounce`} />;
      case "snow":
        return <CloudSnow className={`${className} text-cyan-200`} />;
      case "storm":
        return <CloudLightning className={`${className} text-amber-300 animate-pulse`} />;
      default:
        return <Cloud className={`${className} text-slate-300`} />;
    }
  };

  const getRiskBadgeColor = (level: "normal" | "caution" | "warning" | "danger") => {
    switch (level) {
      case "danger":
        return "bg-red-500/20 text-red-400 border-red-500/40 shadow-red-500/20";
      case "warning":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20";
      case "caution":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-yellow-500/20";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20";
    }
  };

  if (!weather && loading) {
    return (
      <div className={`p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-center space-x-3 text-slate-400 text-xs ${className}`}>
        <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
        <span>한라산 실시간 기상 위성 데이터 수신 중...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div
      className={`bg-gradient-to-br from-slate-900/95 via-slate-950 to-blue-950/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
            {renderWeatherIcon(weather.current.iconType, "w-4 h-4 text-white")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <span>한라산 고지대 실시간 기상 &amp; 앞으로의 예보</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                  위성 실시간
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>{weather.locationName}</span>
              <span className="text-slate-600">•</span>
              <span>기준: {weather.updatedAt}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={fetchWeather}
            disabled={loading}
            title="기상 데이터 새로고침"
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/50 text-xs flex items-center gap-1"
          >
            <span className="text-[10px] hidden sm:inline font-bold">
              {isExpanded ? "접기" : "앞으로의 날씨 보기"}
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Weather Card Body */}
      <div className="p-4 space-y-4">
        {/* Current Weather Highlight Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Temperature & Condition Main Banner (5 cols) */}
          <div className="sm:col-span-5 bg-gradient-to-r from-blue-950/40 to-slate-900/60 border border-blue-500/20 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                {renderWeatherIcon(weather.current.iconType, "w-8 h-8")}
              </div>
              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-white tracking-tight">
                    {weather.current.temperature}°C
                  </span>
                  <span className="text-xs text-sky-300 font-bold">
                    {weather.current.conditionText}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-300">
                  <Thermometer className="w-3 h-3 text-red-400" />
                  <span>체감온도 <b>{weather.current.apparentTemperature}°C</b></span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black border ${getRiskBadgeColor(
                  weather.mountainRisk.level
                )}`}
              >
                {weather.mountainRisk.level === "danger"
                  ? "산악 위험"
                  : weather.mountainRisk.level === "warning"
                  ? "산악 주의보"
                  : weather.mountainRisk.level === "caution"
                  ? "기상 변동"
                  : "기상 양호"}
              </span>
            </div>
          </div>

          {/* Environmental Metrics (7 cols) */}
          <div className="sm:col-span-7 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-0.5">
              <div className="flex items-center justify-center space-x-1 text-sky-400 text-[10px] font-bold">
                <Droplets className="w-3 h-3" />
                <span>습도/안개</span>
              </div>
              <p className="text-sm font-black text-white">{weather.current.humidity}%</p>
              <p className="text-[9px] text-slate-400">
                {weather.current.humidity >= 90 ? "짙은 안개 발생" : "보통"}
              </p>
            </div>

            <div className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-0.5">
              <div className="flex items-center justify-center space-x-1 text-teal-400 text-[10px] font-bold">
                <Wind className="w-3 h-3" />
                <span>풍속 / 돌풍</span>
              </div>
              <p className="text-sm font-black text-white">
                {weather.current.windSpeed} <span className="text-[10px] font-normal text-slate-400">km/h</span>
              </p>
              <p className="text-[9px] text-amber-400 font-bold">
                최대 {weather.current.windGusts}km/h
              </p>
            </div>

            <div className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-0.5">
              <div className="flex items-center justify-center space-x-1 text-indigo-400 text-[10px] font-bold">
                <CloudRain className="w-3 h-3" />
                <span>현재 강수량</span>
              </div>
              <p className="text-sm font-black text-white">
                {weather.current.precipitationMm} <span className="text-[10px] font-normal text-slate-400">mm</span>
              </p>
              <p className="text-[9px] text-slate-400">
                {weather.current.precipitationMm > 0 ? "우천 진행 중" : "비 안 옴"}
              </p>
            </div>
          </div>
        </div>

        {/* Mountain Safety Risk & Action Advice Banner */}
        <div
          className={`p-3 rounded-xl border flex items-start space-x-2.5 text-xs ${
            weather.mountainRisk.level === "danger"
              ? "bg-red-950/50 border-red-500/40 text-red-200"
              : weather.mountainRisk.level === "warning"
              ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
              : "bg-slate-950/60 border-slate-800 text-slate-300"
          }`}
        >
          <div className="p-1 rounded-lg bg-black/30 shrink-0 mt-0.5">
            <AlertTriangle
              className={`w-4 h-4 ${
                weather.mountainRisk.level === "danger"
                  ? "text-red-400"
                  : weather.mountainRisk.level === "warning"
                  ? "text-amber-400"
                  : "text-blue-400"
              }`}
            />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-white">
                {weather.mountainRisk.title}
              </span>
              <span className="text-[10px] text-slate-400">
                {variant === "teacher" ? "교사 관제 권고사항" : "조난 학생 안전 수칙"}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {variant === "teacher"
                ? weather.mountainRisk.teacherDirective
                : weather.mountainRisk.studentTip}
            </p>
          </div>
        </div>

        {/* Expandable "앞으로의 날씨 (Upcoming Forecast)" Section */}
        {isExpanded && (
          <div className="pt-2 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200">
            {/* Forecast Navigation Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="font-black text-slate-200 flex items-center gap-1">
                  <span>📅 앞으로의 날씨 예보</span>
                </span>
              </div>

              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setActiveTab("hourly")}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeTab === "hourly"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>시간대별 (12시간)</span>
                </button>

                <button
                  onClick={() => setActiveTab("daily")}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                    activeTab === "daily"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>주간/일별 (3일간)</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Hourly Forecast (Next 12 Hours Strip) */}
            {activeTab === "hourly" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>지금부터 향후 12시간 동안의 산악 기상 변화</span>
                  <span>좌우 스크롤 ➜</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                  {weather.hourly.map((hour, idx) => (
                    <div
                      key={hour.isoTime || idx}
                      className={`shrink-0 w-20 p-2.5 rounded-xl border text-center transition-all ${
                        idx === 0
                          ? "bg-blue-950/60 border-blue-500/50 shadow-md shadow-blue-500/20"
                          : "bg-slate-950/70 border-slate-800/90 hover:border-slate-700"
                      }`}
                    >
                      <p className="text-[11px] font-black text-slate-300">
                        {hour.timeStr}
                      </p>
                      <div className="my-1.5 flex justify-center">
                        {renderWeatherIcon(hour.iconType, "w-6 h-6")}
                      </div>
                      <p className="text-xs font-black text-white">{hour.temperature}°C</p>
                      <p className="text-[10px] text-slate-400">{hour.conditionText}</p>

                      {/* Rain Probability Badge */}
                      <div className="mt-2 pt-1 border-t border-slate-800/80">
                        <div className="flex items-center justify-center space-x-0.5 text-[9px]">
                          <CloudRain className="w-2.5 h-2.5 text-blue-400" />
                          <span
                            className={`font-black ${
                              hour.precipitationProbability >= 70
                                ? "text-blue-300"
                                : hour.precipitationProbability >= 40
                                ? "text-cyan-400"
                                : "text-slate-400"
                            }`}
                          >
                            {hour.precipitationProbability}%
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {hour.windSpeed}km/h
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Daily Forecast (Next 3 Days List) */}
            {activeTab === "daily" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {weather.daily.map((day, idx) => (
                  <div
                    key={day.isoDate || idx}
                    className="p-3 bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-xl space-y-2 text-center"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{day.dateStr}</span>
                      <span className="text-[10px] text-slate-400">{day.conditionText}</span>
                    </div>

                    <div className="flex items-center justify-center space-x-2 my-1">
                      {renderWeatherIcon(day.iconType, "w-7 h-7")}
                      <div className="text-left">
                        <span className="text-sm font-black text-white">{day.maxTemp}°C</span>
                        <span className="text-xs text-slate-400 ml-1">/ {day.minTemp}°C</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 text-[10px] text-slate-400">
                      <div>
                        <span>최고 강수확률: </span>
                        <b className="text-blue-300">{day.maxPrecipitationProb}%</b>
                      </div>
                      <div>
                        <span>최대 풍속: </span>
                        <b className="text-teal-300">{day.maxWindSpeed}km/h</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
