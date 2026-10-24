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
  terrainType: string;       // 지형 유형 (예: "기암괴석 암벽 지대", "아고산대 구상나무 침엽수림")
  weatherCondition?: string; // 기상/시야 (예: "짙은 안개로 시야 15m 미만", "강풍/돌풍")
  riskFactor?: string;       // 위험 요소 (예: "급경사 낙상 위험", "저체온증 취약", "발목 부상")
  trailCourse?: string;      // 코스 정보 (예: "영실 코스 상행 3.7km 지점")
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
  isGeminiPowered?: boolean;
  modelUsed?: string;
}

export interface RescueTimelineEvent {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  type: 'alert' | 'ai_analysis' | 'teacher_action' | 'rescue_team' | 'resolved';
  actor: string; // '산울림 AI', '인솔교사 김선생', '울산소방 산악구조대'
}
