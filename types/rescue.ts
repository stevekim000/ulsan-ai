export type StudentStatus = 'safe' | 'warning' | 'emergency' | 'rescued';

export type NetworkStatus = 'online' | 'unstable' | 'offline';

export interface LocationPoint {
  lat: number;
  lng: number;
  altitude?: number; // 고도 (m)
  accuracy?: number; // 오차 범위 (m)
  heading?: number;  // 나침반 방향 (0~360도)
  timestamp: number;
}

export interface LandmarkPOI {
  id: string;
  name: string;             // 예: '가지산 3-2 표지목', '쌀바위 쉼터'
  type: 'signpost' | 'shelter' | 'spring' | 'rock' | 'ridge' | 'crossroad';
  altitude: number;         // 해발 고도 (m)
  lat: number;
  lng: number;
  description: string;
  keywords: string[];       // 음성 매칭 키워드 (예: ['3-2', '표지판', '팻말', '갈림길'])
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  classNum: number;
  studentNumber: string;
  status: StudentStatus;
  battery: number;
  network: NetworkStatus;
  lastLocation: LocationPoint;
  locationHistory: LocationPoint[];
  emergencyVoiceLog?: string;
  aiEstimate?: AIEstimateResult;
  updatedAt: number;
}

export interface InferenceStep {
  icon: string;
  title: string;
  desc: string;
}

export interface TerrainAnalysis {
  terrainType: string;           // 지형 유형 및 형태 (예: "기암괴석 급경사 암벽·너덜 지대")
  weatherCondition?: string;     // 기상/시야 상태 (예: "짙은 안개로 시야 15m 미만 (시계 제로)")
  riskFactor?: string;           // 위험 요소 예측 (예: "낭떠러지 추락 및 저체온증 고위험")
  trailCourse?: string;          // 코스 및 구간 정보 (예: "영실 코스 상행 3.7km (해발 1,500m)")
  trailSurface?: string;         // 등산로 바닥 및 보행 환경 (예: "가파른 목재 데크 계단 및 거친 암반 너덜길")
  vegetation?: string;           // 주변 식생 및 수림 분포 (예: "아고산대 구상나무 군락 및 털진달래 지대")
  comparisonExplanation?: string;// 음성 데이터와 학습 지형 데이터 간 비교 분석 결과
}

export interface LocationCandidate {
  rank: number;
  course: '영실' | '성판악' | '관음사' | '어리목' | '돈내코';
  candidateScore: number;       // 후보 점수 (0~100%, 초기 균등 20%)
  locationConfidence: number;   // 위치 신뢰도 (0~100%)
  estimatedArea: string;        // 추정 위치 또는 구역
  altitudeRange: string;        // 고도 범위 (예: "1,450m ~ 1,550m")
  coordinates: {
    lat: number;
    lng: number;
  };
  keyLandmark: string;          // 대표 랜드마크 및 대피소
  reasoning: string;            // 추정 근거
  matchedClues: string[];       // 일치한 단서
  unmatchedClues: string[];     // 일치하지 않는 단서
  additionalQuestions: string[];// 추가로 필요한 질문
  terrainState: string;         // 주변 지형과 바닥 상태
  vegetation: string;           // 식생 및 주변 환경
  elevationFeature: string;     // 해당 고도에서 나타날 수 있는 지형 특징
  shelterAndKeyPoints: string;  // 관련 대피소와 주요 지점
  checklist: Array<{
    text: string;
    matched: boolean;
  }>;
  isSelectedByUser?: boolean;
}

export interface AIEstimateResult {
  analyzedText: string;
  extractedLandmarks: string[];
  extractedAltitude?: number;
  matchedPOI?: LandmarkPOI;
  estimatedLat: number;
  estimatedLng: number;
  confidence: number;      // 0~100 (%)
  radiusMeters: number;    // 수색 추천 반경 (m)
  urgencyLevel: 'high' | 'critical' | 'moderate';
  aiRecommendations: string[];
  timelineExplanation: string;
  matchedReason?: string;             // 핵심 판정 이유
  reasoningSteps?: InferenceStep[];   // 어째서 그런 결과를 낸건지 단계별 추론 이유
  terrainAnalysis?: TerrainAnalysis;  // 정밀 지형 분석 결과
  isInternetSearchUsed?: boolean;     // 키워드 미감지로 인터넷 정보 수집이 가동되었는지 여부
  internetSearchQueries?: string[];   // 인터넷 정보 수집에 사용된 검색 쿼리 목록
  internetFindings?: string;          // 인터넷에서 수집된 정보 및 위치 연계 분석 내용 요약
  collectedWebSources?: Array<{ title: string; snippet: string; url?: string }>; // 수집된 웹 출처 및 내용
  coreSourceLinks?: Array<{ title: string; url: string; snippet?: string }>;     // 핵심 데이터를 수집한 1~2개 출처 링크
  isGeminiPowered?: boolean;
  modelUsed?: string;
  isInsufficientInfo?: boolean;       // 단일 정보만 주어져 추가 정보가 필요한지 여부
  insufficientMessage?: string;       // 정보 부족 사유
  guidePrompt?: string;               // 사용자 가이드 안내
  presentDimensions?: string[];       // 감지된 정보 차원
  missingDimensions?: string[];       // 누락된 정보 차원
  isSingleInfoJudgment?: boolean;     // 추가 정보 제시 불가로 단일 정보 기반 긴급 판정인지 여부
  singleInfoDimension?: string;       // 단일 정보 차원명
  candidates?: LocationCandidate[];   // 4-1단계: 분산 후보 추정 목록 (5대 코스)
  selectedCandidateCourse?: '영실' | '성판악' | '관음사' | '어리목' | '돈내코'; // 사용자가 선택한 코스
  userSelectedConfirmed?: boolean;    // 사용자가 직접 '아! 이 코스 같다!' 선택했는지 여부
  isAltitudeOnlyDispersed?: boolean;  // 고도만 주어진 분산 후보 모드인지 여부
}

export interface RescueTimelineEvent {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  type: 'alert' | 'ai_analysis' | 'teacher_action' | 'rescue_team' | 'resolved';
  actor: string; // '메아리 AI', '인솔교사 김선생', '울산소방 산악구조대'
}
