/**
 * 해발고도, 주변 지형, 가까운 랜드마크 정보 차원 분석 및 충분성 평가 모듈
 */

export interface InfoDimensionEvaluation {
  hasAltitude: boolean;
  hasTerrain: boolean;
  hasLandmark: boolean;
  dimensionCount: number;
  presentDimensions: string[];     // 예: ["해발고도"]
  missingDimensions: string[];     // 예: ["주변 지형", "가까운 랜드마크"]
  detectedAltitude?: number;
  detectedTerrains: string[];
  detectedLandmarks: string[];
  isCannotProvideMore: boolean;    // "더 이상 보이는 게 없어요", "이게 다예요" 등 추가 정보 불가 여부
  isInsufficient: boolean;         // 1개만 주어지고, 추가 제시 불가 상황도 아닐 때 true
  insufficientMessage?: string;
  guidePrompt?: string;
}

// 고도 추출 정규식
const ALTITUDE_PATTERNS = [
  /해발\s*(\d{3,4})/i,
  /(\d{3,4})\s*(?:m|M|미터|m쯤|미터쯤)/i,
  /고도\s*(\d{3,4})/i,
];

// 주변 지형 키워드
const TERRAIN_KEYWORDS = [
  "너덜", "너덜길", "너덜지대", "암벽", "절벽", "바위", "기암괴석", "암반",
  "능선", "평원", "고원", "분지", "비탈", "급경사", "완경사", "오르막", "내리막",
  "구상나무", "조릿대", "진달래", "철쭉", "침엽수", "활엽수", "수림", "숲길", "밀림",
  "계곡", "골짜기", "데크", "목재 계단", "돌계단", "돌길", "흙길",
  "용암", "화산암", "동굴", "석굴", "구린굴", "모노레일", "철탑"
];

// 가까운 랜드마크 / 시설물 / 표지판 키워드
const LANDMARK_KEYWORDS = [
  "대피소", "쉼터", "통제소", "안내소", "관리사무소", "샘터", "약수터", "샘", "전망대", "조망터",
  "기상대", "관측소", "레이더", "백록담", "삼각봉", "진달래밭", "윗세오름", "사제비", "만세동산",
  "어스승악", "용진각", "속밭", "평궤", "방아오름", "탐라계곡", "남벽분기점", "오백나한", "병풍바위",
  "선작지왓", "노루샘", "사제비샘", "원점",
  // 코스 명칭
  "성판악", "관음사", "영실", "어리목", "돈내코",
  // 표지판 번호 패턴
  "표지판", "표지목", "국가지점번호", "지점번호", "다라"
];

// 추가 정보 제시 불가능 표현 패턴
const CANNOT_PROVIDE_MORE_PATTERNS = [
  /더\s*이상/i,
  /더이상/i,
  /더는\s*(?:안|못|없|모르)/i,
  /보이는\s*게\s*없/i,
  /보이는게\s*없/i,
  /안\s*보여/i,
  /안보여/i,
  /보이지\s*않/i,
  /아무것도\s*안/i,
  /이게\s*다/i,
  /이게\s*전부/i,
  /더\s*알\s*수\s*없/i,
  /더\s*모르/i,
  /더\s*제시/i,
  /다른\s*건\s*없/i,
  /다른건\s*없/i,
  /정보가\s*없/i,
  /정보\s*없/i,
];

export function evaluateInfoDimensions(
  voiceTranscript: string,
  forceJudgment = false
): InfoDimensionEvaluation {
  const text = voiceTranscript.trim();

  // 1. 해발고도 검출
  let hasAltitude = false;
  let detectedAltitude: number | undefined;

  for (const pattern of ALTITUDE_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const val = parseInt(match[1], 10);
      if (val >= 400 && val <= 2000) {
        hasAltitude = true;
        detectedAltitude = val;
        break;
      }
    }
  }

  // 2. 주변 지형 검출
  const detectedTerrains: string[] = [];
  for (const kw of TERRAIN_KEYWORDS) {
    if (text.includes(kw)) {
      detectedTerrains.push(kw);
    }
  }
  const hasTerrain = detectedTerrains.length > 0;

  // 3. 가까운 랜드마크 / 시설물 / 표지판 검출
  const detectedLandmarks: string[] = [];
  for (const kw of LANDMARK_KEYWORDS) {
    if (text.includes(kw)) {
      detectedLandmarks.push(kw);
    }
  }
  // 표지목 코드 패턴 검출 (예: 1-14, 2-23, 3-15, 5-20)
  if (/\b[1-5]-\d{1,2}\b/.test(text)) {
    detectedLandmarks.push("탐방로 표지목 코드");
  }
  const hasLandmark = detectedLandmarks.length > 0;

  // 4. 차원 카운트
  const presentDimensions: string[] = [];
  const missingDimensions: string[] = [];

  if (hasAltitude) presentDimensions.push(`해발고도${detectedAltitude ? ` (${detectedAltitude}m)` : ""}`);
  else missingDimensions.push("해발고도");

  if (hasTerrain) presentDimensions.push(`주변 지형 (${detectedTerrains.slice(0, 2).join(", ")})`);
  else missingDimensions.push("주변 지형");

  if (hasLandmark) presentDimensions.push(`가까운 랜드마크 (${detectedLandmarks.slice(0, 2).join(", ")})`);
  else missingDimensions.push("가까운 랜드마크");

  const dimensionCount = (hasAltitude ? 1 : 0) + (hasTerrain ? 1 : 0) + (hasLandmark ? 1 : 0);

  // 5. 추가 정보를 더 제시할 수 없는 상황인지 확인
  let isCannotProvideMore = forceJudgment;
  if (!isCannotProvideMore) {
    for (const pat of CANNOT_PROVIDE_MORE_PATTERNS) {
      if (pat.test(text)) {
        isCannotProvideMore = true;
        break;
      }
    }
  }

  // 6. 충분성 판단:
  // 해발고도, 주변 지형, 가까운 랜드마크 중 단 1개만 주어졌고,
  // 사용자가 추가 정보 제공 불가 상태가 아니라면 정보 부족으로 판단!
  const isInsufficient = dimensionCount === 1 && !isCannotProvideMore;

  let insufficientMessage: string | undefined;
  let guidePrompt: string | undefined;

  if (isInsufficient) {
    const singleDimName = presentDimensions[0];
    insufficientMessage = `제시해주신 정보 중 [${singleDimName}] 단 1가지만 감지되어 위치를 정밀 특정하기에 정보가 부족합니다.`;
    guidePrompt = `한라산은 동일 고도나 유사 지형이 여러 코스에 걸쳐 분포하므로, 주변에 보이는 [${missingDimensions.join(", ")}] 중 1가지를 더 말씀해 주시면 신속하고 정확하게 구조대를 유도할 수 있습니다.\n\n※ 만약 짙은 안개나 부상 등으로 추가 정보를 더 이상 제시할 수 없는 긴급 상황이라면, 아래 [현재 정보로 즉시 위치 판단] 버튼을 눌러주세요.`;
  }

  return {
    hasAltitude,
    hasTerrain,
    hasLandmark,
    dimensionCount,
    presentDimensions,
    missingDimensions,
    detectedAltitude,
    detectedTerrains,
    detectedLandmarks,
    isCannotProvideMore,
    isInsufficient,
    insufficientMessage,
    guidePrompt,
  };
}
