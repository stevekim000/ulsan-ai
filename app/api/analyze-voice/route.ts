import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  HALLASAN_TRAILS,
  HALLASAN_SIGNS,
  LANDMARK_SYNONYMS,
  HALLASAN_LANDMARKS,
} from "@/lib/mountainData";
import { analyzeVoiceEnvironment } from "@/lib/aiLocationEngine";
import { AIEstimateResult } from "@/types/rescue";

/**
 * Gemini 프롬프트용 탐방로 요약 생성
 */
function buildTrailPromptData(): string {
  const lines: string[] = [];

  for (const [name, trail] of Object.entries(HALLASAN_TRAILS)) {
    const points = trail.keyPoints
      .map(kp => `${kp.name}(${kp.lat},${kp.lng},${kp.alt}m,${kp.signCode})`)
      .join(' → ');
    lines.push(`- ${name} 코스 (${trail.totalDistanceKm}km, 약 ${trail.expectedHours}시간): ${points}`);
  }

  lines.push('\n[국가지점번호 표지판 (일부)]:');
  for (const sign of HALLASAN_SIGNS.slice(0, 20)) {
    lines.push(`  ${sign.code} → ${sign.gCode} → ${sign.name} (${sign.alt}m, ${sign.lat},${sign.lng})`);
  }

  lines.push('\n[랜드마크 동의어]:');
  for (const syn of LANDMARK_SYNONYMS) {
    lines.push(`  ${syn.keywords.join('/')} → ${syn.trail} 코스 ${syn.name}(${syn.alt}m, ${syn.signCode})`);
  }

  return lines.join('\n');
}

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

        const trailData = buildTrailPromptData();

        const prompt = `
당신은 대한민국 산악 긴급 구조 전문 AI '산울림 AI'입니다.
학생이 수학여행 중 한라산 국립공원에서 조난을 당해 음성으로 주변 환경을 묘사했습니다.
학생의 음성 내용과 현재 측정된 기압 고도(${currentAltitude || "알 수 없음"}m)를 분석하여 아래 제공된 한라산 5개 탐방로 데이터 중 학생이 위치한 지점을 가장 정밀하게 특정해주세요.

## 유사 표현 동의어 처리:
- "영실", "영실코스", "영실 코스", "영실로", "영실길" 등은 모두 '영실 코스'로 인식
- "성판악", "성판악코스" 등은 '성판악 코스'
- "관음사", "관음사코스" 등은 '관음사 코스'
- "어리목", "어리목코스" 등은 '어리목 코스'
- "돈내코", "돈내코코스" 등은 '돈내코 코스'
- "오백장군", "영실기암"은 '오백나한(1500m)'의 동의어

[한라산 5개 탐방로 정밀 데이터]:
${trailData}

[학생의 음성 텍스트]:
"${voiceTranscript}"

★ 필수 지침:
1. 표지판 번호("영실 1-14", "성판악 1-24") 또는 국가지점번호("다라 0155 8122" 등)가 보이면 즉시 해당 표지판 위치를 정밀하게 확정하세요.
2. 특정 코스와 고도를 말하면(예: "영실코스 해발 1500m"), 반드시 해당 코스의 일치하는 고도 지점을 산출하세요.
3. 지형, 시설물(대피소, 계곡, 바위 등) 키워드를 동의어 사전과 대조하세요.

반드시 다음 JSON 스키마 형식으로만 응답하세요:
{
  "matchedPoiId": "일치하는 랜드마크 POI의 id",
  "matchedTrail": "탐방로명(영실/성판악/관음사/어리목/돈내코) 또는 null",
  "matchedSignCode": "매칭된 표지목 코드 또는 null",
  "matchedGCode": "매칭된 국가지점번호 또는 null",
  "extractedLandmarks": ["음성에서 포착한 주요 랜드마크 단서 키워드 목록"],
  "extractedAltitude": 음성에서 언급된 고도 숫자(m) 또는 null,
  "confidence": 매칭 신뢰도 0~100 사이 정수,
  "radiusMeters": 수색 추천 반경 미터 단위 정수,
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

        const matchedPOI = HALLASAN_LANDMARKS.find((p) => p.id === parsed.matchedPoiId) || HALLASAN_LANDMARKS[0];

        // Gemini가 반환한 표지판 정보를 활용하여 정확한 좌표 획득
        let finalLat = matchedPOI.lat;
        let finalLng = matchedPOI.lng;
        let finalAlt = matchedPOI.altitude;

        if (parsed.matchedSignCode) {
          const signMatch = HALLASAN_SIGNS.find(s => s.code === parsed.matchedSignCode);
          if (signMatch) {
            finalLat = signMatch.lat;
            finalLng = signMatch.lng;
            finalAlt = signMatch.alt;
          }
        }

        const estimateResult: AIEstimateResult = {
          analyzedText: voiceTranscript,
          extractedLandmarks: parsed.extractedLandmarks || [],
          extractedAltitude: parsed.extractedAltitude || undefined,
          matchedPOI: {
            ...matchedPOI,
            lat: finalLat,
            lng: finalLng,
            altitude: finalAlt,
          },
          estimatedLat: finalLat,
          estimatedLng: finalLng,
          confidence: parsed.confidence || 95,
          radiusMeters: parsed.radiusMeters || 35,
          urgencyLevel: parsed.urgencyLevel || "critical",
          aiRecommendations: parsed.aiRecommendations || [
            "학생에게 바람을 피하고 제자리에서 대기하도록 안내하세요.",
            "수색팀을 해당 지점으로 즉시 배치하세요.",
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

    // 2. Fallback: 오프라인/온디바이스 자연어 처리 엔진 (5개 코스 전체 + 표지판 + 동의어 활용)
    const localResult = analyzeVoiceEnvironment(voiceTranscript, currentAltitude);
    return NextResponse.json({
      ...localResult,
      isGeminiPowered: false,
      modelUsed: "온디바이스 로컬 AI (5개 코스 정밀 분석 엔진)",
    });
  } catch (error: any) {
    console.error("API error in analyze-voice:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 }
    );
  }
}
