"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Users, 
  MapPin, 
  PhoneCall, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  CloudFog, 
  Navigation,
  Send,
  Radio,
  FileCheck2
} from "lucide-react";
import MountainMap from "@/components/MountainMap";
import { Student, AIEstimateResult } from "@/types/rescue";
import { addTimelineEvent, addTeacherMessage, getTeacherMessages, TeacherBroadcastMessage } from "@/lib/storage";

interface TeacherCommandViewProps {
  students: Student[];
  aiEstimate?: AIEstimateResult | null;
  onNotification?: (notif: {
    type: "alert" | "ai_analysis" | "rescue_team" | "resolved" | "info";
    title: string;
    message: string;
  }) => void;
}

export default function TeacherCommandView({
  students,
  aiEstimate,
  onNotification,
}: TeacherCommandViewProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);
  const [dispatch119Done, setDispatch119Done] = useState<boolean>(false);
  const [customMsg, setCustomMsg] = useState<string>("");
  const [sentMessages, setSentMessages] = useState<TeacherBroadcastMessage[]>([]);

  useEffect(() => {
    setSentMessages(getTeacherMessages());
  }, []);

  const emergencyStudents = students.filter((s) => s.status === "emergency");
  const safeStudents = students.filter((s) => s.status === "safe");

  const handleDispatch119 = () => {
    setDispatch119Done(true);
    const event = {
      timestamp: Date.now(),
      title: "인솔교사, 119 산악구조대에 AI 추정 정밀 좌표 긴급 전송",
      content: `인솔교사가 119 상황실로 김민준 학생의 AI 위치 추정 데이터(진달래밭 대피소 반경 35m) 및 음성 녹취록을 전달했습니다. 구조팀 출동 개시.`,
      type: "rescue_team" as const,
      actor: "인솔교사 김선생",
    };
    addTimelineEvent(event);

    if (onNotification) {
      onNotification({
        type: "rescue_team",
        title: "119 산악구조대 긴급 출동 접수",
        message: "김민준 학생의 AI 정밀 추정 좌표 및 녹취록이 119 상황실에 전송되어 구조팀이 현장으로 긴급 출동했습니다.",
      });
    }
  };

  const handleSendTeacherMessage = (textToSend?: string) => {
    const text = (textToSend || customMsg).trim();
    if (!text) return;

    const newMsg = addTeacherMessage(text, "인솔교사 김선생");
    setSentMessages((prev) => [newMsg, ...prev]);
    setCustomMsg("");

    addTimelineEvent({
      timestamp: Date.now(),
      title: "인솔교사 안심 무전 발송",
      content: `인솔교사가 조난 학생에게 긴급 안전 지침을 전달했습니다: "${text}"`,
      type: "teacher_action",
      actor: "인솔교사 김선생",
    });

    if (onNotification) {
      onNotification({
        type: "info",
        title: "조난 학생에게 무전 발송 완료",
        message: `"${text}" 지침이 학생 단말기에 즉시 전달되었습니다.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Incident Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm text-white">
          <p className="text-[11px] text-slate-400 font-medium">전체 인솔 학생</p>
          <p className="text-2xl font-black text-white mt-0.5">{students.length}명</p>
          <span className="text-[10px] text-blue-400">울산중앙고 2학년 3반</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm text-white">
          <p className="text-[11px] text-emerald-400 font-medium">정상 대열 동행</p>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">{safeStudents.length}명</p>
          <span className="text-[10px] text-slate-400">속밭~사라오름 구간</span>
        </div>

        <div className="bg-slate-900 border border-red-500/40 p-4 rounded-2xl shadow-sm text-white bg-red-950/20">
          <p className="text-[11px] text-red-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block"></span>
            조난/이탈 발생
          </p>
          <p className="text-2xl font-black text-red-400 mt-0.5">{emergencyStudents.length}명</p>
          <span className="text-[10px] text-red-300">김민준 (진달래밭 부근)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm text-white">
          <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
            <CloudFog className="w-3.5 h-3.5 text-amber-400" />
            현지 기상 (1500m)
          </p>
          <p className="text-xl font-black text-white mt-0.5">7°C · 짙은 안개</p>
          <span className="text-[10px] text-slate-400">풍속 8.2m/s, 시야 20m 미만</span>
        </div>
      </div>

      {/* Emergency Active Alert & AI Location Dispatch Banner */}
      {emergencyStudents.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border border-red-500/60 rounded-3xl p-5 shadow-2xl text-white space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-500/20 pb-4">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30 animate-pulse">
                <Radio className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-extrabold text-white">
                    긴급 조난 감지: {emergencyStudents[0].name} (학번 {emergencyStudents[0].studentNumber})
                  </span>
                  <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
                    GPS & 음성 수신
                  </span>
                </div>
                <p className="text-xs text-red-200">
                  학생 단말기 배터리 {emergencyStudents[0].battery}% | 통신 상태: 산악 약신호 (간헐적 궤적 수신)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleDispatch119}
                disabled={dispatch119Done}
                className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center space-x-2 transition-all shadow-lg active:scale-95 ${
                  dispatch119Done
                    ? "bg-emerald-600 text-white shadow-emerald-600/30"
                    : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 animate-bounce"
                }`}
              >
                {dispatch119Done ? (
                  <>
                    <FileCheck2 className="w-4 h-4" />
                    <span>119 출동 접수 완료</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    <span>119 구조대 AI 좌표 즉시 전송</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Voice Analysis & Localization Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-2">
              <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <span>🎙️ 학생의 실시간 음성 신고 내용:</span>
              </p>
              <p className="text-xs text-slate-200 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                "{emergencyStudents[0].emergencyVoiceLog}"
              </p>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                <span>AI가 포착한 핵심 단서:</span>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                  해발 1500m 팻말
                </span>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-bold">
                  대피소 건물
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
                  짙은 안개 (시야 불량)
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-950/40 to-slate-950/70 border border-blue-500/30 p-4 rounded-2xl space-y-2">
              <p className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>AI 등산로 랜드마크 분석 결과:</span>
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">특정 위치:</span>
                  <span className="font-extrabold text-white">
                    {aiEstimate?.matchedPOI?.name || "한라산 진달래밭 대피소 (해발 1,500m)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">수색 추천 반경:</span>
                  <span className="font-bold text-red-400">
                    반경 {aiEstimate?.radiusMeters || 35}m 이내 집중 수색
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">매칭 신뢰도:</span>
                  <span className="font-bold text-emerald-400">
                    {aiEstimate?.confidence || 94}% (고도 팻말 일치)
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-blue-200/90 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 mt-1">
                👉 인솔교사 조치 가이드: 진달래밭 대피소 상주 인원에게 무전 연락 후, 대피소 앞 데크 쉼터 쪽으로 이동 지시
              </p>
            </div>
          </div>

          {/* Teacher Directive & Reassurance Broadcast Panel */}
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-indigo-500/20 text-indigo-400">
                  <Radio className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-white">
                  조난 학생 단말기 비상 무전 지침 발송 (인터넷 두절 시에도 패킷 축적 수신)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                수신 대상: {emergencyStudents[0]?.name || "김민준 학생"}
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[
                "민준아, 119 구조대와 함께 가고 있다. 절대로 이동하지 말고 체온 유지해라!",
                "바람을 피해 비닐이나 돗자리를 깔고 쉼터 쪽에 대기하렴.",
                "10분마다 호루라기를 3번씩 길게 불어 구조 신호를 유지해줘.",
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendTeacherMessage(preset)}
                  className="text-[11px] bg-slate-900 hover:bg-indigo-950/70 border border-slate-700/80 hover:border-indigo-500/50 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition-all text-left"
                >
                  💬 {preset}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendTeacherMessage()}
                placeholder="직접 무전 지침을 입력하세요 (예: 계곡으로 가지 마라, 빨간 재킷을 흔들어라 등)"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleSendTeacherMessage()}
                disabled={!customMsg.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1 transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>무전 발송</span>
              </button>
            </div>

            {/* Recent Sent Log */}
            {sentMessages.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-400 block font-medium">최근 학생에게 전달된 무전 지침:</span>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {sentMessages.slice(0, 3).map((m) => (
                    <div key={m.id} className="text-[11px] text-indigo-200 bg-indigo-950/40 border border-indigo-900/50 px-2.5 py-1 rounded-lg flex items-center justify-between gap-2">
                      <span className="truncate">📢 "{m.message}"</span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Mountain Map (Hallasan) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300 px-1">
          <span className="font-bold flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>한라산 성판악 탐방로 실시간 등고선 관제 맵</span>
          </span>
          <span className="text-[11px] text-slate-400">
            실시간 GPS 궤적 및 AI 특정 수색 반경 시각화
          </span>
        </div>

        <MountainMap
          students={students}
          selectedStudent={selectedStudent}
          aiEstimate={aiEstimate}
          height="480px"
        />
      </div>

      {/* Full Student List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-white">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>학급 전체 학생 안전 모니터링 (2학년 3반)</span>
          </h3>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono">
            총 {students.length}명
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 text-[11px] border-b border-slate-800">
                <th className="py-3 px-4">학생 (학번 / 이름)</th>
                <th className="py-3 px-4">상태</th>
                <th className="py-3 px-4">측정 고도</th>
                <th className="py-3 px-4">단말기 배터리</th>
                <th className="py-3 px-4">산악 통신망</th>
                <th className="py-3 px-4 text-right">최근 수신</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.map((std) => {
                const isEmergency = std.status === "emergency";
                return (
                  <tr
                    key={std.id}
                    onClick={() => setSelectedStudent(std)}
                    className={`cursor-pointer transition-colors ${
                      isEmergency
                        ? "bg-red-950/30 hover:bg-red-950/50"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                        {std.name.slice(0, 1)}
                      </span>
                      <span>{std.name}</span>
                      <span className="text-slate-400 text-[11px] font-mono">({std.studentNumber})</span>
                    </td>

                    <td className="py-3 px-4">
                      {isEmergency ? (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> 조난 SOS
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> 안전 대열
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-amber-300 font-mono font-bold">
                      {std.lastLocation.altitude}m
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className={std.battery < 40 ? "text-red-400 font-bold" : "text-slate-300"}>
                        {std.battery}%
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] ${
                          std.network === "online"
                            ? "text-emerald-400"
                            : std.network === "unstable"
                            ? "text-amber-400"
                            : "text-red-400 font-bold"
                        }`}
                      >
                        {std.network === "online"
                          ? "정상"
                          : std.network === "unstable"
                          ? "불안정 (2G)"
                          : "두절 (오프라인)"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      방금 전
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
