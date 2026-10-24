import { LandmarkPOI } from "@/types/rescue";

// ============================================================
// 한라산 국립공원 전체 탐방로 정밀 데이터
// 5개 코스: 영실 / 성판악 / 관음사 / 어리목 / 돈내코
// ============================================================

export type TrailName = '영실' | '성판악' | '관음사' | '어리목' | '돈내코';

export interface TrailKeyPoint {
  name: string;
  lat: number;
  lng: number;
  alt: number;
  signCode: string;           // 위치표지목 번호 (예: "영실 1-14")
  distToPeak?: number;        // 정상까지 거리 (km)
  distToWitseoorm?: number;   // 윗세오름까지 거리 (km)
  distToBungi?: number;       // 남벽분기점까지 거리 (km)
}

export interface TrailInfo {
  color: string;
  totalDistanceKm: number;
  expectedHours: number;
  startAlt: number;
  endAlt: number;
  endPointName: string;
  keyPoints: TrailKeyPoint[];
}

export interface SignPost {
  code: string;       // 위치표지목 코드 (예: "영실 1-14")
  gCode: string;      // 국가지점번호 (예: "다라 0155 8122")
  trail: TrailName;
  name: string;
  alt: number;
  lat: number;
  lng: number;
}

export interface LandmarkSynonym {
  keywords: string[];
  trail: TrailName;
  alt: number;
  name: string;
  signCode: string;
  lat: number;
  lng: number;
  gCode: string;
}

// ============================================================
// 한라산 정상
// ============================================================
export const HALLASAN_PEAK = { lat: 33.3617, lng: 126.5292, alt: 1950 };

