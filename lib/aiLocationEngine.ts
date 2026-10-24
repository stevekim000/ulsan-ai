import { LandmarkPOI, AIEstimateResult } from "@/types/rescue";
import {
  HALLASAN_LANDMARKS,
  HALLASAN_TRAILS,
  HALLASAN_SIGNS,
  LANDMARK_SYNONYMS,
  extractTrailName,
  getAllKeyPoints,
  TrailName,
} from "@/lib/mountainData";

/**
 * 음성 텍스트에서 한국어 숫자 및 고도(m) 표현을 파싱
 */
function extractAltitudeFromSpeech(text: string): number | undefined {
  // 1. 숫자 + m/미터 (예: "1500m", "1100미터", "해발 750")
  const numMatch = text.match(/(?:해발\s*)?(\d{3,4})\s*(?:m|미터|m쯤|미터쯤)?/i);
  if (numMatch && numMatch[1]) {
    const val = parseInt(numMatch[1], 10);
    if (val >= 400 && val <= 2000) return val;
  }

  // 2. 한글 수사 표현 (예: "천오백미터", "천백", "천이백", "천삼백" 등)
  const koreanNumbers: [string, number][] = [
    ["천구백오십", 1950], ["천구백", 1900],
    ["천팔백", 1800], ["천칠백이십", 1720], ["천칠백", 1700],
    ["천육백오십", 1650], ["천육백팔십", 1680], ["천육백", 1600],
    ["천오백팔십", 1580], ["천오백오십", 1550], ["천오백삼십", 1530], ["천오백", 1500],
    ["천사백오십", 1450], ["천사백이십", 1420], ["천사백", 1400],
    ["천삼백이십사", 1324], ["천삼백삼십", 1330], ["천삼백", 1300],
    ["천이백팔십", 1280], ["천이백오십", 1250], ["천이백", 1200],
    ["천백", 1100], ["천사십", 1040], ["천", 1000],
    ["구백칠십", 970], ["구백오십", 950], ["구백십", 910], ["구백", 900],
    ["팔백오십", 850], ["팔백", 800],
    ["칠백오십", 750], ["칠백이십", 720], ["칠백", 700],
    ["육백이십", 620], ["육백", 600],
    ["사백구십", 490], ["오백", 500],
  ];

  for (const [word, val] of koreanNumbers) {
    if (text.includes(word)) return val;
  }

  return undefined;
}

/**
 * 표지판 코드 추출 (예: "영실 1-14", "성판악 1-24", "관음사 2-12")
 */
function extractSignCode(text: string): string | null {
  // 표지목 패턴: "영실 1-14", "성판악 1-24", "관음사 2-12", "어리목 1-8", "돈내코 1-16"
  const signMatch = text.match(/(영실|성판악|관음사|어리목|돈내코|사라오름|남벽)\s*(\d+)\s*[-‐–—]\s*(\d+)/);
  if (signMatch) {
    return `${signMatch[1]} ${signMatch[2]}-${signMatch[3]}`;
  }
  return null;
}

/**
 * 국가지점번호 추출 (예: "다라 0155 8122", "다사 0670 7960")
 */
function extractNationalCode(text: string): string | null {
  const gCodeMatch = text.match(/(다[라사])\s*(\d{4})\s*(\d{4})/);
  if (gCodeMatch) {
    return `${gCodeMatch[1]} ${gCodeMatch[2]} ${gCodeMatch[3]}`;
  }
  return null;
}

/**
 * 거리 정보 추출 (예: "정상까지 2.3km", "3km 남았다")
 */
function extractDistanceFromSpeech(text: string): number | null {
  const distMatch = text.match(/(?:정상|대피소|오름|분기점|까지|남은거리|앞으로)?\s*(\d+(?:\.\d+)?)\s*(?:km|킬로|킬로미터)/i);
  if (distMatch && distMatch[1]) {
    const val = parseFloat(distMatch[1]);
    if (val > 0 && val <= 20) return val;
  }
  return null;
}

/**
 * 학생이 음성으로 주변 환경을 말했을 때, AI가 자연어를 분석하여 한라산 등산로 상의 위치를 특정하는 핵심 엔진
 * (5개 코스 전체 + 표지판 코드 + 국가지점번호 + 동의어 사전 활용)
 */
