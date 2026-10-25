"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Navigation, 
  AlertCircle, 
  Volume2, 
  CheckCircle2, 
  ChevronRight, 
  Compass, 
  Key, 
  Check,
  Globe,
  Search,
  ExternalLink,
  MessageSquareText,
  Send,
  AlertTriangle,
} from "lucide-react";
import { analyzeVoiceEnvironment } from "@/lib/aiLocationEngine";
import { AIEstimateResult } from "@/types/rescue";

interface VoiceLocationAnalyzerProps {
  onAnalysisComplete: (result: AIEstimateResult) => void;
  currentAltitude?: number;
}

interface SamplePrompt {
  tag: string;
  course: string;
  text: string;
}

const SAMPLE_VOICE_PROMPTS: SamplePrompt[] = [
  {
    tag: "⚠️ 단일 정보 (고도 표지판)",
    course: "정보부족확인",
    text: "해발 1500m 표지판이 보여요.",
  },
  {
    tag: "⚠️ 단일 정보 (지형만)",
    course: "정보부족확인",
    text: "가파른 바위 너덜길이에요.",
  },
  {
    tag: "🚨 추가 제시 불가 (단일추정)",
    course: "단일판단",
    text: "해발 1500m 표지판이 보여요. 안개가 너무 심해서 더 이상 보이는 게 없어요.",
  },
  {
    tag: "🌐 키워드 없음 (인터넷 수집)",
    course: "인터넷수집",
    text: "선생님, 친구들을 놓쳤어요. 표지판은 안 보이고 주변에 붉은색 기와지붕 건물이랑 기상 레이더 같은 하얀 돔이 멀리 보여요.",
  },
  {
    tag: "🌐 키워드 없음 (모노레일/석굴)",
    course: "인터넷수집",
    text: "어딘지 모르겠는데 바닥에 철제 모노레일 레일이 깔려있고 옆에 커다란 용암 석굴이 있어요. 비가 너무 많이 와요.",
  },
  {
    tag: "영실 1-14",
    course: "영실",
    text: "영실 코스로 올라가다 친구들을 놓쳤어요. 방금 영실 1-14 오백나한 조망터 지나서 구상나무 숲길 쪽인데 안개가 너무 짙어요.",
  },
  {
    tag: "성판악 1-24",
    course: "성판악",
    text: "선생님, 친구들이랑 떨어졌는데 성판악 1-24 진달래밭 대피소 건물 근처이고 해발 1500m 표지석이 보여요.",
  },
  {
    tag: "관음사 2-23",
    course: "관음사",
    text: "관음사 코스로 하산하다 발목을 삐었어요. 표지판에 관음사 2-23 삼각봉 대피소 앞이라고 써있고 바람이 엄청 불어요.",
  },
  {
    tag: "어리목 3-15",
    course: "어리목",
    text: "어리목으로 하산하다 만세동산 전망대 지나 사제비샘 방향에서 길을 잃었어요. 표지목 3-15가 보여요.",
  },
  {
    tag: "돈내코 5-20",
    course: "돈내코",
    text: "돈내코 코스 남벽분기점 가기 전 평궤 대피소 근처에서 친구들과 떨어졌어요. 해발 1450미터 팻말이 있어요.",
  },
  {
    tag: "국가지점번호",
    course: "지점번호",
    text: "노란색 조난 표지판에 국가지점번호 '다라 0155 8122' 라고 적혀있어요! 살려주세요.",
  },
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
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [textInput, setTextInput] = useState<string>("");
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 로컬 스토리지에 저장된 Gemini API 키 불러오기
    if (typeof window !== "undefined") {
      const savedKey =
        localStorage.getItem("meari_gemini_api_key") ||
        localStorage.getItem("sanwoolim_gemini_api_key");
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
      localStorage.setItem("meari_gemini_api_key", apiKey.trim());
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
    setTextInput(sample);
    runAIAnalysis(sample);
  };

  const handleTextSubmit = () => {
    const text = textInput.trim();
    if (text.length < 3) return;
    setTranscript(text);
    runAIAnalysis(text);
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const runAIAnalysis = async (textToAnalyze: string, forceJudgment = false) => {
    setIsAnalyzing(true);
    try {
      // 1. Google Gemini 1.5 Flash API 라우트 호출 (테스트 모드: 사용자의 GPS 고도 미전송)
      const res = await fetch("/api/analyze-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceTranscript: textToAnalyze,
          userApiKey: apiKey.trim() || undefined,
          forceJudgment,
        }),
      });

      if (!res.ok) {
        throw new Error("API call failed");
      }

      const data: AIEstimateResult = await res.json();
      setResult(data);
      setIsAnalyzing(false);
      if (!data.isInsufficientInfo) {
        onAnalysisComplete(data);
      }
    } catch (err) {
      console.warn("Falling back to local NLP engine:", err);
      // 2. 네트워크 장애/두절 시 즉시 온디바이스 로컬 AI로 안전하게 Fallback (순수 음성 분석)
      const fallbackResult = analyzeVoiceEnvironment(textToAnalyze, forceJudgment);
      setResult(fallbackResult);
      setIsAnalyzing(false);
      if (!fallbackResult.isInsufficientInfo) {
        onAnalysisComplete(fallbackResult);
      }
    }
  };

  const handleAddMoreInfo = () => {
    setInputMode("text");
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
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
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base text-white">
                음성 주변환경 AI 위치 특정
              </h3>
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                특허 출원형 핵심 기술
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span>🧪</span>
                <span>테스트 모드: GPS 고도 감지 OFF (100% 음성 단서 기반 추론)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
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

      {/* Input Mode Toggle (음성 / 텍스트) */}
      <div className="flex items-center bg-slate-950/70 p-1 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setInputMode("voice")}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            inputMode === "voice"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>음성으로 말하기</span>
        </button>
        <button
          onClick={() => {
            setInputMode("text");
            setTimeout(() => textareaRef.current?.focus(), 100);
          }}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            inputMode === "text"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquareText className="w-3.5 h-3.5" />
          <span>텍스트로 입력</span>
        </button>
      </div>

      {/* Voice Input Mode */}
      {inputMode === "voice" && (
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
      )}

      {/* Text Input Mode */}
      {inputMode === "text" && (
        <div className="flex flex-col p-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <MessageSquareText className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-emerald-300">텍스트 입력 모드</span>
            <span className="text-[10px] text-slate-500">— 말을 할 수 없는 상황에서 주변 환경을 글로 설명하세요</span>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleTextKeyDown}
              placeholder="예: 표지판에 성판악 1-24라고 적혀있고 진달래밭 대피소 건물이 보여요"
              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/60 rounded-xl px-4 py-3 pr-14 text-sm text-white placeholder-slate-500 focus:outline-none resize-none transition-colors"
              rows={3}
            />
            <button
              onClick={handleTextSubmit}
              disabled={textInput.trim().length < 3 || isAnalyzing}
              className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-90 shadow-md"
              title="AI 분석 전송"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-slate-500">
            Enter로 전송 · Shift+Enter로 줄바꿈
          </p>

          {/* Show transcript if text was submitted */}
          {transcript && (
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 flex items-center justify-between gap-3">
              <p className="italic text-slate-300 break-keep">
                "{transcript}"
              </p>
              {!isAnalyzing && (
                <button
                  onClick={() => runAIAnalysis(transcript)}
                  className="shrink-0 px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>재분석</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Test Samples */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5 text-blue-400" />
          <span>발표 및 시뮬레이션용 빠른 음성 예시 선택 (클릭 시 즉시 AI 분석):</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SAMPLE_VOICE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample.text)}
              className="text-left p-2.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/60 rounded-xl text-[11px] text-slate-300 transition-all flex flex-col gap-1.5 group shadow-sm hover:shadow-indigo-500/10"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {sample.course}
                </span>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-amber-400 transition-colors">
                  📍 {sample.tag}
                </span>
              </div>
              <span className="line-clamp-2 leading-relaxed text-slate-300 text-[11px] group-hover:text-white transition-colors">
                "{sample.text}"
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Analysis Result Card */}
      {isAnalyzing && (
        <div className="p-6 bg-blue-950/40 border border-blue-500/30 rounded-2xl text-center space-y-3 animate-pulse">
          <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-blue-300">
            메아리 AI가 한라산 등산로 데이터 및 고도 팻말 정보를 대조하는 중입니다...
          </p>
        </div>
      )}

      {/* ⚠️ 위치 특정 정보 부족 안내 카드 (해발고도/주변지형/랜드마크 중 1개만 제시된 경우) */}
      {result && !isAnalyzing && result.isInsufficientInfo && (
        <div className="p-5 bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex items-start justify-between border-b border-amber-500/30 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-amber-300">
                    위치 특정 정보 부족 안내
                  </h4>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                    단일 정보 감지
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {result.insufficientMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Detection Status Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-950/70 border border-emerald-500/30 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <span>✅ 현재 확인된 단서:</span>
              </span>
              <p className="text-white font-black text-xs">
                {result.presentDimensions?.join(", ") || "1개 정보"}
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 border border-amber-500/30 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <span>❓ 추가 권장 정보:</span>
              </span>
              <p className="text-amber-200 font-bold text-xs">
                {result.missingDimensions?.join(", ") || "주변 지형 또는 가까운 랜드마크"}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-black/40 border border-amber-500/20 rounded-xl text-xs text-slate-300 space-y-2 leading-relaxed">
            <p className="whitespace-pre-line text-slate-300 text-[11px]">
              {result.guidePrompt}
            </p>
          </div>

          {/* Action Choice Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleAddMoreInfo}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>추가 정보 덧붙여 말하기 / 입력</span>
            </button>

            <button
              onClick={() => runAIAnalysis(transcript || textInput, true)}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>더 이상 정보 없음 ➜ 현재 정보로 즉시 위치 판단</span>
            </button>
          </div>
        </div>
      )}

      {result && !isAnalyzing && !result.isInsufficientInfo && (
        <div className="p-5 bg-gradient-to-br from-slate-900 to-blue-950/80 border border-blue-500/40 rounded-2xl shadow-xl space-y-4 animate-in fade-in duration-300">
          {/* 단일 정보 기반 긴급 추정 배너 (추가 정보 제시 불가 시) */}
          {result.isSingleInfoJudgment && (
            <div className="bg-gradient-to-r from-amber-950/80 to-red-950/70 border border-amber-500/50 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-amber-200">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>🚨 단일 정보([{result.singleInfoDimension || '해발고도'}]) 기반 긴급 위치 추정 완료</span>
                  <span className="text-[10px] bg-red-600/30 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded font-mono">광역 수색 반경 {result.radiusMeters}m</span>
                </span>
                <p className="text-[11px] text-slate-300">
                  추가 정보를 더 이상 확인할 수 없는 극한 상황으로 확인되어, 확보된 단일 단서를 기반으로 가장 유력한 지점을 추정했습니다.
                </p>
              </div>
            </div>
          )}

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

          {/* 🌐 인터넷 실시간 정보 수집 모드 가동 카드 (키워드 미감지 시) */}
          {result.isInternetSearchUsed && (
            <div className="bg-gradient-to-r from-cyan-950/80 via-blue-950/70 to-indigo-950/80 border-2 border-cyan-500/50 rounded-2xl p-4 shadow-xl shadow-cyan-950/30 space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  <span className="text-xs font-black text-cyan-300 tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Gemini 인터넷 실시간 정보 수집 모드 가동
                  </span>
                </div>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                  한라산 5대 코스 (입구~정상) 정보 수집
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                음성 데이터에서 공인 표지목이나 코스 키워드가 감지되지 않아, <b>Gemini AI가 인터넷 실시간 검색을 통해 한라산 5대 코스(성판악, 관음사, 영실, 어리목, 돈내코: 탐방로 입구~정상)의 시설물 및 지형 정보를 수집·대조하여 위치를 추정</b>했습니다.
              </p>

              {/* 검색 쿼리 태그 */}
              {result.internetSearchQueries && result.internetSearchQueries.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Search className="w-3 h-3 text-cyan-400" /> 5대 코스 수집 검색어:
                  </span>
                  {result.internetSearchQueries.map((q, idx) => (
                    <span key={idx} className="text-[11px] bg-slate-900/90 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-lg font-mono">
                      #{q}
                    </span>
                  ))}
                </div>
              )}

              {/* 인터넷 정보 분석 요약 */}
              {result.internetFindings && (
                <div className="bg-slate-950/80 border border-cyan-900/50 rounded-xl p-3 text-xs text-cyan-100/90 leading-relaxed">
                  <b className="text-cyan-400">🌐 5대 코스 인터넷 정보 수집 분석:</b> {result.internetFindings}
                </div>
              )}

              {/* 핵심 데이터 수집 출처 링크 (1~2개) */}
              {((result.coreSourceLinks && result.coreSourceLinks.length > 0) || (result.collectedWebSources && result.collectedWebSources.length > 0)) && (
                <div className="space-y-2 pt-1 border-t border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-extrabold text-cyan-300 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>핵심 데이터 수집 링크 (출처 1~2개)</span>
                    </p>
                    <span className="text-[10px] bg-slate-900 text-cyan-400 px-2 py-0.5 rounded font-mono border border-cyan-500/30">
                      실시간 웹 대조
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {((result.coreSourceLinks && result.coreSourceLinks.length > 0)
                      ? result.coreSourceLinks
                      : (result.collectedWebSources || [])
                    ).slice(0, 2).map((linkItem, idx) => (
                      <a
                        key={idx}
                        href={linkItem.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col justify-between bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-400 rounded-xl p-3 text-xs transition-all duration-200 shadow-sm hover:shadow-cyan-500/20"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-bold text-white text-[12px] group-hover:text-cyan-300 line-clamp-1 transition-colors">
                              {linkItem.title}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform flex-shrink-0 mt-0.5" />
                          </div>
                          {linkItem.snippet && (
                            <p className="text-slate-400 text-[10px] line-clamp-2 leading-relaxed">
                              {linkItem.snippet}
                            </p>
                          )}
                        </div>

                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* 1. 음성 단서 ↔ 학습 지형 데이터 대조 기반 정밀 지형 예측 (Terrain Prediction) */}
          {result.terrainAnalysis && (
            <div className="p-4 bg-slate-950/90 border border-amber-500/40 rounded-2xl space-y-3 shadow-lg shadow-amber-950/20">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="text-sm">⛰️</span>
                  <span>음성 단서 ↔ 학습 지형 데이터 대조 기반 지형 예측</span>
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                  {result.terrainAnalysis.trailCourse || "한라산 탐방로"}
                </span>
              </div>

              {/* 비교 분석 총평 */}
              {result.terrainAnalysis.comparisonExplanation && (
                <div className="p-2.5 bg-amber-950/30 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 leading-relaxed font-medium">
                  💡 <b>비교 분석 결과:</b> {result.terrainAnalysis.comparisonExplanation}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 block font-bold flex items-center gap-1">
                    <span>🏔️</span>
                    <span>예측 지형 형태 및 특성</span>
                  </span>
                  <span className="text-slate-200 font-medium leading-relaxed block">
                    {result.terrainAnalysis.terrainType}
                  </span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-sky-400 block font-bold flex items-center gap-1">
                    <span>🥾</span>
                    <span>등산로 바닥 및 보행 환경</span>
                  </span>
                  <span className="text-slate-200 font-medium leading-relaxed block">
                    {result.terrainAnalysis.trailSurface || "화산석 자갈 및 목재 데크"}
                  </span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-emerald-400 block font-bold flex items-center gap-1">
                    <span>🌲</span>
                    <span>주변 식생 및 수림 분포</span>
                  </span>
                  <span className="text-slate-200 font-medium leading-relaxed block">
                    {result.terrainAnalysis.vegetation || "아고산대 관목 및 침엽수림"}
                  </span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-purple-400 block font-bold flex items-center gap-1">
                    <span>🌫️</span>
                    <span>기상 및 시계 상태 예측</span>
                  </span>
                  <span className="text-slate-200 font-medium leading-relaxed block">
                    {result.terrainAnalysis.weatherCondition}
                  </span>
                </div>
              </div>

              {result.terrainAnalysis.riskFactor && (
                <div className="bg-red-950/50 border border-red-500/40 p-2.5 rounded-xl text-xs flex items-center gap-2 text-red-200">
                  <span className="text-red-400 shrink-0 font-extrabold text-xs">⚠️ 지형 위험도:</span>
                  <span className="font-semibold">{result.terrainAnalysis.riskFactor}</span>
                </div>
              )}
            </div>
          )}

          {/* 2. 어째서 이런 결과를 냈는지: AI 단계별 추론 근거 (Reasoning Justification) */}
          <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI 추론 근거 (어째서 이 위치로 판정했는가?)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                5단계 신경망 지리 대조
              </span>
            </div>

            {/* 핵심 판정 요약 */}
            {result.matchedReason && (
              <div className="p-2 bg-indigo-900/30 border border-indigo-500/20 rounded-lg text-xs text-indigo-200 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{result.matchedReason}</span>
              </div>
            )}

            {/* 4단계 상세 추론 과정 */}
            {result.reasoningSteps && result.reasoningSteps.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {result.reasoningSteps.map((step, sIdx) => (
                  <div key={sIdx} className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{step.icon}</span>
                      <span className="text-[11px] font-bold text-slate-200">{step.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed pl-4">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extracted Clue Keywords */}
          {result.extractedLandmarks && result.extractedLandmarks.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 font-medium mr-1">포착된 단서:</span>
              {result.extractedLandmarks.map((lm, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium"
                >
                  {lm}
                </span>
              ))}
            </div>
          )}

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
