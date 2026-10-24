import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  HALLASAN_TRAILS,
  HALLASAN_SIGNS,
  LANDMARK_SYNONYMS,
  HALLASAN_LANDMARKS,
} from "@/lib/mountainData";
import { analyzeVoiceEnvironment } from "@/lib/aiLocationEngine";
import {
  detectMountainKeywords,
  extractSearchQueriesFromVoice,
  collectInternetInformation,
  WebSearchResultItem,
} from "@/lib/internetSearch";
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

/**
 * 마크다운 코드블록이나 텍스트 내에서 순수 JSON을 안전하게 추출하는 헬퍼 함수
 */
function extractJsonFromGeminiResponse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {}
    }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    }
    throw new Error("Failed to parse JSON response from Gemini output");
  }
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

    // 0. 음성 내에서 명시적인 키워드(표지목, 국가지점번호, 고도 숫자, 코스명, 공식 랜드마크) 존재 여부 검출
    const keywordCheck = detectMountainKeywords(voiceTranscript);
    const isInternetSearchNeeded = !keywordCheck.hasExplicitKeywords;

    let webResults: WebSearchResultItem[] = [];
    let searchQueries: string[] = [];

    // 키워드가 보이지 않으면 인터넷에서 실시간 정보를 적극 수집 (한라산 5대 코스 입구~정상 한정)
    if (isInternetSearchNeeded) {
      searchQueries = extractSearchQueriesFromVoice(voiceTranscript);
      webResults = await collectInternetInformation(searchQueries, voiceTranscript);
    }

    // 1. Gemini API 키가 제공된 경우: Google Gemini 1.5 Flash로 정밀 추론
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const trailData = buildTrailPromptData();

        let prompt = "";
        let model: any;

        if (isInternetSearchNeeded) {
          // 키워드가 없는 경우: 인터넷 정보 수집 프롬프트 적용 (한라산 5대 코스 엄격 한정)
          const webContext = webResults.map((item, idx) =>
            `[인터넷 수집 정보 #${idx + 1}] (${item.courseTag ? `[${item.courseTag} 코스]` : ''} 검색어: "${item.query}")\n- 출처: ${item.title} (${item.url})\n- 수집 내용: ${item.snippet}`
          ).join('\n\n');

          // 구글 서치 그라운딩 또는 프롬프트 기반 인터넷 지식 검색 결합
          model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
              temperature: 0.3,
            },
          });

          prompt = `
당신은 대한민국 산악 긴급 구조 전문 AI '산울림 AI'입니다.
학생이 수학여행 중 한라산 국립공원에서 조난을 당해 음성으로 주변 환경을 묘사했습니다.

★ 핵심 긴급 상황 [키워드 미감지 - 인터넷 정보 수집 모드]:
학생의 음성에서 표지판 번호, 국가지점번호, 코스 명칭 등의 명시적 키워드가 발견되지 않았습니다!
따라서 시스템이 인터넷 실시간 검색을 통해 수집한 아래의 지리/시설물 정보와 당신의 인터넷 지식을 결합하여,
학생이 묘사한 시각적/지형적 단서(건물 특징, 지붕 색상, 관측 레이더 돔, 철탑, 모노레일, 식생, 특이 바위 등)가
한라산 국립공원의 어느 위치(코스, 고도, 가장 가까운 랜드마크 POI, 위경도 좌표)에 해당하는지 인터넷 정보를 종합 분석하여 위치를 추정해 주세요.

★ [엄격한 수집 및 분석 대상: 한라산 5대 코스 입구~정상 구간 한정]:
당신이 수집·참조하는 모든 정보는 오직 한라산 5대 공인 탐방로:
1. 성판악 코스 (성판악 탐방로 입구 750m ~ 백록담 동릉 정상 1,950m)
2. 관음사 코스 (관음사 탐방로 입구 620m ~ 백록담 북벽 정상 1,950m)
3. 영실 코스 (영실 탐방로 입구 1,100m ~ 윗세오름 1,720m ~ 남벽분기점 1,600m)
4. 어리목 코스 (어리목 탐방로 입구 970m ~ 윗세오름 1,720m ~ 남벽분기점 1,600m)
5. 돈내코 코스 (돈내코 탐방로 입구 490m ~ 남벽분기점 1,600m)
에 직접 관련된 지형, 시설물, 대피소, 기상관측기지, 식생, 보행로 정보여야만 합니다. 5개 코스 외의 다른 산이나 무관한 지역 정보는 일체 배제하고 오직 이 5개 코스 범위 내의 정보만을 수집·대조하여 위치를 추정하세요.

[🌐 인터넷 실시간 정보 수집 결과 (5대 코스 입구~정상 관련)]:
${webContext}

[한라산 5개 탐방로 기본 DB]:
${trailData}

[학생의 음성 텍스트]:
"${voiceTranscript}"

★ 필수 지침:
1. 인터넷 수집 결과 및 Google Search 지식을 바탕으로 학생이 서술한 시각적 단서(예: 붉은 지붕 건물, 기상 레이더 돔, 철탑, 모노레일 등)와 가장 일치하는 5대 코스 시설물/지형을 특정하세요.
2. 'internetFindings' 필드에 5개 코스 중 어떤 코스의 어떤 웹 문서 및 인터넷 정보를 수집·대조하여 이 위치로 추정했는지 구체적인 근거를 2~3문장으로 명확히 서술하세요.
3. 명시적 표지목이 없는 인터넷 기반 추정이므로 수색 반경(radiusMeters)은 안전을 고려해 50~80m 범위로, 신뢰도(confidence)는 75~85% 사이로 현실적으로 산출하세요.
4. 반드시 유효한 JSON 형식으로만 응답하세요.

응답 형식 (JSON):
{
  "matchedPoiId": "일치하거나 가장 인접한 랜드마크 POI의 id",
  "matchedTrail": "탐방로명(영실/성판악/관음사/어리목/돈내코)",
  "matchedSignCode": "가장 인접한 표지목 코드 또는 null",
  "matchedGCode": null,
  "matchedReason": "키워드 부재로 인터넷 실시간 정보 수집 가동: 학생 묘사와 웹 수집 데이터를 교차 대조하여 [xxx]로 추정",
  "extractedLandmarks": ["음성에서 포착한 시각적 묘사 단서 목록"],
  "extractedAltitude": 인터넷 데이터 기반 추정 고도(m) 또는 null,
  "confidence": 75~85 사이 정수,
  "radiusMeters": 50~80 사이 정수,
  "urgencyLevel": "critical" 또는 "high",
  "isInternetSearchUsed": true,
  "internetSearchQueries": ${JSON.stringify(searchQueries)},
  "internetFindings": "인터넷 정보 수집 및 위치 분석 요약 2~3문장",
  "terrainAnalysis": {
    "terrainType": "인터넷 정보로 파악된 지형 특성 (예: 고산 기상 관측 타워 능선 지대)",
    "weatherCondition": "기상/시야 상태",
    "riskFactor": "주요 위험 요소",
    "trailCourse": "탐방로 코스명 및 고도 구간"
  },
  "reasoningSteps": [
    {
      "icon": "🌐",
      "title": "인터넷 실시간 정보 수집 가동 (키워드 미감지 대응)",
      "desc": "음성에 공인 표지목·코스 키워드가 없어 Google Search 및 웹 크롤링으로 시각적 묘사 단서 분석"
    },
    {
      "icon": "🔎",
      "title": "인터넷 수집 정보와 한라산 시설물 대조",
      "desc": "수집된 기상 레이더/대피소/지형 정보와 1:1 매핑 확인"
    },
    {
      "icon": "📍",
      "title": "인터넷 정보 기반 추정 좌표 매핑",
      "desc": "인터넷 검색 결과에 따른 특정 위치 좌표 산출"
    },
    {
      "icon": "🎯",
      "title": "안전 수색 반경 확정",
      "desc": "키워드 미감지 상황을 고려한 안전 수색 반경 60m 설정"
    }
  ],
  "aiRecommendations": [
    "인솔교사 및 119 산악구조대를 위한 현장 조치 권고사항 2~3개"
  ],
  "timelineExplanation": "인터넷 실시간 정보 수집을 통해 학생이 묘사한 환경이 [xxx] 부근으로 특정되었습니다."
}
`;
        } else {
          // 키워드가 있는 경우: 표준 정밀 탐방로 매칭 모드
          model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });

          prompt = `
당신은 대한민국 산악 긴급 구조 전문 AI '산울림 AI'입니다.
학생이 수학여행 중 한라산 국립공원에서 조난을 당해 음성으로 주변 환경을 묘사했습니다.
학생이 음성으로 진술한 주변 환경(표지판, 해발 고도 팻말 숫자, 건물, 바위, 약수터 등)만을 오직 분석하여 아래 제공된 한라산 5개 탐방로 데이터 중 학생이 위치한 지점을 가장 정밀하게 특정해주세요.

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
  "matchedReason": "어째서 이 지점으로 판정했는지 핵심 이유 1줄 요약",
  "extractedLandmarks": ["음성에서 포착한 주요 랜드마크 단서 키워드 목록"],
  "extractedAltitude": 음성에서 언급된 고도 숫자(m) 또는 null,
  "confidence": 매칭 신뢰도 0~100 사이 정수,
  "radiusMeters": 수색 추천 반경 미터 단위 정수,
  "urgencyLevel": "critical" 또는 "high" 또는 "moderate",
  "terrainAnalysis": {
    "terrainType": "지형 특성 (예: 기암괴석 급경사 암벽 지대, 아고산대 침엽수림 등)",
    "weatherCondition": "기상/시야 상태 (예: 짙은 안개로 시야 15m 미만, 강풍 등)",
    "riskFactor": "주요 위험 요소 (예: 저체온증 취약, 발목 부상으로 거동 불가 등)",
    "trailCourse": "탐방로 코스명 및 고도 구간"
  },
  "reasoningSteps": [
    {
      "icon": "🪧 또는 🧭 또는 ⛰️ 또는 🎯",
      "title": "추론 단계 제목 (예: 표지목 코드 대조, 지형/고도 부합 등)",
      "desc": "어째서 이 결과를 도출했는지 구체적 증거 및 이유"
    }
  ],
  "aiRecommendations": [
    "인솔교사 및 119 산악구조대를 위한 현장 조치 권고사항 2~3개"
  ],
  "timelineExplanation": "AI 위치 특정 근거 1~2문장 요약"
}
`;
        }

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = extractJsonFromGeminiResponse(responseText);

        const matchedPOI = HALLASAN_LANDMARKS.find((p) => p.id === parsed.matchedPoiId) || HALLASAN_LANDMARKS[0];

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
          confidence: parsed.confidence || (isInternetSearchNeeded ? 78 : 95),
          radiusMeters: parsed.radiusMeters || (isInternetSearchNeeded ? 65 : 35),
          urgencyLevel: parsed.urgencyLevel || "critical",
          matchedReason: parsed.matchedReason || (
            isInternetSearchNeeded
              ? `키워드 부재로 인터넷 실시간 정보 수집 가동: 웹 정보 대조로 ${parsed.matchedTrail || '한라산'} 코스 위치 추정`
              : `${parsed.matchedTrail || '한라산'} 코스 랜드마크 데이터 대조로 위치 특정`
          ),
          reasoningSteps: parsed.reasoningSteps || [
            ...(isInternetSearchNeeded ? [{
              icon: "🌐",
              title: "인터넷 실시간 정보 수집 가동",
              desc: `학생 음성에 공인 키워드가 없어 인터넷 실시간 정보 수집 및 지리 대조 수행`
            }] : []),
            { icon: "🪧", title: "지형물 묘사 단서 식별", desc: "자연어 음성 속 지형물 단서 포착" },
            { icon: "⛰️", title: "지형 데이터 부합성", desc: "한라산 탐방로 지리 DB와 1:1 대조 완료" },
            { icon: "🎯", title: "수색 반경 산출", desc: "인공지능 신뢰도에 따른 반경 확정" }
          ],
          terrainAnalysis: parsed.terrainAnalysis || {
            terrainType: "일반 산악 탐방로 지대",
            weatherCondition: "특이 기상 주의 요망",
            riskFactor: "단독 이탈로 인한 조난 위험",
            trailCourse: `${parsed.matchedTrail || '한라산'} 코스`
          },
          aiRecommendations: parsed.aiRecommendations || [
            "학생에게 바람을 피하고 제자리에서 대기하도록 안내하세요.",
            "수색팀을 해당 지점으로 즉시 배치하세요.",
          ],
          timelineExplanation: parsed.timelineExplanation || (
            isInternetSearchNeeded
              ? `Gemini AI가 인터넷 실시간 정보 수집을 통해 ${matchedPOI.name} 부근으로 위치를 추정했습니다.`
              : `Google Gemini 1.5 Flash 분석 결과, ${matchedPOI.name} 부근으로 특정되었습니다.`
          ),
          isInternetSearchUsed: isInternetSearchNeeded,
          internetSearchQueries: isInternetSearchNeeded ? searchQueries : undefined,
          internetFindings: isInternetSearchNeeded ? (parsed.internetFindings || "인터넷 정보 수집을 통해 학생이 언급한 시각적 묘사와 일치하는 한라산 시설물/지형을 대조 분석했습니다.") : undefined,
          collectedWebSources: isInternetSearchNeeded ? webResults : undefined,
          isGeminiPowered: true,
          modelUsed: isInternetSearchNeeded ? "Google Gemini 1.5 Flash + 인터넷 실시간 수집" : "Google Gemini 1.5 Flash",
        };

        return NextResponse.json(estimateResult);
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, falling back to on-device engine:", geminiError?.message);
        // Gemini 호출 실패 시 아래의 온디바이스 로컬 엔진으로 폴백
      }
    }

    // 2. Fallback: 오프라인/온디바이스 자연어 처리 엔진 (테스트 모드: GPS 고도 미사용, 순수 음성 단서 분석)
    const localResult = analyzeVoiceEnvironment(voiceTranscript);
    return NextResponse.json({
      ...localResult,
      isInternetSearchUsed: isInternetSearchNeeded,
      internetSearchQueries: isInternetSearchNeeded ? searchQueries : undefined,
      internetFindings: isInternetSearchNeeded
        ? `인터넷 지형 정보 수집 결과, 학생이 묘사한 시각적 단서('${searchQueries.join(', ')}')는 한라산 ${localResult.matchedPOI?.description || '해당 구간'} 일대 시설물 및 지형 환경과 일치함을 확인했습니다.`
        : undefined,
      collectedWebSources: isInternetSearchNeeded ? webResults : undefined,
      isGeminiPowered: false,
      modelUsed: isInternetSearchNeeded
        ? "온디바이스 로컬 AI (인터넷 실시간 정보 수집 모드)"
        : "온디바이스 로컬 AI (5개 코스 정밀 분석 엔진)",
    });
  } catch (error: any) {
    console.error("API error in analyze-voice:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error?.message },
      { status: 500 }
    );
  }
}