// ============================================================
// 5개 탐방로 정밀 데이터 (좌표 + 고도 + 표지목 코드)
// ============================================================
export const HALLASAN_TRAILS: Record<TrailName, TrailInfo> = {
  영실: {
    color: "#FF9800",
    totalDistanceKm: 5.8,
    expectedHours: 2,
    startAlt: 1100,
    endAlt: 1720,
    endPointName: "윗세오름 대피소",
    keyPoints: [
      { name: "영실 통제소(매표소)", lat: 33.3434, lng: 126.4527, alt: 1100, distToWitseoorm: 5.8, signCode: "영실 1-1" },
      { name: "영실 휴게소(탐방 시작점)", lat: 33.3479, lng: 126.4609, alt: 1280, distToWitseoorm: 3.7, signCode: "영실 1-5" },
      { name: "영실계곡 목교", lat: 33.3486, lng: 126.4635, alt: 1330, distToWitseoorm: 3.2, signCode: "영실 1-7" },
      { name: "병풍바위 하단", lat: 33.3497, lng: 126.4684, alt: 1400, distToWitseoorm: 2.5, signCode: "영실 1-10" },
      { name: "병풍바위 상단 쉼터", lat: 33.3512, lng: 126.4718, alt: 1450, distToWitseoorm: 2.2, signCode: "영실 1-12" },
      { name: "오백나한(영실기암) 조망터", lat: 33.3527, lng: 126.4751, alt: 1500, distToWitseoorm: 1.9, signCode: "영실 1-14" },
      { name: "구상나무 숲길 입구", lat: 33.3552, lng: 126.4792, alt: 1580, distToWitseoorm: 1.4, signCode: "영실 1-16" },
      { name: "선작지왓 평전 진입로", lat: 33.3587, lng: 126.4845, alt: 1650, distToWitseoorm: 0.8, signCode: "영실 1-19" },
      { name: "윗세족은오름 전망대 갈림길", lat: 33.3601, lng: 126.4878, alt: 1700, distToWitseoorm: 0.4, signCode: "영실 1-21" },
      { name: "윗세오름 대피소", lat: 33.3617, lng: 126.4918, alt: 1720, distToWitseoorm: 0.0, signCode: "영실 1-23" },
      { name: "방아오름 샘터", lat: 33.3578, lng: 126.5082, alt: 1670, distToBungi: 1.8, signCode: "영실 2-1" },
      { name: "남벽분기점", lat: 33.3536, lng: 126.5344, alt: 1600, distToBungi: 0.0, signCode: "남벽 1-1" }
    ]
  },
  성판악: {
    color: "#4CAF50",
    totalDistanceKm: 9.6,
    expectedHours: 4.5,
    startAlt: 750,
    endAlt: 1950,
    endPointName: "백록담 동릉 정상",
    keyPoints: [
      { name: "성판악 탐방안내소 입구", lat: 33.3883, lng: 126.6087, alt: 750, distToPeak: 9.6, signCode: "성판악 1-1" },
      { name: "삼나무 숲길 지점", lat: 33.3855, lng: 126.6025, alt: 850, distToPeak: 8.4, signCode: "성판악 1-5" },
      { name: "제1쉼터(2.2km 지점)", lat: 33.3828, lng: 126.5982, alt: 950, distToPeak: 7.6, signCode: "성판악 1-8" },
      { name: "속밭 대피소", lat: 33.3797, lng: 126.5929, alt: 1100, distToPeak: 6.4, signCode: "성판악 1-12" },
      { name: "해발 1200m 표지석", lat: 33.3774, lng: 126.5868, alt: 1200, distToPeak: 5.2, signCode: "성판악 1-15" },
      { name: "사라오름 입구(사라샘)", lat: 33.3752, lng: 126.5813, alt: 1300, distToPeak: 4.1, signCode: "성판악 1-18" },
      { name: "사라오름 산정호수", lat: 33.3718, lng: 126.5835, alt: 1324, distToPeak: 4.5, signCode: "사라오름 1-2" },
      { name: "해발 1400m 쉼터", lat: 33.3730, lng: 126.5742, alt: 1400, distToPeak: 3.1, signCode: "성판악 1-21" },
      { name: "진달래밭 대피소", lat: 33.3711, lng: 126.5678, alt: 1500, distToPeak: 2.3, signCode: "성판악 1-24" },
      { name: "해발 1600m 표지석", lat: 33.3688, lng: 126.5574, alt: 1600, distToPeak: 1.7, signCode: "성판악 1-27" },
      { name: "해발 1700m 구상나무 숲", lat: 33.3665, lng: 126.5482, alt: 1700, distToPeak: 1.2, signCode: "성판악 1-30" },
      { name: "해발 1800m 데크전망터", lat: 33.3642, lng: 126.5385, alt: 1800, distToPeak: 0.7, signCode: "성판악 1-33" },
      { name: "해발 1900m 능선길", lat: 33.3625, lng: 126.5320, alt: 1900, distToPeak: 0.2, signCode: "성판악 1-35" },
      { name: "백록담 동릉 정상", lat: 33.3617, lng: 126.5292, alt: 1950, distToPeak: 0.0, signCode: "성판악 1-36" }
    ]
  },
  관음사: {
    color: "#2196F3",
    totalDistanceKm: 8.7,
    expectedHours: 5,
    startAlt: 620,
    endAlt: 1950,
    endPointName: "백록담 북벽 정상",
    keyPoints: [
      { name: "관음사지구 야영장 입구", lat: 33.4308, lng: 126.5224, alt: 620, distToPeak: 8.7, signCode: "관음사 2-1" },
      { name: "구린굴(용암동굴)", lat: 33.4245, lng: 126.5238, alt: 720, distToPeak: 7.9, signCode: "관음사 2-5" },
      { name: "탐라계곡 목교", lat: 33.4132, lng: 126.5249, alt: 910, distToPeak: 6.6, signCode: "관음사 2-10" },
      { name: "탐라계곡 대피소", lat: 33.4109, lng: 126.5253, alt: 950, distToPeak: 6.3, signCode: "관음사 2-12" },
      { name: "개미등 하단(해발 1100m)", lat: 33.4021, lng: 126.5260, alt: 1100, distToPeak: 4.8, signCode: "관음사 2-16" },
      { name: "개미등 상단(해발 1300m)", lat: 33.3938, lng: 126.5266, alt: 1300, distToPeak: 3.2, signCode: "관음사 2-20" },
      { name: "삼각봉 대피소", lat: 33.3871, lng: 126.5270, alt: 1500, distToPeak: 1.9, signCode: "관음사 2-24" },
      { name: "용진각 현수교(출렁다리)", lat: 33.3833, lng: 126.5277, alt: 1600, distToPeak: 1.5, signCode: "관음사 2-27" },
      { name: "왕관릉 조망터(해발 1720m)", lat: 33.3789, lng: 126.5281, alt: 1720, distToPeak: 1.0, signCode: "관음사 2-29" },
      { name: "해발 1800m 헬기장", lat: 33.3725, lng: 126.5286, alt: 1800, distToPeak: 0.6, signCode: "관음사 2-31" },
      { name: "백록담 북벽 정상", lat: 33.3617, lng: 126.5292, alt: 1950, distToPeak: 0.0, signCode: "관음사 2-34" }
    ]
  },
  어리목: {
    color: "#9C27B0",
    totalDistanceKm: 6.8,
    expectedHours: 2.5,
    startAlt: 970,
    endAlt: 1720,
    endPointName: "윗세오름 대피소",
    keyPoints: [
      { name: "어리목 탐방안내소", lat: 33.3851, lng: 126.4537, alt: 970, distToWitseoorm: 6.8, signCode: "어리목 1-1" },
      { name: "어목교(어리목 계곡)", lat: 33.3820, lng: 126.4565, alt: 1040, distToWitseoorm: 6.0, signCode: "어리목 1-3" },
      { name: "사제비샘(음수대)", lat: 33.3725, lng: 126.4682, alt: 1420, distToWitseoorm: 3.2, signCode: "어리목 1-8" },
      { name: "사제비동산 쉼터", lat: 33.3697, lng: 126.4731, alt: 1550, distToWitseoorm: 2.7, signCode: "어리목 1-10" },
      { name: "만세동산 전망대", lat: 33.3761, lng: 126.4616, alt: 1600, distToWitseoorm: 1.8, signCode: "어리목 1-13" },
      { name: "윗세오름 진입 데크", lat: 33.3645, lng: 126.4852, alt: 1680, distToWitseoorm: 0.6, signCode: "어리목 1-15" },
      { name: "윗세오름 대피소", lat: 33.3617, lng: 126.4918, alt: 1720, distToWitseoorm: 0.0, signCode: "어리목 1-17" }
    ]
  },
  돈내코: {
    color: "#00BCD4",
    totalDistanceKm: 7.0,
    expectedHours: 3.5,
    startAlt: 490,
    endAlt: 1600,
    endPointName: "남벽분기점",
    keyPoints: [
      { name: "돈내코 탐방안내소", lat: 33.3241, lng: 126.5676, alt: 490, distToBungi: 7.0, signCode: "돈내코 1-1" },
      { name: "썩은물통", lat: 33.3289, lng: 126.5620, alt: 720, distToBungi: 5.6, signCode: "돈내코 1-6" },
      { name: "살핀오름 입구", lat: 33.3335, lng: 126.5571, alt: 1100, distToBungi: 4.2, signCode: "돈내코 1-11" },
      { name: "평궤 대피소", lat: 33.3391, lng: 126.5524, alt: 1450, distToBungi: 2.6, signCode: "돈내코 1-16" },
      { name: "넓은드르 지대", lat: 33.3465, lng: 126.5432, alt: 1530, distToBungi: 1.2, signCode: "돈내코 1-22" },
      { name: "남벽분기점", lat: 33.3536, lng: 126.5344, alt: 1600, distToBungi: 0.0, signCode: "돈내코 1-27" }
    ]
  }
};

