import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HALLASAN_LANDMARKS } from "@/lib/mountainData";
import { analyzeVoiceEnvironment } from "@/lib/aiLocationEngine";
import { AIEstimateResult } from "@/types/rescue";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { voiceTranscript, currentAltitude, userApiKey } = body;

    if (!voiceTranscript || typeof voiceTranscript !== "string") {
      return NextResponse.json(
        { error: "voiceTranscript is required" },
        { status: 400 }
      );
    }

    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    // 1. Gemini API 키가 제공된 경우: Google Gemini 1.5 Flash로 정밀 추론
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const prompt = `
당신은 대한민국 산악 긴급 구조 전문 AI '산울림 AI'입니다.
학생이 수학여행 중 한라산 국립공원(성판악 탐방로)에서 조난을 당해 음성으로 주변 환경을 묘사했습니다.
학생의 음성 내용과 현재 측정된 기압 고도(${currentAltitude || "알 수 없음"}m)를 분석하여 아래 제공된 한라산 8대 주요 랜드마크(POI) 중 학생이 위치한 지점을 가장 정밀하게 특정해주세요.

[한라산 성판악 탐방로 8대 랜드마크 데이터]:
${JSON.stringify(HALLASAN_LANDMARKS, null, 2)}

[학생의 음성 텍스트]:
"${voiceTranscript}"

반드시 다음 JSON 스키마 형식으로만 응답하세요:
{
  "matchedPoiId": "일치하는 랜드마크 POI의 id (예: poi-06)",
  "extractedLandmarks": ["음성에서 포착한 주요 랜드마크 단서 키워드 목록"],
  "extractedAltitude": 음성에서 언급된 고도 숫자(m) 또는 null,
  "confidence": 매칭 신뢰도 0~100 사이 정수,
  "radiusMeters": 수색 추천 반경 미터 단위 정수 (예: 25, 35, 50),
  "urgencyLevel": "critical" 또는 "high" 또는 "moderate",
  "aiRecommendations": [
    "인솔교사 및 119 산악구조대를 위한 현장 조치 권고사항 2~3개"
  ],
  "timelineExplanation": "학부모와 교사가 이해하기 쉬운 AI 위치 특정 근거 1~2문장 요약"
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        const matchedPOI = HALLASAN_LANDMARKS.find((p) => p.id === parsed.matchedPoiId) || HALLASAN_LANDMARKS[5];

        const estimateResult: AIEstimateResult = {
          analyzedText: voiceTranscript,
          extractedLandmarks: parsed.extractedLandmarks || [],
          extractedAltitude: parsed.extractedAltitude || undefined,
          matchedPOI,
          estimatedLat: matchedPOI.lat,
          estimatedLng: matchedPOI.lng,
          confidence: parsed.confidence || 95,
          radiusMeters: parsed.radiusMeters || 35,
          urgencyLevel: parsed.urgencyLevel || "critical",
          aiRecommendations: parsed.aiRecommendations || [
            "진달래밭 대피소 상주 인원에게 즉시 무전 연락을 취하세요.",
            "학생에게 바람을 피하고 제자리에서 대기하도록 무전을 전송하세요.",
          ],
          timelineExplanation: parsed.timelineExplanation || `Google Gemini 1.5 Flash 분석 결과, ${matchedPOI.name} 부근으로 특정되었습니다.`,
          isGeminiPowered: true,
          modelUsed: "Google Gemini 1.5 Flash",
        };

        return NextResponse.json(estimateResult);
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, falling back to on-device engine:", geminiError?.message);
        // Gemini 호출 실패 시 아래의 온디바이스 로컬 엔진으로 폴백
      }
    }

    // 2. Fallback: 오프라인/온디바이스 자연어 처리 엔진
    const localResult = analyzeVoiceEnvironment(voiceTranscript, currentAltitude);
    return NextResponse.json({
      ...localResult,
      isGeminiPowered: false,
      modelUsed: "온디바이스 로컬 AI (오프라인 지원)",
    });
  } catch (error: any) {
    console.error("API error in analyze-voice:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 }
    );
  }
}
