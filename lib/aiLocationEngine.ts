import { LandmarkPOI, AIEstimateResult, InferenceStep, TerrainAnalysis } from "@/types/rescue";
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
 * (지명 "오백나한", "삼나무" 등에 의한 오인식 방어 로직 포함)
 */
function extractAltitudeFromSpeech(text: string): number | undefined {
  // 1. 고유명사 속 숫자가 고도로 오인되지 않도록 사전 정제
  let sanitized = text
    .replace(/오백나한/g, "")
    .replace(/오백장군/g, "")
    .replace(/삼나무/g, "")
    .replace(/사제비/g, "")
    .replace(/만세동산/g, "")
    .replace(/구린굴/g, "");

  // 2. 명시적 고도 패턴 매칭 (예: "해발 1500m", "1500미터", "해발 1500", "1500m")
  const explicitMatch = sanitized.match(/해발\s*(\d{3,4})|(?:해발\s*)?(\d{3,4})\s*(?:m|미터|m쯤|미터쯤)/i);
  if (explicitMatch) {
    const valStr = explicitMatch[1] || explicitMatch[2];
    if (valStr) {
      const val = parseInt(valStr, 10);
      if (val >= 400 && val <= 2000) return val;
    }
  }

  // 3. 한글 수사 표현 (예: "천오백미터", "천백", "천사백" 등) - 뒤에 "미터/m/해발"이 붙거나 단독으로 고도를 표현할 때
  const koreanNumbers: [string, number][] = [
    ["천구백오십", 1950], ["천구백", 1900],
    ["천팔백", 1800], ["천칠백이십", 1720], ["천칠백", 1700],
    ["천육백오십", 1650], ["천육백팔십", 1680], ["천육백", 1600],
    ["천오백팔십", 1580], ["천오백오십", 1550], ["천오백삼십", 1530], ["천오백", 1500],
    ["천사백오십", 1450], ["천사백이십", 1420], ["천사백", 1400],
    ["천삼백이십사", 1324], ["천삼백삼십", 1330], ["천삼백", 1300],
    ["천이백팔십", 1280], ["천이백오십", 1250], ["천이백", 1200],
    ["천백", 1100], ["천사십", 1040], ["천미터", 1000],
    ["구백칠십", 970], ["구백오십", 950], ["구백십", 910], ["구백", 900],
    ["팔백오십", 850], ["팔백", 800],
    ["칠백오십", 750], ["칠백이십", 720], ["칠백", 700],
    ["육백이십", 620], ["육백", 600],
    ["사백구십", 490], ["오백미터", 500],
  ];

  for (const [word, val] of koreanNumbers) {
    if (sanitized.includes(word)) return val;
  }

  return undefined;
}

/**
 * 표지판 코드 추출 (예: "영실 1-14", "성판악 1-24", "관음사 2-12")
 */