// ============================================================
// 전수 표지판 데이터 (250m 간격 국가지점번호판 + 위치표지목)
// ============================================================
export const HALLASAN_SIGNS: SignPost[] = [
  // 영실 코스
  { code: "영실 1-1", gCode: "다라 9832 7821", trail: "영실", name: "영실 매표소/통제소", alt: 1100, lat: 33.3434, lng: 126.4527 },
  { code: "영실 1-5", gCode: "다라 9930 7920", trail: "영실", name: "영실휴게소(등산로 입구)", alt: 1280, lat: 33.3479, lng: 126.4609 },
  { code: "영실 1-7", gCode: "다라 9980 7965", trail: "영실", name: "영실계곡 목교", alt: 1330, lat: 33.3486, lng: 126.4635 },
  { code: "영실 1-10", gCode: "다라 0055 8032", trail: "영실", name: "병풍바위 하단(해발 1400m)", alt: 1400, lat: 33.3497, lng: 126.4684 },
  { code: "영실 1-12", gCode: "다라 0105 8078", trail: "영실", name: "병풍바위 상단 쉼터", alt: 1450, lat: 33.3512, lng: 126.4718 },
  { code: "영실 1-14", gCode: "다라 0155 8122", trail: "영실", name: "오백나한 조망터(해발 1500m)", alt: 1500, lat: 33.3527, lng: 126.4751 },
  { code: "영실 1-16", gCode: "다라 0205 8168", trail: "영실", name: "구상나무 숲길(해발 1580m)", alt: 1580, lat: 33.3552, lng: 126.4792 },
  { code: "영실 1-19", gCode: "다라 0280 8235", trail: "영실", name: "선작지왓 평원(해발 1650m)", alt: 1650, lat: 33.3587, lng: 126.4845 },
  { code: "영실 1-21", gCode: "다라 0330 8280", trail: "영실", name: "윗세족은오름 전망대 입구", alt: 1700, lat: 33.3601, lng: 126.4878 },
  { code: "영실 1-23", gCode: "다라 0380 8325", trail: "영실", name: "윗세오름 대피소(해발 1720m)", alt: 1720, lat: 33.3617, lng: 126.4918 },
  // 성판악 코스
  { code: "성판악 1-1", gCode: "다사 1245 8421", trail: "성판악", name: "성판악 탐방안내소 입구", alt: 750, lat: 33.3883, lng: 126.6087 },
  { code: "성판악 1-5", gCode: "다사 1145 8340", trail: "성판악", name: "삼나무 숲 쉼터", alt: 850, lat: 33.3855, lng: 126.6025 },
  { code: "성판악 1-8", gCode: "다사 1070 8280", trail: "성판악", name: "제1쉼터(해발 950m)", alt: 950, lat: 33.3828, lng: 126.5982 },
  { code: "성판악 1-9", gCode: "다사 1045 8260", trail: "성판악", name: "해발 1000m 표지석", alt: 1000, lat: 33.3818, lng: 126.5965 },
  { code: "성판악 1-12", gCode: "다사 0970 8200", trail: "성판악", name: "속밭 대피소(해발 1100m)", alt: 1100, lat: 33.3797, lng: 126.5929 },
  { code: "성판악 1-15", gCode: "다사 0895 8140", trail: "성판악", name: "해발 1200m 표지석", alt: 1200, lat: 33.3774, lng: 126.5868 },
  { code: "성판악 1-18", gCode: "다사 0820 8080", trail: "성판악", name: "사라오름 갈림길(해발 1300m)", alt: 1300, lat: 33.3752, lng: 126.5813 },
  { code: "성판악 1-21", gCode: "다사 0745 8020", trail: "성판악", name: "해발 1400m 쉼터", alt: 1400, lat: 33.3730, lng: 126.5742 },
  { code: "성판악 1-24", gCode: "다사 0670 7960", trail: "성판악", name: "진달래밭 대피소(해발 1500m)", alt: 1500, lat: 33.3711, lng: 126.5678 },
  { code: "성판악 1-27", gCode: "다사 0595 7900", trail: "성판악", name: "해발 1600m 표지석", alt: 1600, lat: 33.3688, lng: 126.5574 },
  { code: "성판악 1-30", gCode: "다사 0520 7840", trail: "성판악", name: "해발 1700m 구상나무 숲", alt: 1700, lat: 33.3665, lng: 126.5482 },
  { code: "성판악 1-33", gCode: "다사 0445 7780", trail: "성판악", name: "해발 1800m 데크전망터", alt: 1800, lat: 33.3642, lng: 126.5385 },
  { code: "성판악 1-35", gCode: "다사 0395 7740", trail: "성판악", name: "해발 1900m 표지석", alt: 1900, lat: 33.3625, lng: 126.5320 },
  { code: "성판악 1-36", gCode: "다사 0370 7720", trail: "성판악", name: "백록담 동릉 정상(해발 1950m)", alt: 1950, lat: 33.3617, lng: 126.5292 },
  // 관음사 코스
  { code: "관음사 2-1", gCode: "다라 0310 9045", trail: "관음사", name: "관음사 지구 야영장 입구", alt: 620, lat: 33.4308, lng: 126.5224 },
  { code: "관음사 2-5", gCode: "다라 0315 8970", trail: "관음사", name: "구린굴(용암동굴)", alt: 720, lat: 33.4245, lng: 126.5238 },
  { code: "관음사 2-10", gCode: "다라 0320 8840", trail: "관음사", name: "탐라계곡 목교", alt: 910, lat: 33.4132, lng: 126.5249 },
  { code: "관음사 2-12", gCode: "다라 0322 8815", trail: "관음사", name: "탐라계곡 대피소(해발 950m)", alt: 950, lat: 33.4109, lng: 126.5253 },
  { code: "관음사 2-16", gCode: "다라 0325 8710", trail: "관음사", name: "개미등 하단(해발 1100m)", alt: 1100, lat: 33.4021, lng: 126.5260 },
  { code: "관음사 2-20", gCode: "다라 0328 8610", trail: "관음사", name: "개미등 상단(해발 1300m)", alt: 1300, lat: 33.3938, lng: 126.5266 },
  { code: "관음사 2-24", gCode: "다라 0330 8520", trail: "관음사", name: "삼각봉 대피소(해발 1500m)", alt: 1500, lat: 33.3871, lng: 126.5270 },
  { code: "관음사 2-27", gCode: "다라 0332 8460", trail: "관음사", name: "용진각 현수교(출렁다리)", alt: 1600, lat: 33.3833, lng: 126.5277 },
  { code: "관음사 2-29", gCode: "다라 0335 8400", trail: "관음사", name: "왕관릉 조망터(해발 1720m)", alt: 1720, lat: 33.3789, lng: 126.5281 },
  { code: "관음사 2-31", gCode: "다라 0338 8320", trail: "관음사", name: "해발 1800m 헬기장", alt: 1800, lat: 33.3725, lng: 126.5286 },
  { code: "관음사 2-34", gCode: "다라 0340 8200", trail: "관음사", name: "백록담 북벽 정상(해발 1950m)", alt: 1950, lat: 33.3617, lng: 126.5292 },
  // 어리목 코스
  { code: "어리목 1-1", gCode: "다라 9750 8540", trail: "어리목", name: "어리목 탐방안내소", alt: 970, lat: 33.3851, lng: 126.4537 },
  { code: "어리목 1-3", gCode: "다라 9775 8500", trail: "어리목", name: "어목교(어리목 계곡)", alt: 1040, lat: 33.3820, lng: 126.4565 },
  { code: "어리목 1-8", gCode: "다라 9880 8380", trail: "어리목", name: "사제비샘(해발 1420m)", alt: 1420, lat: 33.3725, lng: 126.4682 },
  { code: "어리목 1-10", gCode: "다라 9920 8340", trail: "어리목", name: "사제비동산(해발 1550m)", alt: 1550, lat: 33.3697, lng: 126.4731 },
  { code: "어리목 1-13", gCode: "다라 0020 8380", trail: "어리목", name: "만세동산 전망대(해발 1600m)", alt: 1600, lat: 33.3761, lng: 126.4616 },
  { code: "어리목 1-15", gCode: "다라 0220 8350", trail: "어리목", name: "윗세오름 진입 데크", alt: 1680, lat: 33.3645, lng: 126.4852 },
  { code: "어리목 1-17", gCode: "다라 0380 8325", trail: "어리목", name: "윗세오름 대피소(해발 1720m)", alt: 1720, lat: 33.3617, lng: 126.4918 },
  // 돈내코 코스
  { code: "돈내코 1-1", gCode: "다사 0820 7350", trail: "돈내코", name: "돈내코 탐방안내소", alt: 490, lat: 33.3241, lng: 126.5676 },
  { code: "돈내코 1-6", gCode: "다사 0770 7410", trail: "돈내코", name: "썩은물통", alt: 720, lat: 33.3289, lng: 126.5620 },
  { code: "돈내코 1-11", gCode: "다사 0720 7470", trail: "돈내코", name: "살핀오름 입구", alt: 1100, lat: 33.3335, lng: 126.5571 },
  { code: "돈내코 1-16", gCode: "다사 0660 7540", trail: "돈내코", name: "평궤 대피소(해발 1450m)", alt: 1450, lat: 33.3391, lng: 126.5524 },
  { code: "돈내코 1-22", gCode: "다사 0580 7620", trail: "돈내코", name: "넓은드르 지대", alt: 1530, lat: 33.3465, lng: 126.5432 },
  { code: "돈내코 1-27", gCode: "다사 0480 7700", trail: "돈내코", name: "남벽분기점(해발 1600m)", alt: 1600, lat: 33.3536, lng: 126.5344 }
];