export function analyzeVoiceEnvironment(
  voiceTranscript: string,
  lastGpsAlt?: number
): AIEstimateResult {
  const text = voiceTranscript.trim();
  const lowerText = text.toLowerCase();
  const cleanText = text.replace(/\s+/g, '');

  const extractedAltitude = extractAltitudeFromSpeech(text);
  const extractedSignCode = extractSignCode(text);
  const extractedGCode = extractNationalCode(text);
  const extractedTrail = extractTrailName(text);
  const extractedDistance = extractDistanceFromSpeech(text);
  const extractedLandmarks: string[] = [];

  // ========================================
  // 1단계: 표지판 코드로 정확한 위치 특정 (최고 우선순위)
  // ========================================
  if (extractedSignCode) {
    const signMatch = HALLASAN_SIGNS.find(s =>
      s.code === extractedSignCode || s.code.replace(/\s/g, '') === extractedSignCode.replace(/\s/g, '')
    );
    if (signMatch) {
      extractedLandmarks.push(`표지목 ${signMatch.code}`);
      if (extractedAltitude) extractedLandmarks.push(`해발 약 ${extractedAltitude}m`);

      return {
        analyzedText: text,
        extractedLandmarks,
        extractedAltitude: signMatch.alt,
        matchedPOI: {
          id: `sign-${signMatch.code}`,
          name: signMatch.name,
          type: "signpost",
          altitude: signMatch.alt,
          lat: signMatch.lat,
          lng: signMatch.lng,
          description: `${signMatch.trail} 코스 ${signMatch.code} (${signMatch.gCode}) - 해발 ${signMatch.alt}m`,
          keywords: [signMatch.code, signMatch.gCode, signMatch.name, String(signMatch.alt)]
        },
        estimatedLat: signMatch.lat,
        estimatedLng: signMatch.lng,
        confidence: 97,
        radiusMeters: 20,
        urgencyLevel: signMatch.alt >= 1600 ? 'critical' : signMatch.alt <= 1000 ? 'moderate' : 'high',
        aiRecommendations: [
          `표지목 '${signMatch.code}'(국가지점번호: ${signMatch.gCode})이 정확히 식별되었습니다. 해발 ${signMatch.alt}m, ${signMatch.trail} 코스입니다.`,
          `수색팀을 ${signMatch.trail} 코스 ${signMatch.name} 반경 20m로 즉시 배치하세요.`,
          `학생에게 표지목 옆에서 움직이지 말고 대기하도록 안내하세요.`
        ],
        timelineExplanation: `학생이 보고한 위치표지목 '${signMatch.code}'을 한라산 표지판 데이터베이스에서 정밀 조회하여, ${signMatch.trail} 코스 ${signMatch.name}(해발 ${signMatch.alt}m, 좌표 ${signMatch.lat},${signMatch.lng})으로 위치를 확정했습니다.`
      };
    }
  }

  // ========================================
  // 2단계: 국가지점번호로 정확한 위치 특정
  // ========================================
  if (extractedGCode) {
    const gMatch = HALLASAN_SIGNS.find(s =>
      s.gCode === extractedGCode || s.gCode.replace(/\s/g, '') === extractedGCode.replace(/\s/g, '')
    );
    if (gMatch) {
      extractedLandmarks.push(`국가지점번호 ${gMatch.gCode}`);

      return {
        analyzedText: text,
        extractedLandmarks,
        extractedAltitude: gMatch.alt,
        matchedPOI: {
          id: `gcode-${gMatch.gCode}`,
          name: gMatch.name,
          type: "signpost",
          altitude: gMatch.alt,
          lat: gMatch.lat,
          lng: gMatch.lng,
          description: `국가지점번호 ${gMatch.gCode} → ${gMatch.trail} 코스 ${gMatch.code} - 해발 ${gMatch.alt}m`,
          keywords: [gMatch.code, gMatch.gCode, gMatch.name, String(gMatch.alt)]
        },
        estimatedLat: gMatch.lat,
        estimatedLng: gMatch.lng,
        confidence: 98,
        radiusMeters: 15,
        urgencyLevel: gMatch.alt >= 1600 ? 'critical' : gMatch.alt <= 1000 ? 'moderate' : 'high',
        aiRecommendations: [
          `국가지점번호 '${gMatch.gCode}'이 정확히 조회되었습니다. ${gMatch.trail} 코스 ${gMatch.name}(해발 ${gMatch.alt}m).`,
          `119 신고 시 국가지점번호 '${gMatch.gCode}'를 전달하면 즉시 위치를 특정할 수 있습니다.`,
          `수색팀을 반경 15m로 집중 배치하세요.`
        ],
        timelineExplanation: `학생이 보고한 국가지점번호 '${gMatch.gCode}'를 조회하여, ${gMatch.trail} 코스 ${gMatch.name}(해발 ${gMatch.alt}m)으로 위치를 확정했습니다. 119 신고 시 이 번호를 전달하세요.`
      };
    }
  }

  // ========================================
  // 3단계: 동의어 사전으로 랜드마크 매칭
  // ========================================
  let synonymMatch: typeof LANDMARK_SYNONYMS[0] | null = null;
  let synonymScore = 0;

  for (const syn of LANDMARK_SYNONYMS) {
    let score = 0;
    for (const kw of syn.keywords) {
      if (lowerText.includes(kw.toLowerCase()) || cleanText.includes(kw.replace(/\s/g, ''))) {
        score += 30;
      }
    }
    // 코스명도 일치하면 가산
    if (extractedTrail && syn.trail === extractedTrail) {
      score += 15;
    }
    // 고도가 유사하면 가산
    if (extractedAltitude) {
      const altDiff = Math.abs(syn.alt - extractedAltitude);
      if (altDiff <= 30) score += 25;
      else if (altDiff <= 80) score += 15;
    }
    if (score > synonymScore) {
      synonymScore = score;
      synonymMatch = syn;
    }
  }

  if (synonymMatch && synonymScore >= 30) {
    extractedLandmarks.push(synonymMatch.name);
    if (extractedAltitude) extractedLandmarks.push(`해발 약 ${extractedAltitude}m`);
    if (extractedTrail) extractedLandmarks.push(`${extractedTrail} 코스`);

    const confidence = Math.min(96, Math.max(75, synonymScore + 40));

    return {
      analyzedText: text,
      extractedLandmarks: Array.from(new Set(extractedLandmarks)),
      extractedAltitude: synonymMatch.alt,
      matchedPOI: {
        id: `syn-${synonymMatch.signCode}`,
        name: synonymMatch.name,
        type: synonymMatch.name.includes("대피소") ? "shelter"
          : synonymMatch.name.includes("바위") ? "rock"
          : synonymMatch.name.includes("정상") || synonymMatch.name.includes("릉") ? "ridge"
          : synonymMatch.name.includes("갈림") || synonymMatch.name.includes("분기") ? "crossroad"
          : synonymMatch.name.includes("샘") || synonymMatch.name.includes("물") ? "spring"
          : "signpost",
        altitude: synonymMatch.alt,
        lat: synonymMatch.lat,
        lng: synonymMatch.lng,
        description: `${synonymMatch.trail} 코스 - ${synonymMatch.name} (해발 ${synonymMatch.alt}m) [표지목: ${synonymMatch.signCode}]`,
        keywords: [...synonymMatch.keywords, synonymMatch.signCode, String(synonymMatch.alt)]
      },
      estimatedLat: synonymMatch.lat,
      estimatedLng: synonymMatch.lng,
      confidence,
      radiusMeters: confidence >= 90 ? 25 : confidence >= 80 ? 40 : 60,
      urgencyLevel: synonymMatch.alt >= 1600 || text.includes("다쳤") || text.includes("어두") || text.includes("안개") ? 'critical'
        : synonymMatch.alt <= 1000 ? 'moderate' : 'high',
      aiRecommendations: [
        `학생이 언급한 '${synonymMatch.keywords[0]}'을 랜드마크 사전에서 매칭하여, ${synonymMatch.trail} 코스 ${synonymMatch.name}(해발 ${synonymMatch.alt}m)으로 특정했습니다.`,
        `수색팀을 ${synonymMatch.trail} 코스 해발 ${synonymMatch.alt}m 지점 반경 ${confidence >= 90 ? 25 : confidence >= 80 ? 40 : 60}m로 배치하세요.`,
        `학생에게 현재 위치에서 이동하지 말고 바람을 피할 것을 안내하세요.`
      ],
      timelineExplanation: `학생 음성에서 '${synonymMatch.keywords[0]}' 키워드를 포착하여, ${synonymMatch.trail} 코스 ${synonymMatch.name}(해발 ${synonymMatch.alt}m, 표지목 ${synonymMatch.signCode})으로 위치를 특정했습니다.`
    };
  }

  // ========================================
  // 4단계: 코스명 + 고도 조합으로 최근접 키포인트 매칭
  // ========================================
  if (extractedTrail && extractedAltitude) {
    const trailData = HALLASAN_TRAILS[extractedTrail];
    if (trailData) {
      // 해당 코스에서 고도가 가장 유사한 키포인트 찾기
      let closestPoint = trailData.keyPoints[0];
      let minDiff = Infinity;

      for (const kp of trailData.keyPoints) {
        const diff = Math.abs(kp.alt - extractedAltitude);
        if (diff < minDiff) {
          minDiff = diff;
          closestPoint = kp;
        }
      }

      extractedLandmarks.push(`${extractedTrail} 코스`);
      extractedLandmarks.push(`해발 약 ${extractedAltitude}m`);

      const confidence = minDiff <= 30 ? 92 : minDiff <= 80 ? 82 : minDiff <= 150 ? 70 : 55;

      return {
        analyzedText: text,
        extractedLandmarks: Array.from(new Set(extractedLandmarks)),
        extractedAltitude,
        matchedPOI: {
          id: `trail-${extractedTrail}-${closestPoint.alt}`,
          name: closestPoint.name,
          type: "signpost",
          altitude: closestPoint.alt,
          lat: closestPoint.lat,
          lng: closestPoint.lng,
          description: `${extractedTrail} 코스 - ${closestPoint.name} (해발 ${closestPoint.alt}m) [표지목: ${closestPoint.signCode}]`,
          keywords: [closestPoint.signCode, closestPoint.name, String(closestPoint.alt)]
        },
        estimatedLat: closestPoint.lat,
        estimatedLng: closestPoint.lng,
        confidence,
        radiusMeters: confidence >= 90 ? 30 : confidence >= 75 ? 50 : 100,
        urgencyLevel: closestPoint.alt >= 1600 || text.includes("다쳤") || text.includes("어두") || text.includes("안개") ? 'critical'
          : closestPoint.alt <= 1000 ? 'moderate' : 'high',
        aiRecommendations: [
          `${extractedTrail} 코스 해발 ${extractedAltitude}m 부근 → ${closestPoint.name}(해발 ${closestPoint.alt}m, 표지목 ${closestPoint.signCode})으로 위치 특정.`,
          `수색팀을 ${extractedTrail} 코스 ${closestPoint.name} 반경 ${confidence >= 90 ? 30 : confidence >= 75 ? 50 : 100}m로 배치하세요.`,
          `학생에게 현재 위치에서 이동하지 말 것을 안내하세요.`
        ],
        timelineExplanation: `학생이 '${extractedTrail} 코스 해발 ${extractedAltitude}m'라고 보고하여, 해당 코스에서 고도가 가장 일치하는 ${closestPoint.name}(해발 ${closestPoint.alt}m)으로 위치를 특정했습니다.`
      };
    }
  }

  // ========================================
  // 5단계: 전체 POI에서 키워드 + 고도 종합 매칭 (기존 로직 고도화)
  // ========================================
  const allKeyPoints = getAllKeyPoints();

  const scoredPOIs = allKeyPoints.map((kp) => {
    let score = 0;
    const matchedKeywords: string[] = [];

    // 키포인트명 포함 여부
    const kpNameClean = kp.name.replace(/[()（）]/g, ' ');
    const nameWords = kpNameClean.split(/[\s/]+/).filter(w => w.length > 1);
    for (const word of nameWords) {
      if (lowerText.includes(word.toLowerCase())) {
        score += 20;
        matchedKeywords.push(word);
      }
    }

    // 표지목 코드 포함 여부
    if (lowerText.includes(kp.signCode.toLowerCase()) || cleanText.includes(kp.signCode.replace(/\s/g, ''))) {
      score += 40;
      matchedKeywords.push(kp.signCode);
    }

    // 코스명 일치
    if (extractedTrail && kp.trail === extractedTrail) {
      score += 15;
    }

    // 고도 일치도 가산점
    const targetAlt = extractedAltitude || lastGpsAlt;
    if (targetAlt) {
      const altDiff = Math.abs(kp.alt - targetAlt);
      if (altDiff <= 30) score += 35;
      else if (altDiff <= 80) score += 25;
      else if (altDiff <= 150) score += 10;
      else if (altDiff > 300) score -= 15;
    }

    return {
      kp,
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
  if (extractedTrail) {
    extractedLandmarks.push(`${extractedTrail} 코스`);
  }
  if (bestMatch.matchedKeywords.length > 0) {
    extractedLandmarks.push(...bestMatch.matchedKeywords);
  }

  // 매칭 신뢰도 계산 (0 ~ 98%)
  let confidence = Math.min(98, Math.max(40, bestMatch.score));
  if (extractedAltitude && bestMatch.matchedKeywords.length > 0) {
    confidence = Math.min(96, Math.max(80, confidence));
  } else if (extractedTrail && extractedAltitude) {
    confidence = Math.min(90, Math.max(70, confidence));
  } else if (!extractedAltitude && bestMatch.matchedKeywords.length === 0) {
    confidence = 30;
  }

  // 수색 반경 산출
  let radiusMeters = 50;
  if (confidence >= 90) radiusMeters = 25;
  else if (confidence >= 80) radiusMeters = 40;
  else if (confidence >= 65) radiusMeters = 70;
  else if (confidence >= 50) radiusMeters = 100;
  else radiusMeters = 180;

  // 위험도 판정
  let urgencyLevel: 'high' | 'critical' | 'moderate' = 'high';
  if (bestMatch.kp.alt >= 1600 || text.includes("다쳤") || text.includes("어두") || text.includes("안개") || text.includes("추워") || text.includes("비")) {
    urgencyLevel = 'critical';
  } else if (bestMatch.kp.alt <= 1000) {
    urgencyLevel = 'moderate';
  }

  // 조치 권고사항
  const aiRecommendations: string[] = [
    `학생에게 현재 위치(${bestMatch.kp.name} 인근)에서 절대 이동하지 말고 바람을 피할 것을 안내하세요.`,
    `수색팀을 한라산 ${bestMatch.kp.trail} 코스 해발 ${bestMatch.kp.alt}m 지점(${bestMatch.kp.name}) 반경 ${radiusMeters}m로 집중 배치하세요.`,
    `스마트폰 배터리 절전을 위해 학생 단말기 비상 절전 모드를 활성화하세요.`
  ];

  if (bestMatch.kp.name.includes("대피소")) {
    aiRecommendations.push(`근처 대피소(${bestMatch.kp.name})로 이동하여 보호받을 수 있도록 안내하세요.`);
  }

  // 학부모/교사 공유용 설명문
  const timelineExplanation = extractedAltitude
    ? `학생 음성에서 '해발 ${extractedAltitude}m' 및 '${bestMatch.matchedKeywords.join(", ")}' 단서를 포착하여, 한라산 ${bestMatch.kp.trail} 코스 ${bestMatch.kp.name}(해발 ${bestMatch.kp.alt}m) 인근 반경 ${radiusMeters}m로 위치를 특정했습니다.`
    : `학생이 언급한 '${bestMatch.matchedKeywords.join(", ") || "지형 묘사"}' 키워드를 분석하여 ${bestMatch.kp.trail} 코스 ${bestMatch.kp.name} 부근으로 추정했습니다.`;

  return {
    analyzedText: text,
    extractedLandmarks: Array.from(new Set(extractedLandmarks)),
    extractedAltitude,
    matchedPOI: {
      id: `halla-${bestMatch.kp.trail}-${bestMatch.kp.alt}`,
      name: bestMatch.kp.name,
      type: bestMatch.kp.name.includes("대피소") || bestMatch.kp.name.includes("쉼터") ? "shelter"
        : bestMatch.kp.name.includes("바위") ? "rock"
        : bestMatch.kp.name.includes("정상") || bestMatch.kp.name.includes("릉") ? "ridge"
        : bestMatch.kp.name.includes("갈림") || bestMatch.kp.name.includes("분기") ? "crossroad"
        : bestMatch.kp.name.includes("샘") || bestMatch.kp.name.includes("물") ? "spring"
        : "signpost",
      altitude: bestMatch.kp.alt,
      lat: bestMatch.kp.lat,
      lng: bestMatch.kp.lng,
      description: `${bestMatch.kp.trail} 코스 - ${bestMatch.kp.name} (해발 ${bestMatch.kp.alt}m) [표지목: ${bestMatch.kp.signCode}]`,
      keywords: [bestMatch.kp.signCode, ...bestMatch.matchedKeywords, String(bestMatch.kp.alt)]
    },
    estimatedLat: bestMatch.kp.lat,
    estimatedLng: bestMatch.kp.lng,
    confidence,
    radiusMeters,
    urgencyLevel,
    aiRecommendations,
    timelineExplanation,
  };
}
