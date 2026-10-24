"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, Navigation, AlertCircle, Volume2, CheckCircle2, ChevronRight, Compass, Key, Check } from "lucide-react";
import { analyzeVoiceEnvironment } from "@/lib/aiLocationEngine";
import { AIEstimateResult } from "@/types/rescue";

interface VoiceLocationAnalyzerProps {
  onAnalysisComplete: (result: AIEstimateResult) => void;
  currentAltitude?: number;
}

const SAMPLE_VOICE_PROMPTS = [
  "선생님, 친구들이랑 떨어졌는데 앞에 해발 1500m라고 적힌 큰 나무 팻말이 보이고 대피소 건물이 희미하게 보여요.",
  "안개가 너무 짙어서 길을 잃었어요. 방금 사라오름 갈림길 4-12 표지목을 지나쳤고 나무 계단 밑이에요.",
  "주변에 물 흐르는 소리가 들리고 돌계단 시작하는 속밭 샘터 약수터 근처에 혼자 앉아있어요.",
  "해발 1700미터 고사목 지대 같은데 하얀 마른나무들이 많고 바위가 엄청 미끄러워요.",
];

export default function VoiceLocationAnalyzer({
  onAnalysisComplete,
  currentAltitude,
}: VoiceLocationAnalyzerProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AIEstimateResult | null>(null);
  const [supported, setSupported] = useState<boolean>(true);
  const [apiKey, setApiKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [keySaved, setKeySaved] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 로컬 스토리지에 저장된 Gemini API 키 불러오기
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("sanwoolim_gemini_api_key");
      if (savedKey) {
        setApiKey(savedKey);
      }
    }

    // Web Speech API 지원 확인
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ko-KR";

    recognition.onresult = (event: any) => {
      let currentText = "";
      for (let i = 0; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      setTranscript(currentText);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSaveApiKey = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sanwoolim_gemini_api_key", apiKey.trim());
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2000);
      setShowKeyInput(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("브라우저에서 마이크 음성 인식을 지원하지 않습니다. 아래 예시 문장을 클릭해 테스트해 보세요!");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (transcript.trim().length > 3) {
        runAIAnalysis(transcript);
      }
    } else {
      setTranscript("");
      setResult(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSelectSample = (sample: string) => {
    setTranscript(sample);
    runAIAnalysis(sample);
  };

  const runAIAnalysis = async (textToAnalyze: string) => {
    setIsAnalyzing(true);
    try {
      // 1. Google Gemini 1.5 Flash API 라우트 호출 시도
      const res = await fetch("/api/analyze-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceTranscript: textToAnalyze,
          currentAltitude,
          userApiKey: apiKey.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("API call failed");
      }

      const data: AIEstimateResult = await res.json();
      setResult(data);
      setIsAnalyzing(false);
      onAnalysisComplete(data);
    } catch (err) {
      console.warn("Falling back to local NLP engine:", err);
      // 2. 네트워크 장애/두절 시 즉시 온디바이스 로컬 AI로 안전하게 Fallback
      const fallbackResult = analyzeVoiceEnvironment(textToAnalyze, currentAltitude);
      setResult(fallbackResult);
      setIsAnalyzing(false);
      onAnalysisComplete(fallbackResult);
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
              <span>음성 주변환경 AI 위치 특정</span>
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                특허 출원형 핵심 기술
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              산에서 보이는 <b>해발 고도 팻말, 표지목 번호, 약수터, 대피소</b> 등을 말하면 AI가 등산로 위치를 특정합니다.
            </p>
          </div>
        </div>

        {/* Gemini API Key Toggle Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              apiKey
                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
            }`}
            title="Google Gemini API 키 설정"
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>{apiKey ? "Gemini API 연동됨 ✨" : "Gemini API 키"}</span>
          </button>
        </div>
      </div>

      {/* Gemini API Key Collapsible Input Box */}
      {showKeyInput && (
        <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Google Gemini 1.5 Flash API Key</span>
            </span>
            <span className="text-[10px] text-slate-400">
              *입력 시 실제 Gemini 모델이 분석하며, 미입력 시 오프라인 로컬 엔진이 동작합니다.
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AQ... 또는 AIza... 형식의 Gemini API 키를 입력하세요"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1 transition-all shrink-0 shadow-lg shadow-indigo-600/20"
            >
              {keySaved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Check className="w-3.5 h-3.5" />}
              <span>{keySaved ? "저장 완료!" : "적용"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Mic Recording Area */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-4">
        {/* Animated Mic Button */}
        <div className="relative">
          {isRecording && (
            <>
              <div className="absolute -inset-4 rounded-full bg-red-500/30 animate-ping opacity-75" />
              <div className="absolute -inset-8 rounded-full bg-red-500/15 animate-pulse" />
            </>
          )}

          <button
            onClick={toggleRecording}
            className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all shadow-xl active:scale-95 ${
              isRecording
                ? "bg-red-600 text-white shadow-red-600/50 scale-105"
                : "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30"
            }`}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8 animate-bounce" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
            <span className="text-[10px] font-bold mt-1">
              {isRecording ? "말하기 완료" : "음성 말하기"}
            </span>
          </button>
        </div>

        <p className="text-xs font-semibold text-slate-400">
          {isRecording ? (
            <span className="text-red-400 animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping"></span>
              학생의 음성을 실시간 듣고 있습니다... (말씀 후 버튼을 다시 누르세요)
            </span>
          ) : (
            "버튼을 누르고 주변에 보이는 팻말이나 건물, 특징을 말씀해 주세요."
          )}
        </p>

        {/* Realtime Transcript Box */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 min-h-[56px] flex items-center justify-between gap-3">
          <p className="italic text-slate-300 break-keep">
            {transcript ? `"${transcript}"` : "음성 텍스트가 여기에 실시간으로 표시됩니다..."}
          </p>

          {transcript && !isAnalyzing && (
            <button
              onClick={() => runAIAnalysis(transcript)}
              className="shrink-0 px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI 분석</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Test Samples */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5 text-blue-400" />
          <span>발표 및 시뮬레이션용 빠른 음성 예시 선택 (클릭 시 즉시 AI 분석):</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_VOICE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="text-left p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 rounded-xl text-[11px] text-slate-300 transition-all flex items-start gap-2 group"
            >
              <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {idx + 1}
              </span>
              <span className="line-clamp-2 leading-relaxed">{sample}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Analysis Result Card */}
      {isAnalyzing && (
        <div className="p-6 bg-blue-950/40 border border-blue-500/30 rounded-2xl text-center space-y-3 animate-pulse">
          <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-blue-300">
            산울림 AI가 한라산 등산로 데이터 및 고도 팻말 정보를 대조하는 중입니다...
          </p>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="p-5 bg-gradient-to-br from-slate-900 to-blue-950/80 border border-blue-500/40 rounded-2xl shadow-xl space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                <Navigation className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white">AI 위치 특정 완료</p>
                  {result.isGeminiPowered ? (
                    <span className="text-[10px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm shadow-indigo-500/20">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                      <span>{result.modelUsed || "Google Gemini 1.5 Flash"}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-medium">
                      {result.modelUsed || "온디바이스 로컬 AI (오프라인 모드)"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-blue-300 font-mono mt-0.5">
                  추정 좌표: {result.estimatedLat.toFixed(4)}, {result.estimatedLng.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">매칭 신뢰도</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {result.confidence}%
              </span>
            </div>
          </div>

          {/* Identified POI Detail */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">특정 랜드마크</span>
              <span className="font-extrabold text-white text-sm">
                {result.matchedPOI?.name}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">해발 고도</span>
              <span className="font-extrabold text-amber-400 text-sm">
                {result.matchedPOI?.altitude}m{" "}
                {result.extractedAltitude && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    (음성 {result.extractedAltitude}m 감지)
                  </span>
                )}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">수색 추천 반경</span>
              <span className="font-extrabold text-red-400 text-sm">
                반경 {result.radiusMeters}m 이내
              </span>
            </div>
          </div>

          {/* Timeline / Public Explanation */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{result.timelineExplanation}</p>
          </div>

          {/* Recommendations for Rescue & Teachers */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-bold text-slate-400">교사 및 119 산악구조대 긴급 조치 가이드:</p>
            <ul className="space-y-1 text-xs text-slate-300">
              {result.aiRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