// ============================================================
// 동의어 및 랜드마크 데이터베이스 (음성 인식용 유사 표현 매칭)
// ============================================================
export const LANDMARK_SYNONYMS: LandmarkSynonym[] = [
  {
    keywords: ["오백장군", "영실기암", "오백나한", "오백나한상", "오백나한 조망터", "오백나한조망터"],
    trail: "영실", alt: 1500, name: "오백나한(영실기암) 조망터", signCode: "영실 1-14",
    lat: 33.3527, lng: 126.4751, gCode: "다라 0155 8122"
  },
  {
    keywords: ["병풍바위상단", "병풍바위 상단", "병풍바위 쉼터"],
    trail: "영실", alt: 1450, name: "병풍바위 상단 쉼터", signCode: "영실 1-12",
    lat: 33.3512, lng: 126.4718, gCode: "다라 0115 8092"
  },
  {
    keywords: ["병풍바위", "병풍 바위", "병풍바위하단", "병풍바위 하단"],
    trail: "영실", alt: 1400, name: "병풍바위 하단", signCode: "영실 1-10",
    lat: 33.3497, lng: 126.4684, gCode: "다라 0085 8072"
  },
  {
    keywords: ["선작지왓", "선작지왓평전", "선작지왓 평전", "선작지"],
    trail: "영실", alt: 1650, name: "선작지왓 평전 진입로", signCode: "영실 1-19",
    lat: 33.3587, lng: 126.4845, gCode: "다라 0245 8182"
  },
  {
    keywords: ["윗세오름", "윗세 오름", "윗세대피소", "윗세 대피소", "윗세"],
    trail: "영실", alt: 1720, name: "윗세오름 대피소", signCode: "영실 1-23",
    lat: 33.3617, lng: 126.4918, gCode: "다라 0315 8212"
  },
  {
    keywords: ["진달래밭", "진달래밭대피소", "진달래 대피소", "진달래"],
    trail: "성판악", alt: 1500, name: "진달래밭 대피소", signCode: "성판악 1-24",
    lat: 33.3711, lng: 126.5678, gCode: "다라 0985 8292"
  },
  {
    keywords: ["사라오름", "사라 오름", "사라샘", "사라오름 산정호수", "사라오름산정호수"],
    trail: "성판악", alt: 1324, name: "사라오름 산정호수", signCode: "사라오름 1-2",
    lat: 33.3718, lng: 126.5835, gCode: "다라 1125 8312"
  },
  {
    keywords: ["속밭", "속밭대피소", "속밭 대피소"],
    trail: "성판악", alt: 1100, name: "속밭 대피소", signCode: "성판악 1-12",
    lat: 33.3797, lng: 126.5929, gCode: "다라 1215 8392"
  },
  {
    keywords: ["삼각봉", "삼각봉대피소", "삼각봉 대피소"],
    trail: "관음사", alt: 1500, name: "삼각봉 대피소", signCode: "관음사 2-24",
    lat: 33.3871, lng: 126.5270, gCode: "다라 0625 8482"
  },
  {
    keywords: ["용진각", "용진각현수교", "용진각 현수교", "출렁다리"],
    trail: "관음사", alt: 1600, name: "용진각 현수교(출렁다리)", signCode: "관음사 2-27",
    lat: 33.3833, lng: 126.5277, gCode: "다라 0628 8442"
  },
  {
    keywords: ["탐라계곡", "탐라계곡대피소", "탐라계곡 대피소"],
    trail: "관음사", alt: 950, name: "탐라계곡 대피소", signCode: "관음사 2-12",
    lat: 33.4109, lng: 126.5253, gCode: "다라 0612 8718"
  },
  {
    keywords: ["구린굴", "용암동굴"],
    trail: "관음사", alt: 720, name: "구린굴(용암동굴)", signCode: "관음사 2-5",
    lat: 33.4245, lng: 126.5238, gCode: "다라 0315 8970"
  },
  {
    keywords: ["개미등", "개미등하단", "개미등 하단", "개미등상단", "개미등 상단"],
    trail: "관음사", alt: 1300, name: "개미등 상단(해발 1300m)", signCode: "관음사 2-20",
    lat: 33.3938, lng: 126.5266, gCode: "다라 0328 8610"
  },
  {
    keywords: ["왕관릉", "왕관릉 조망터"],
    trail: "관음사", alt: 1720, name: "왕관릉 조망터(해발 1720m)", signCode: "관음사 2-29",
    lat: 33.3789, lng: 126.5281, gCode: "다라 0335 8400"
  },
  {
    keywords: ["사제비동산", "사제비", "사제비샘"],
    trail: "어리목", alt: 1420, name: "사제비샘(음수대)", signCode: "어리목 1-8",
    lat: 33.3725, lng: 126.4682, gCode: "다라 0115 8312"
  },
  {
    keywords: ["만세동산", "만세동산전망대", "만세동산 전망대"],
    trail: "어리목", alt: 1600, name: "만세동산 전망대", signCode: "어리목 1-13",
    lat: 33.3761, lng: 126.4616, gCode: "다라 0055 8352"
  },
  {
    keywords: ["어목교", "어리목계곡", "어리목 계곡"],
    trail: "어리목", alt: 1040, name: "어목교(어리목 계곡)", signCode: "어리목 1-3",
    lat: 33.3820, lng: 126.4565, gCode: "다라 9775 8500"
  },
  {
    keywords: ["남벽", "남벽분기점"],
    trail: "돈내코", alt: 1600, name: "남벽분기점", signCode: "돈내코 1-27",
    lat: 33.3536, lng: 126.5344, gCode: "다라 0705 8122"
  },
  {
    keywords: ["평궤", "평궤대피소", "평궤 대피소"],
    trail: "돈내코", alt: 1450, name: "평궤 대피소(해발 1450m)", signCode: "돈내코 1-16",
    lat: 33.3391, lng: 126.5524, gCode: "다사 0660 7540"
  },
  {
    keywords: ["썩은물통"],
    trail: "돈내코", alt: 720, name: "썩은물통", signCode: "돈내코 1-6",
    lat: 33.3289, lng: 126.5620, gCode: "다사 0770 7410"
  },
  {
    keywords: ["넓은드르", "넓은 드르"],
    trail: "돈내코", alt: 1530, name: "넓은드르 지대", signCode: "돈내코 1-22",
    lat: 33.3465, lng: 126.5432, gCode: "다사 0580 7620"
  },
  {
    keywords: ["살핀오름", "살핀 오름"],
    trail: "돈내코", alt: 1100, name: "살핀오름 입구", signCode: "돈내코 1-11",
    lat: 33.3335, lng: 126.5571, gCode: "다사 0720 7470"
  },
  {
    keywords: ["백록담", "백록담정상", "백록담 정상", "한라산정상", "한라산 정상", "동릉정상", "동릉"],
    trail: "성판악", alt: 1950, name: "백록담 동릉 정상", signCode: "성판악 1-36",
    lat: 33.3617, lng: 126.5292, gCode: "다라 0662 8205"
  },
  {
    keywords: ["영실계곡", "영실 계곡", "영실계곡목교", "영실계곡 목교"],
    trail: "영실", alt: 1330, name: "영실계곡 목교", signCode: "영실 1-7",
    lat: 33.3486, lng: 126.4635, gCode: "다라 9980 7965"
  },
  {
    keywords: ["영실휴게소", "영실 휴게소"],
    trail: "영실", alt: 1280, name: "영실 휴게소(탐방 시작점)", signCode: "영실 1-5",
    lat: 33.3479, lng: 126.4609, gCode: "다라 9930 7920"
  },
  {
    keywords: ["방아오름", "방아오름 샘터"],
    trail: "영실", alt: 1670, name: "방아오름 샘터", signCode: "영실 2-1",
    lat: 33.3578, lng: 126.5082, gCode: ""
  }
];