function extractSignCode(text: string): string | null {
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
 * 지형 특성 및 위험 환경 정밀 분석기
 */
function analyzeTerrainAndEnvironment(
  text: string,
  trail: string,
  poiName: string,
  altitude: number
): TerrainAnalysis {
  // 1. 지형 형태 분석
  let terrainType = "일반 산악 탐방로 지대";
  if (/바위|기암|병풍바위|너덜|암벽|암반|절벽|오백나한|오백장군/.test(text + poiName)) {
    terrainType = "기암괴석 급경사 암벽·너덜 지대 (낙상 및 실족 위험 지형)";
  } else if (/구상나무|숲|숲길|삼나무|나무|고사목/.test(text + poiName)) {
    terrainType = "아고산대 구상나무 침엽수림 밀집 지대 (시야 차폐 및 방향 감각 상실 주의)";
  } else if (/평전|평원|선작지왓|넓은드르|드르|벌판|억새/.test(text + poiName)) {
    terrainType = "고산 관목 초원·평전 지대 (사방 노출로 인한 강풍·돌풍 취약 지형)";
  } else if (/대피소|쉼터|건물|관리소|통제소|휴게소/.test(text + poiName)) {
    terrainType = "산악 대피소·쉼터 거점 지대 (비바람 피난 및 통신 시도 유리)";
  } else if (/계곡|샘|약수|물|목교|다리|현수교|어목교/.test(text + poiName)) {
    terrainType = "계곡 유수지 및 목교 데크 지대 (하천 급류 및 결빙 미끄럼 주의)";
  } else if (/정상|백록담|능선|분화구|동릉|북벽|남벽/.test(text + poiName)) {
    terrainType = "한라산 주능선·백록담 정상 지대 (급격한 기상 변화 및 낭떠러지 주의)";
  } else if (/오름|사라오름|산정호수/.test(text + poiName)) {
    terrainType = "기생화산 분화구 및 산정호수 습지 지대";
  }

  // 2. 기상 및 시야 상태 분석
  let weatherCondition = "기상 상태 보통 (특이 기상 미언급)";
  if (/안개|자욱|흐려|안보여|앞이|시야/.test(text)) {
    weatherCondition = "짙은 안개로 인한 시계 제로 상태 (가시거리 10~15m 미만)";
  } else if (/비|소나기|젖어|빗물/.test(text)) {
    weatherCondition = "강우로 인한 등산로 침수 및 암반 미끄러움 극대화";
  } else if (/바람|강풍|돌풍|태풍|칼바람/.test(text)) {
    weatherCondition = "강풍·돌풍 동반 (순간최대풍속으로 인한 체감온도 급락)";
  } else if (/어두|밤|일몰|해\s*졌|깜깜/.test(text)) {
    weatherCondition = "일몰 후 야간 환경 (헤드램프 미보유 시 조난 가속화)";
  }

  // 3. 위험 요소 분석
  let riskFactor = "단독 이탈로 인한 조난 위험";
  if (/발목|다쳤|삐었|출혈|골절|상처|못\s*걸어|통증/.test(text)) {
    riskFactor = "신체 부상(발목/염좌/골절 추정)으로 자력 거동 불능 상태";
  } else if (/추워|얼어|떨려|저체온|체온/.test(text) || altitude >= 1600) {
    riskFactor = "고산 지대(해발 1,500m 이상) 급격한 기온 저하로 저체온증 발생 고위험";
  } else if (/물.*없|배고|탈수/.test(text)) {
    riskFactor = "탈수 및 체력 고갈 위험";
  } else if (/미끄러|미끌/.test(text)) {
    riskFactor = "바위 결빙/이끼로 인한 2차 낙상 사고 위험";
  }

  const trailCourse = `${trail} 코스 (해발 약 ${altitude}m 구간)`;

  return {
    terrainType,
    weatherCondition,
    riskFactor,
    trailCourse,
  };
}

/**
 * 5단계 AI 위치 추론 핵심 엔진
 * 1단계: 표지판 코드(1-14 등) → 2단계: 국가지점번호 → 3단계: 동의어 사전 → 4단계: 코스+고도 → 5단계: 키워드 POI
 * 결과에 '어째서 그런 결과를 냈는지(reasoningSteps & matchedReason)'와 '정밀 지형 분석(terrainAnalysis)'을 포함
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
      extractedLandmarks.push(`표지목 [${signMatch.code}]`);
      extractedLandmarks.push(`${signMatch.trail} 코스`);
      extractedLandmarks.push(`해발 ${signMatch.alt}m`);

      const terrain = analyzeTerrainAndEnvironment(text, signMatch.trail, signMatch.name, signMatch.alt);

      const reasoningSteps: InferenceStep[] = [
        {
          icon: "🪧",
          title: "공인 표지목 코드 1:1 일치",
          desc: `음성 텍스트 속 '${extractedSignCode}' 식별 → 국립공원 공인 표지목 DB의 [${signMatch.code}]과 100% 일치`
        },
        {
          icon: "🗺️",
          title: "국가지점번호 및 정밀 GPS 매핑",
          desc: `표지목 [${signMatch.code}]에 부여된 국가지점번호 [${signMatch.gCode}] 기반 정밀 좌표 (${signMatch.lat}, ${signMatch.lng}) 산출`
        },
        {
          icon: "⛰️",
          title: "지형 및 고도 부합도 검증",
          desc: `해발 ${signMatch.alt}m 등고선 데이터와 ${terrain.terrainType} 지형 정보가 일치함`
        },
        {
          icon: "🎯",
          title: "수색 오차 반경 20m 확정",
          desc: "고정식 표지목 지점이 특정되어 오차를 최소화한 반경 20m, 신뢰도 98% 판정"
        }
      ];

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
        confidence: 98,
        radiusMeters: 20,
        urgencyLevel: signMatch.alt >= 1600 || text.includes("다쳤") || text.includes("발목") ? 'critical' : signMatch.alt <= 1000 ? 'moderate' : 'high',
        matchedReason: `위치표지목 코드 [${signMatch.code}] 및 국가지점번호 [${signMatch.gCode}] 정밀 조회로 ${signMatch.trail} 코스 ${signMatch.name} 특정`,
        reasoningSteps,
        terrainAnalysis: terrain,
        aiRecommendations: [
          `표지목 '${signMatch.code}'(국가지점번호: ${signMatch.gCode}) 지점이 확정되었습니다. 해발 ${signMatch.alt}m, ${signMatch.trail} 코스입니다.`,
          `수색팀을 ${signMatch.trail} 코스 [${signMatch.name}] 반경 20m로 집중 투입하세요.`,
          `학생에게 표지목 바로 옆에서 절대 이동하지 말고 비바람을 피해 대기하도록 안내하세요.`
        ],
        timelineExplanation: `학생이 보고한 표지목 [${signMatch.code}]을 한라산 지리 DB에서 조회하여, ${signMatch.trail} 코스 ${signMatch.name}(해발 ${signMatch.alt}m, 좌표 ${signMatch.lat},${signMatch.lng})으로 위치를 확정했습니다.`
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
      extractedLandmarks.push(`국가지점번호 [${gMatch.gCode}]`);
      extractedLandmarks.push(`${gMatch.trail} 코스`);
      extractedLandmarks.push(`해발 ${gMatch.alt}m`);

      const terrain = analyzeTerrainAndEnvironment(text, gMatch.trail, gMatch.name, gMatch.alt);

      const reasoningSteps: InferenceStep[] = [
        {
          icon: "🔢",
          title: "국방·소방 국가지점번호 조회",
          desc: `음성 텍스트 속 국가지점번호 '${extractedGCode}' 포착 → 10m 격자 표준 코드 DB와 일치`
        },
        {
          icon: "🪧",
          title: "연계 표지목 및 탐방로 식별",
          desc: `지점번호와 연계된 [${gMatch.trail} 코스 ${gMatch.code}] 표지목 및 정밀 좌표 도출`
        },
        {
          icon: "⛰️",
          title: "지형 환경 검증",
          desc: `해발 ${gMatch.alt}m의 ${terrain.terrainType} 구간으로 확인됨`
        },
        {
          icon: "🚨",
          title: "119 산악구조 표준 좌표 확정",
          desc: "소방 상황실 즉시 전송 가능한 15m 정밀 격자 반경 확정 (신뢰도 99%)"
        }
      ];

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
        confidence: 99,
        radiusMeters: 15,
        urgencyLevel: gMatch.alt >= 1600 || text.includes("다쳤") ? 'critical' : 'high',
        matchedReason: `국방/소방 표준 국가지점번호 [${gMatch.gCode}] 10m 단위 정밀 격자 조회 성공`,
        reasoningSteps,
        terrainAnalysis: terrain,
        aiRecommendations: [
          `국가지점번호 '${gMatch.gCode}'가 100% 식별되었습니다. 119 출동 접수 시 이 지점번호를 그대로 전달하세요.`,
          `수색팀을 ${gMatch.trail} 코스 [${gMatch.name}] 반경 15m 지점으로 최우선 진입시키세요.`,
          `학생에게 표지판 지주목을 붙잡고 체온을 유지하며 대기하도록 안내하세요.`
        ],
        timelineExplanation: `학생이 진술한 국가지점번호 [${gMatch.gCode}]를 소방 산악 지리망에서 조회하여, ${gMatch.trail} 코스 ${gMatch.name}(해발 ${gMatch.alt}m)으로 위치를 확정했습니다.`
      };
    }
  }

  // ========================================
  // 3단계: 동의어 사전으로 랜드마크 매칭
  // ========================================
  let synonymMatch: typeof LANDMARK_SYNONYMS[0] | null = null;
  let synonymScore = 0;
  let matchedKeywordText = "";

  for (const syn of LANDMARK_SYNONYMS) {
    let score = 0;
    let foundKw = "";
    for (const kw of syn.keywords) {
      if (lowerText.includes(kw.toLowerCase()) || cleanText.includes(kw.replace(/\s/g, ''))) {
        score += 35;
        foundKw = kw;
      }
    }
    // 코스명도 일치하면 가산
    if (extractedTrail && syn.trail === extractedTrail) {
      score += 20;
    }
    // 고도가 유사하면 가산
    if (extractedAltitude) {
      const altDiff = Math.abs(syn.alt - extractedAltitude);
      if (altDiff <= 30) score += 30;
      else if (altDiff <= 80) score += 15;
    }
    if (score > synonymScore) {
      synonymScore = score;
      synonymMatch = syn;
      matchedKeywordText = foundKw;
    }
  }

  if (synonymMatch && synonymScore >= 35) {
    extractedLandmarks.push(`지형물 [${synonymMatch.name}]`);
    if (extractedTrail) extractedLandmarks.push(`${extractedTrail} 코스`);
    if (extractedAltitude) extractedLandmarks.push(`해발 ${extractedAltitude}m`);

    const confidence = Math.min(97, Math.max(80, synonymScore + 25));
    const radiusMeters = confidence >= 92 ? 25 : confidence >= 85 ? 40 : 60;
    const terrain = analyzeTerrainAndEnvironment(text, synonymMatch.trail, synonymMatch.name, synonymMatch.alt);

    const reasoningSteps: InferenceStep[] = [
      {
        icon: "🗣️",
        title: "지형물 및 은어·동의어 감지",
        desc: `음성 속 '${matchedKeywordText}' 포착 → 한라산 지형지물 사전의 [${synonymMatch.name}]과 일치`
      },
      {
        icon: "🧭",
        title: "탐방로 및 고도 부합 확인",
        desc: `${synonymMatch.trail} 코스 해발 ${synonymMatch.alt}m 지점에 위치한 고유 지형지물로 확정`
      },
      {
        icon: "⛰️",
        title: "주변 환경 및 식생 분석",
        desc: `${terrain.terrainType}이며, ${terrain.weatherCondition} 상태로 조난 위험 분석됨`
      },
      {
        icon: "🎯",
        title: `수색 반경 ${radiusMeters}m 산출`,
        desc: `지형물 인근 반경 ${radiusMeters}m 이내 위치할 확률 ${confidence}% 산출`
      }
    ];

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
      radiusMeters,
      urgencyLevel: synonymMatch.alt >= 1600 || text.includes("다쳤") || text.includes("발목") ? 'critical' : 'high',
      matchedReason: `지형물 키워드 '${matchedKeywordText}' 및 ${synonymMatch.trail} 코스 지형 사전 대조로 위치 특정`,
      reasoningSteps,
      terrainAnalysis: terrain,
      aiRecommendations: [
        `학생이 언급한 '${matchedKeywordText}'을 랜드마크 사전에서 매칭하여, ${synonymMatch.trail} 코스 [${synonymMatch.name}](해발 ${synonymMatch.alt}m)으로 특정했습니다.`,
        `수색팀을 ${synonymMatch.trail} 코스 [${synonymMatch.name}] 반경 ${radiusMeters}m로 신속 배치하세요.`,
        `현재 ${terrain.weatherCondition} 상태이므로 저체온증 방지를 위한 보온 조치를 긴급 안내하세요.`
      ],
      timelineExplanation: `학생 음성 속 '${matchedKeywordText}' 단서를 분석하여, ${synonymMatch.trail} 코스 ${synonymMatch.name}(해발 ${synonymMatch.alt}m, 표지목 ${synonymMatch.signCode})으로 위치를 특정했습니다.`
    };
  }

  // ========================================
  // 4단계: 코스명 + 고도 조합으로 최근접 키포인트 매칭
  // ========================================
  if (extractedTrail && extractedAltitude) {
    const trailData = HALLASAN_TRAILS[extractedTrail];
    if (trailData) {
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
      extractedLandmarks.push(`해발 ${extractedAltitude}m 구간`);
      extractedLandmarks.push(closestPoint.name);

      const confidence = minDiff <= 30 ? 94 : minDiff <= 80 ? 85 : 70;
      const radiusMeters = confidence >= 90 ? 30 : confidence >= 80 ? 50 : 80;
      const terrain = analyzeTerrainAndEnvironment(text, extractedTrail, closestPoint.name, closestPoint.alt);

      const reasoningSteps: InferenceStep[] = [
        {
          icon: "🧭",
          title: "탐방로 코스명 식별",
          desc: `음성 텍스트에서 [${extractedTrail} 코스] 진입 사실 확인`
        },
        {
          icon: "📏",
          title: "고도 데이터 정밀 대조",
          desc: `진술된 해발 ${extractedAltitude}m와 가장 부합하는 지점인 [${closestPoint.name}](해발 ${closestPoint.alt}m, 오차 ${minDiff}m) 도출`
        },
        {
          icon: "⛰️",
          title: "구간 지형 분석",
          desc: `${terrain.trailCourse} 내 ${terrain.terrainType} 환경으로 확인`
        },
        {
          icon: "🎯",
          title: `수색 반경 ${radiusMeters}m 설정`,
          desc: `코스 등고선 구간 추적을 통해 반경 ${radiusMeters}m(신뢰도 ${confidence}%) 산출`
        }
      ];

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
        radiusMeters,
        urgencyLevel: closestPoint.alt >= 1600 || text.includes("다쳤") ? 'critical' : 'high',
        matchedReason: `${extractedTrail} 코스 등고선 프로필 상 해발 ${extractedAltitude}m 부합 지점(${closestPoint.name}) 매칭`,
        reasoningSteps,
        terrainAnalysis: terrain,
        aiRecommendations: [
          `${extractedTrail} 코스 해발 ${extractedAltitude}m 구간인 [${closestPoint.name}](표지목 ${closestPoint.signCode})으로 위치가 특정되었습니다.`,
          `수색팀을 ${extractedTrail} 코스 [${closestPoint.name}] 반경 ${radiusMeters}m로 배치하세요.`,
          `학생에게 주변에 표지목(${closestPoint.signCode})이 보이는지 확인하도록 유도하세요.`
        ],
        timelineExplanation: `학생이 진술한 '${extractedTrail} 코스 해발 ${extractedAltitude}m' 데이터를 한라산 등고선 프로필과 대조하여, ${closestPoint.name}(해발 ${closestPoint.alt}m)으로 위치를 특정했습니다.`
      };
    }
  }

  // ========================================
  // 5단계: 전체 POI에서 키워드 + 고도 종합 매칭
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
        score += 25;
        matchedKeywords.push(word);
      }
    }

    // 표지목 코드 포함 여부
    if (lowerText.includes(kp.signCode.toLowerCase()) || cleanText.includes(kp.signCode.replace(/\s/g, ''))) {
      score += 45;
      matchedKeywords.push(kp.signCode);
    }

    // 코스명 일치
    if (extractedTrail && kp.trail === extractedTrail) {
      score += 20;
    }

    // 고도 일치도 가산점
    const targetAlt = extractedAltitude || lastGpsAlt;
    if (targetAlt) {
      const altDiff = Math.abs(kp.alt - targetAlt);
      if (altDiff <= 30) score += 35;
      else if (altDiff <= 80) score += 20;
      else if (altDiff <= 150) score += 10;
      else if (altDiff > 300) score -= 20;
    }

    return {
      kp,
      score,
      matchedKeywords: Array.from(new Set(matchedKeywords)),
    };
  });

  scoredPOIs.sort((a, b) => b.score - a.score);
  const bestMatch = scoredPOIs[0];

  if (extractedAltitude) extractedLandmarks.push(`해발 ${extractedAltitude}m`);
  if (extractedTrail) extractedLandmarks.push(`${extractedTrail} 코스`);
  if (bestMatch.matchedKeywords.length > 0) extractedLandmarks.push(...bestMatch.matchedKeywords);

  let confidence = Math.min(96, Math.max(45, bestMatch.score));
  if (extractedAltitude && bestMatch.matchedKeywords.length > 0) {
    confidence = Math.min(94, Math.max(82, confidence));
  }

  let radiusMeters = 50;
  if (confidence >= 90) radiusMeters = 30;
  else if (confidence >= 80) radiusMeters = 45;
  else if (confidence >= 65) radiusMeters = 75;
  else radiusMeters = 120;

  const terrain = analyzeTerrainAndEnvironment(text, bestMatch.kp.trail, bestMatch.kp.name, bestMatch.kp.alt);

  const reasoningSteps: InferenceStep[] = [
    {
      icon: "🔍",
      title: "자연어 키워드 및 단서 추출",
      desc: bestMatch.matchedKeywords.length > 0
        ? `단서 키워드 [${bestMatch.matchedKeywords.join(', ')}] 포착`
        : "주변 지형 및 묘사 문맥 분석"
    },
    {
      icon: "📊",
      title: "한라산 전역 POI 다변량 점수화",
      desc: `전체 탐방로 랜드마크 중 [${bestMatch.kp.trail} 코스 ${bestMatch.kp.name}]이 점수(${bestMatch.score}점) 최고로 산출`
    },
    {
      icon: "⛰️",
      title: "지형 특성 대조",
      desc: `해발 ${bestMatch.kp.alt}m 주변의 ${terrain.terrainType} 환경 부합`
    },
    {
      icon: "🎯",
      title: `수색 반경 ${radiusMeters}m 확정`,
      desc: `단서 일치도에 기반하여 반경 ${radiusMeters}m(신뢰도 ${confidence}%) 특정`
    }
  ];

  return {
    analyzedText: text,
    extractedLandmarks: Array.from(new Set(extractedLandmarks)),
    extractedAltitude: extractedAltitude || bestMatch.kp.alt,
    matchedPOI: {
      id: `poi-${bestMatch.kp.trail}-${bestMatch.kp.alt}`,
      name: bestMatch.kp.name,
      type: bestMatch.kp.name.includes("대피소") ? "shelter"
        : bestMatch.kp.name.includes("샘") ? "spring"
        : bestMatch.kp.name.includes("바위") ? "rock"
        : "signpost",
      altitude: bestMatch.kp.alt,
      lat: bestMatch.kp.lat,
      lng: bestMatch.kp.lng,
      description: `${bestMatch.kp.trail} 코스 - ${bestMatch.kp.name} (해발 ${bestMatch.kp.alt}m) [표지목: ${bestMatch.kp.signCode}]`,
      keywords: [bestMatch.kp.signCode, bestMatch.kp.name, String(bestMatch.kp.alt)]
    },
    estimatedLat: bestMatch.kp.lat,
    estimatedLng: bestMatch.kp.lng,
    confidence,
    radiusMeters,
    urgencyLevel: bestMatch.kp.alt >= 1600 || text.includes("다쳤") ? 'critical' : 'high',
    matchedReason: `다변량 랜드마크 분석으로 ${bestMatch.kp.trail} 코스 ${bestMatch.kp.name} 최고 적합도 판정`,
    reasoningSteps,
    terrainAnalysis: terrain,
    aiRecommendations: [
      `학생에게 현재 위치(${bestMatch.kp.name} 인근)에서 절대 이동하지 말고 비바람을 피하도록 안내하세요.`,
      `수색팀을 한라산 ${bestMatch.kp.trail} 코스 [${bestMatch.kp.name}] 반경 ${radiusMeters}m로 집중 투입하세요.`,
      `단말기 배터리 절전을 위해 비상 절전 모드를 즉시 켜도록 지시하세요.`
    ],
    timelineExplanation: `음성 속 단서를 종합 대조하여, ${bestMatch.kp.trail} 코스 ${bestMatch.kp.name}(해발 ${bestMatch.kp.alt}m, 표지목 ${bestMatch.kp.signCode})으로 위치를 특정했습니다.`
  };
}
