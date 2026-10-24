import { LandmarkPOI, AIEstimateResult } from "@/types/rescue";
import { HALLASAN_LANDMARKS } from "@/lib/mountainData";

/**
 * 음성 텍스트에서 한국어 숫자 및 고도(m) 표현을 파싱
 */
function extractAltitudeFromSpeech(text: string): number | undefined {
  // 1. 숫자 + m/미터 (예: "1500m", "1100미터", "해발 750")
  const numMatch = text.match(/(?:해발\s*)?(\d{3,4})\s*(?:m|미터|m쯤|미터쯤)?/i);
  if (numMatch && numMatch[1]) {
    const val = parseInt(numMatch[1], 10);
    if (val >= 500 && val <= 2000) return val;
  }

  // 2. 한글 수사 표현 (예: "천백미터", "천오백", "천삼백")
  if (text.includes("천오백") || text.includes("1500")) return 1500;
  if (text.includes("천백") || text.includes("1100")) return 1100;
  if (text.includes("천이백") || text.includes("1250")) return 1250;
  if (text.includes("천삼백") || text.includes("1324")) return 1324;
  if (text.includes("천칠백") || text.includes("1700")) return 1700;
  if (text.includes("칠백오십") || text.includes("750")) return 750;
  if (text.includes("구백") || text.includes("900")) return 900;
  if (text.includes("천구백") || text.includes("1950")) return 1950;

  return undefined;
}

/**
 * 학생이 음성으로 주변 환경을 말했을 때, AI가 자연어를 분석하여 한라산 등산로 상의 위치를 특정하는 핵심 엔진
 */
export function analyzeVoiceEnvironment(
  voiceTranscript: string,
  lastGpsAlt?: number
): AIEstimateResult {
  const text = voiceTranscript.trim();
  const lowerText = text.toLowerCase();

  const extractedAltitude = extractAltitudeFromSpeech(text);
  const extractedLandmarks: string[] = [];

  // 각 POI와의 매칭 점수 계산
  const scoredPOIs = HALLASAN_LANDMARKS.map((poi) => {
    let score = 0;
    const matchedKeywords: string[] = [];

    // 1. 키워드 매칭
    for (const kw of poi.keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        score += 25;
        matchedKeywords.push(kw);
      }
    }

    // 2. POI 명칭 직접 포함
    if (lowerText.includes(poi.name.toLowerCase())) {
      score += 40;
      matchedKeywords.push(poi.name);
    }

    // 3. 고도 일치도 가산점
    const targetAlt = extractedAltitude || lastGpsAlt;
    if (targetAlt) {
      const altDiff = Math.abs(poi.altitude - targetAlt);
      if (altDiff <= 50) {
        score += 35; // 고도가 50m 이내로 매우 유사
      } else if (altDiff <= 120) {
        score += 20;
      } else if (altDiff > 300) {
        score -= 20; // 고도 차이가 너무 크면 감점
      }
    }

    return {
      poi,
      score,
      matchedKeywords: Array.from(new Set(matchedKeywords)),
    };
  });

  // 점수가 높은 순으로 정렬
  scoredPOIs.sort((a, b) => b.score - a.score);
  const bestMatch = scoredPOIs[0];

  // 단서 추출 목록 취합
  if (extractedAltitude) {
    extractedLandmarks.push(`해발 약 ${extractedAltitude}m 안내판`);
  }
  if (bestMatch.matchedKeywords.length > 0) {
    extractedLandmarks.push(...bestMatch.matchedKeywords);
  }

  // 매칭 신뢰도 계산 (0 ~ 98%)
  let confidence = Math.min(98, Math.max(45, bestMatch.score));
  if (extractedAltitude && bestMatch.matchedKeywords.length > 0) {
    confidence = Math.min(96, Math.max(82, confidence));
  } else if (!extractedAltitude && bestMatch.matchedKeywords.length === 0) {
    confidence = 35; // 단서가 너무 적을 경우
  }

  // 수색 반경 산출 (신뢰도가 높을수록 좁아짐)
  let radiusMeters = 50;
  if (confidence >= 85) radiusMeters = 35;
  else if (confidence >= 70) radiusMeters = 60;
  else if (confidence >= 50) radiusMeters = 100;
  else radiusMeters = 180;

  // 위험도 판정
  let urgencyLevel: 'high' | 'critical' | 'moderate' = 'high';
  if (bestMatch.poi.altitude >= 1600 || text.includes("다쳤") || text.includes("어두") || text.includes("안개")) {
    urgencyLevel = 'critical';
  } else if (bestMatch.poi.altitude <= 1000) {
    urgencyLevel = 'moderate';
  }

  // 조치 권고사항
  const aiRecommendations: string[] = [
    `학생에게 현재 위치(${bestMatch.poi.name} 인근)에서 절대 이동하지 말고 바람을 피할 것을 음성 안내 권장`,
    `수색팀을 한라산 성판악 코스 해발 ${bestMatch.poi.altitude}m 지점(${bestMatch.poi.name}) 반경 ${radiusMeters}m로 집중 배치`,
    `스마트폰 배터리 절전을 위해 학생 단말기 [비상 절전 모드] 자동 활성화`
  ];

  if (bestMatch.poi.type === "spring") {
    aiRecommendations.push("계곡 주변 바위가 미끄러우므로 안전한 등산로 데크 쪽에 앉아 대기하도록 지도");
  }

  // 학부모/교사 공유용 설명문 생성
  const timelineExplanation = extractedAltitude
    ? `학생 음성에서 '해발 ${extractedAltitude}m' 및 '${bestMatch.matchedKeywords.join(", ")}' 단서를 포착하여, 한라산 ${bestMatch.poi.name}(해발 ${bestMatch.poi.altitude}m) 인근 반경 ${radiusMeters}m로 위치를 특정했습니다.`
    : `학생이 언급한 '${bestMatch.matchedKeywords.join(", ") || "지형 묘사"}' 키워드를 분석하여 ${bestMatch.poi.name} 부근으로 추정했습니다.`;

  return {
    analyzedText: text,
    extractedLandmarks: Array.from(new Set(extractedLandmarks)),
    extractedAltitude,
    matchedPOI: bestMatch.poi,
    estimatedLat: bestMatch.poi.lat,
    estimatedLng: bestMatch.poi.lng,
    confidence,
    radiusMeters,
    urgencyLevel,
    aiRecommendations,
    timelineExplanation,
  };
}