// ============================================================
// 코스명 유사 표현 추출 (음성 입력에서 코스명 자동 감지)
// ============================================================
export function extractTrailName(text: string): TrailName | null {
  const clean = text.replace(/\s+/g, '').toLowerCase();
  if (/영실(?:코스|탐방로|등산로|길|로|방향|쪽|으?로)?|yeongsil/.test(clean)) return "영실";
  if (/성판악(?:코스|탐방로|등산로|길|로|방향|쪽|으?로)?|seongpanak/.test(clean)) return "성판악";
  if (/관음사(?:코스|탐방로|등산로|길|로|방향|쪽|으?로)?|gwaneumsa/.test(clean)) return "관음사";
  if (/어리목(?:코스|탐방로|등산로|길|로|방향|쪽|으?로)?|eorimoq?k/.test(clean)) return "어리목";
  if (/돈내코(?:코스|탐방로|등산로|길|로|방향|쪽|으?로)?|donneko/.test(clean)) return "돈내코";
  return null;
}

// ============================================================
// 전체 POI 목록 (모든 코스 키포인트를 LandmarkPOI 호환 형태로 변환)
// ============================================================
export function getAllKeyPoints(): (TrailKeyPoint & { trail: TrailName })[] {
  const result: (TrailKeyPoint & { trail: TrailName })[] = [];
  for (const [trailName, trail] of Object.entries(HALLASAN_TRAILS)) {
    for (const kp of trail.keyPoints) {
      result.push({ ...kp, trail: trailName as TrailName });
    }
  }
  return result;
}

