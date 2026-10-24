"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Mountain, 
  Radio, 
  ShieldCheck, 
  AlertOctagon
} from "lucide-react";
import StudentSosView from "@/components/StudentSosView";
import TeacherCommandView from "@/components/TeacherCommandView";
import NotificationToast, { ToastNotification } from "@/components/NotificationToast";
import { Student, RescueTimelineEvent, AIEstimateResult } from "@/types/rescue";
import { getStoredStudents, getStoredTimeline, saveStudents } from "@/lib/storage";
import { DEFAULT_HIKING_TRAIL } from "@/lib/mountainData";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");
  const [students, setStudents] = useState<Student[]>([]);
  const [timeline, setTimeline] = useState<RescueTimelineEvent[]>([]);
  const [aiEstimate, setAiEstimate] = useState<AIEstimateResult | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 알림 토스트 상태
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setStudents(getStoredStudents());
    setTimeline(getStoredTimeline());
  }, []);

  // 알림 추가
  const addNotification = useCallback((notif: Omit<ToastNotification, "id">) => {
    const newNotif: ToastNotification = {
      ...notif,
      id: "notif-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      timestamp: notif.timestamp || Date.now(),
    };
    setNotifications((prev) => [...prev, newNotif]);
  }, []);

  // 알림 제거
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // 학생 음성 AI 분석 완료 시 상태 갱신
  const handleAiAnalysisDone = (result: AIEstimateResult) => {
    setAiEstimate(result);
    // 학생 위치 및 타임라인 자동 동기화
    setStudents((prev) =>
      prev.map((s) => {
        if (s.status === "emergency") {
          return {
            ...s,
            emergencyVoiceLog: result.analyzedText,
            aiEstimate: result,
            lastLocation: {
              ...s.lastLocation,
              lat: result.estimatedLat,
              lng: result.estimatedLng,
              altitude: result.matchedPOI?.altitude || s.lastLocation.altitude,
              accuracy: result.radiusMeters,
              timestamp: Date.now(),
            },
          };
        }
        return s;
      })
    );

    // 타임라인에 AI 분석 이벤트 추가
    const newEvent: RescueTimelineEvent = {
      id: "tl-" + Date.now(),
      timestamp: Date.now(),
      title: `AI 위치 특정 성공: ${result.matchedPOI?.name}`,
      content: result.timelineExplanation,
      type: "ai_analysis",
      actor: "산울림 AI 엔진",
    };
    setTimeline((prev) => [newEvent, ...prev]);

    // 실시간 토스트 알림 발송
    addNotification({
      type: "ai_analysis",
      title: "AI 음성 위치 특정 성공",
      message: `[${result.matchedPOI?.name}] 반경 ${result.radiusMeters}m 이내로 조난 학생 위치 특정 완료!`,
    });
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Notification Toast System */}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Destination */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-red-600/20 text-white font-black text-xl">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-white">산울림 AI</span>
                <span className="text-[10px] bg-red-600/20 text-red-400 border border-red-600/30 px-2 py-0.5 rounded-full font-bold">
                  {DEFAULT_HIKING_TRAIL.mountainName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                수학여행 산악 조난 긴급 구조 &amp; 안심 관제 플랫폼
              </p>
            </div>
          </div>

          {/* Perspective Role Switcher (학생 / 교사) */}
          <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab("student")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "student"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>학생 SOS 모드</span>
            </button>

            <button
              onClick={() => setActiveTab("teacher")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "teacher"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>교사 관제탑</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">

        {activeTab === "student" && (
          <StudentSosView
            onAiAnalysisDone={handleAiAnalysisDone}
          />
        )}

        {activeTab === "teacher" && (
          <TeacherCommandView
            students={students}
            aiEstimate={aiEstimate}
            onNotification={addNotification}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 산울림 (SanWoolim) AI - 울산 AI 해커톤 출품작</p>
          <p className="text-[11px] text-slate-400">
            공모 주제: <b>존중과 배려로 함께 안심하는 학교 &amp; 소통과 신뢰 구축</b>
          </p>
        </div>
      </footer>
    </div>
  );
}