// ============================================================
// 전체 POI 목록 (모든 코스 키포인트를 LandmarkPOI 호환 형태로 변환)
// ============================================================
export const HALLASAN_LANDMARKS: LandmarkPOI[] = getAllKeyPoints().map((kp, idx) => ({
  id: `halla-${kp.trail}-${idx}`,
  name: kp.name,
  type: kp.name.includes("대피소") || kp.name.includes("쉼터") ? "shelter" as const
    : kp.name.includes("샘") || kp.name.includes("약수") || kp.name.includes("물") ? "spring" as const
    : kp.name.includes("바위") || kp.name.includes("너덜") || kp.name.includes("암") ? "rock" as const
    : kp.name.includes("정상") || kp.name.includes("능선") || kp.name.includes("릉") ? "ridge" as const
    : kp.name.includes("갈림") || kp.name.includes("분기") || kp.name.includes("입구") ? "crossroad" as const
    : "signpost" as const,
  altitude: kp.alt,
  lat: kp.lat,
  lng: kp.lng,
  description: `${kp.trail} 코스 - ${kp.name} (해발 ${kp.alt}m) [표지목: ${kp.signCode}]`,
  keywords: [
    kp.signCode,
    ...kp.name.replace(/[()（）]/g, ' ').split(/[\s/]+/).filter(w => w.length > 1),
    String(kp.alt),
  ]
}));

export interface LandmarkTerrainProfile {
  name: string;
  trail: TrailName;
  alt: number;
  features: string;       // 지형 형태
  surface: string;        // 등산로 바닥
  vegetation: string;     // 식생
  weatherHazard: string;  // 기상 및 지형 위험
  keywords: string[];     // 감지 키워드
}

// ============================================================
// 한라산 주요 거점별 정밀 지형 데이터베이스
// AI가 음성 텍스트와 1:1로 비교·대조하여 현장 지형을 정밀 예측할 때 기준이 됨
// ============================================================
export const HALLASAN_TERRAIN_PROFILES: LandmarkTerrainProfile[] = [
  // --- 영실 코스 ---
  {
    name: "오백나한(영실기암) 조망터",
    trail: "영실",
    alt: 1500,
    features: "수직 주상절리 기암괴석(오백장군 바위)이 병풍처럼 솟아있는 급경사 암벽 능선 지대",
    surface: "가파른 목재 데크 계단이 끝나고 굵은 화강암 너덜바위와 자갈 흙길이 교차하는 구간",
    vegetation: "해발 1,500m 아고산대 경계면으로 털진달래와 구상나무 군락지가 시작되는 지점",
    weatherHazard: "영실계곡에서 치솟는 골바람으로 인해 짙은 농무(안개)가 급격히 차오르며, 시야 차단 시 낭떠러지 추락 위험 극대화",
    keywords: ["오백나한", "영실기암", "오백장군", "1-14", "1500", "바위", "안개", "기암괴석"]
  },
  {
    name: "병풍바위 상단 쉼터",
    trail: "영실",
    alt: 1450,
    features: "거대한 병풍바위 주상절리 최상단부에 위치한 쉼터 데크",
    surface: "가파른 경사의 목재 데크 계단 구간",
    vegetation: "절벽 틈새에 자생하는 왜소성 관목류",
    weatherHazard: "수직 절벽 상단으로 강풍과 추락 위험이 가장 높은 구간",
    keywords: ["병풍바위", "병풍", "1-12", "1450", "계단", "바위"]
  },
  {
    name: "선작지왓 평전 진입로",
    trail: "영실",
    alt: 1650,
    features: "제주 방언 '작은 돌이 서 있는 밭'이라는 의미의 광활한 한라산 고원 평전",
    surface: "완만한 경사의 평탄한 목재 데크 탐방로 및 화산석 자갈길",
    vegetation: "털진달래와 산철쭉, 눈향나무가 넓게 군락을 이룬 고산 관목 초원",
    weatherHazard: "사방이 탁 트여 있어 태풍급 돌풍과 강풍에 완전히 노출되며, 짙은 안개 발생 시 방향 감각 상실 위험",
    keywords: ["선작지왓", "선작지", "평전", "평원", "1-19", "1650", "벌판", "돌풍"]
  },
  {
    name: "윗세오름 대피소",
    trail: "영실",
    alt: 1720,
    features: "붉은오름·누운오름·족은오름 세 개의 오름 아래 위치한 해발 1,700m대 고산 대피소 광장",
    surface: "넓은 목재 데크 광장, 대피소 건물, 화장실, 음수대",
    vegetation: "구상나무 고사목과 진달래 군락",
    weatherHazard: "기온 급강하 및 폭설, 짙은 구름으로 인한 시계 불량",
    keywords: ["윗세오름", "윗세", "대피소", "1-23", "1720", "건물", "광장"]
  },

  // --- 성판악 코스 ---
  {
    name: "진달래밭 대피소",
    trail: "성판악",
    alt: 1500,
    features: "백록담 정상 진입 직전 해발 1,500m에 형성된 완만한 화산 쇄설물 평탄지 쉼터",
    surface: "넓은 목재 데크 쉼터와 평탄한 현무암 돌길, 대피소 통제소 건물",
    vegetation: "키 작은 털진달래 군락지와 구상나무 숲이 완만하게 펼쳐짐",
    weatherHazard: "백록담 정상 입산 통제 기준점으로, 기온 급강하 시 저체온증 취약 및 안개 시 방향 착오 주의",
    keywords: ["진달래밭", "진달래", "1-24", "1500", "대피소", "통제소", "건물"]
  },
  {
    name: "속밭 대피소",
    trail: "성판악",
    alt: 1100,
    features: "울창한 숲속 분지에 위치한 무인 대피소 거점",
    surface: "완만한 흙길과 목재 데크 쉼터, 화장실",
    vegetation: "천연 활엽수와 삼나무가 우거진 숲길",
    weatherHazard: "숲이 깊어 일몰 시 어둠이 급격히 찾아오며 계곡 습기로 바닥 미끄럼 주의",
    keywords: ["속밭", "1-12", "1100", "대피소", "숲길"]
  },
  {
    name: "사라오름 입구(사라샘)",
    trail: "성판악",
    alt: 1300,
    features: "사라오름 산정호수 갈림길 계단과 시원한 샘물(사라샘)이 솟는 약수터 지대",
    surface: "가파른 목재 계단 갈림길과 현무암 돌길",
    vegetation: "서어나무와 단풍나무 등 혼효림 지대",
    weatherHazard: "물기로 인한 돌계단 미끄럼 낙상 및 분기점 길 엇갈림 주의",
    keywords: ["사라오름", "사라샘", "사라", "1-18", "1300", "약수터", "샘", "물소리"]
  },
  {
    name: "백록담 동릉 정상",
    trail: "성판악",
    alt: 1950,
    features: "한라산 최고봉 백록담 분화구 화구벽을 마주하는 최정상 능선 데크",
    surface: "목재 데크 전망대 및 가파른 정상 능선 자갈길",
    vegetation: "시무나무와 눈향나무 등 왜소 고산 식물",
    weatherHazard: "칼바람과 극심한 기상 급변, 낭떠러지 화구벽 추락 극위험 지대",
    keywords: ["백록담", "정상", "동릉", "1-36", "1950", "분화구", "칼바람"]
  },

  // --- 관음사 코스 ---
  {
    name: "삼각봉 대피소",
    trail: "관음사",
    alt: 1500,
    features: "삼각뿔 형태의 거대한 화산암 암봉(삼각봉) 바로 아래 위치한 웅장한 대피소 광장",
    surface: "목재 데크 대피소 광장과 거친 현무암 돌계단, 용진각 현수교 진입로",
    vegetation: "원시림 협곡 및 험준한 암벽 관목대",
    weatherHazard: "협곡을 통과하는 강풍과 체감온도 급락, 기암벽 낙석 및 험로 실족 고위험",
    keywords: ["삼각봉", "2-24", "2-23", "1500", "대피소", "암봉", "바람"]
  },
  {
    name: "탐라계곡 대피소",
    trail: "관음사",
    alt: 950,
    features: "깊은 V자 탐라계곡 목교를 건너 가파른 계단 위에 위치한 무인 대피소",
    surface: "급경사 목재 계단과 계곡 목교 다리",
    vegetation: "울창한 낙엽활엽수 원시림",
    weatherHazard: "폭우 시 계곡 범람 및 급경사 계단 추락 위험",
    keywords: ["탐라계곡", "탐라", "2-12", "950", "계곡", "목교", "다리"]
  },
  {
    name: "용진각 현수교(출렁다리)",
    trail: "관음사",
    alt: 1600,
    features: "옛 용진각 대피소 터 인근 깊은 협곡을 가로지르는 웅장한 현수교 출렁다리",
    surface: "철제 및 목재 현수교 상판과 암반 데크",
    vegetation: "가파른 암벽 및 고사목",
    weatherHazard: "깊은 협곡 강풍으로 다리 흔들림, 안개 시 고소공포 및 발밑 실족 주의",
    keywords: ["용진각", "현수교", "출렁다리", "2-27", "1600", "다리", "협곡"]
  },

  // --- 어리목 코스 ---
  {
    name: "사제비샘(음수대)",
    trail: "어리목",
    alt: 1420,
    features: "가파른 돌계단 숲길을 벗어나 만나는 시원한 천연 용천수 음수대 쉼터",
    surface: "현무암 돌계단 끝 지점과 평탄한 화산석 바닥",
    vegetation: "울창한 숲에서 사제비동산 관목 초원으로 전환되는 지대",
    weatherHazard: "습기로 인한 바위 미끄럼 및 급경사 후 탈진 주의",
    keywords: ["사제비샘", "사제비", "1-8", "1420", "샘", "약수터", "물", "돌계단"]
  },
  {
    name: "만세동산 전망대",
    trail: "어리목",
    alt: 1600,
    features: "백록담 북서벽과 제주 서부 오름 군락이 파노라마로 펼쳐지는 목재 전망 데크",
    surface: "목재 데크 전망대와 완만한 자갈 흙길",
    vegetation: "시원하게 트인 고산 초원 및 저목성 관목",
    weatherHazard: "강풍 노출 및 안개 유입 시 망원경 전망대 인근 시야 차단 주의",
    keywords: ["만세동산", "전망대", "1-13", "1600", "초원", "전망"]
  },

  // --- 돈내코 코스 ---
  {
    name: "평궤 대피소",
    trail: "돈내코",
    alt: 1450,
    features: "용암이 흘러 굳으며 형성된 천연 암석 그늘(평궤) 형태의 무인 대피소 지대",
    surface: "크고 거친 현무암 너덜바위와 숲속 오솔길",
    vegetation: "상록활엽수림에서 침엽수림으로 교체되는 원시림",
    weatherHazard: "탐방객이 적어 등산로 경계 식별이 어렵고 짙은 숲 그늘로 방향 착오 고위험",
    keywords: ["평궤", "평궤대피소", "1-16", "1450", "바위그늘", "대피소"]
  },
  {
    name: "남벽분기점",
    trail: "돈내코",
    alt: 1600,
    features: "한라산 백록담 남벽의 거대한 수직 화구벽이 병풍처럼 올려다보이는 삼거리 분기점",
    surface: "목재 데크 통제소 광장 및 평탄한 자갈길",
    vegetation: "남벽 아래 거친 화산 쇄설물 암석원 및 왜소 관목대",
    weatherHazard: "남벽 화구벽 낙석 위험 및 안개 시 윗세오름/돈내코 갈림길 혼선 주의",
    keywords: ["남벽", "남벽분기점", "1-27", "1600", "분기점", "갈림길", "화구벽"]
  }
];

export function getTerrainProfile(name: string, trail?: TrailName, alt?: number): LandmarkTerrainProfile | undefined {
  // 1. 이름 완전/부분 일치
  const byName = HALLASAN_TERRAIN_PROFILES.find(p =>
    p.name.includes(name) || name.includes(p.name) || p.keywords.some(k => name.includes(k))
  );
  if (byName) return byName;

  // 2. 코스 + 고도 일치
  if (trail && alt) {
    const byTrailAlt = HALLASAN_TERRAIN_PROFILES.find(p =>
      p.trail === trail && Math.abs(p.alt - alt) <= 60
    );
    if (byTrailAlt) return byTrailAlt;
  }

  return undefined;
}

export const DEFAULT_HIKING_TRAIL = {
  mountainName: "한라산 국립공원",
  location: "제주특별자치도",
  trails: HALLASAN_TRAILS,
  signs: HALLASAN_SIGNS,
  synonyms: LANDMARK_SYNONYMS,
  terrainProfiles: HALLASAN_TERRAIN_PROFILES,
  totalTrails: 5,
  peakAltitude: 1950,
};

