import { LandmarkPOI } from "@/types/rescue";

// 수학여행 대표 명소: 한라산 국립공원 (성판악 ~ 백록담 탐방로, 해발 1,950m)
export const HALLASAN_LANDMARKS: LandmarkPOI[] = [
  {
    id: "halla-01",
    name: "성판악 탐방안내소 (출발점)",
    type: "crossroad",
    altitude: 750,
    lat: 33.3846,
    lng: 126.6171,
    description: "성판악 휴게소 및 등산로 초입 매표소, 해발 750m 표지석",
    keywords: ["성판악", "탐방안내소", "휴게소", "입구", "매표소", "750", "출발"]
  },
  {
    id: "halla-02",
    name: "한라산 4-3 지점 표지목 (삼나무 숲길)",
    type: "signpost",
    altitude: 900,
    lat: 33.3789,
    lng: 126.5982,
    description: "울창한 삼나무 숲길 구간, 노란색 탐방로 번호 4-3 표지판",
    keywords: ["4-3", "4의3", "삼나무", "숲길", "900", "노란", "표지목", "팻말"]
  },
  {
    id: "halla-03",
    name: "속밭 대피소 (무인 대피소)",
    type: "shelter",
    altitude: 1100,
    lat: 33.3721,
    lng: 126.5824,
    description: "넓은 데크 쉼터와 무인 대피소, 화장실 위치 (해발 1,100m 안내판)",
    keywords: ["속밭", "대피소", "1100", "화장실", "쉼터", "데크", "천백미터"]
  },
  {
    id: "halla-04",
    name: "속밭 샘터 (약수터)",
    type: "spring",
    altitude: 1250,
    lat: 33.3685,
    lng: 126.5741,
    description: "졸졸 물 흐르는 소리가 들리는 약수터, 돌계단 오르막 시작점",
    keywords: ["샘터", "약수터", "물소리", "옹달샘", "물", "1250", "천이백"]
  },
  {
    id: "halla-05",
    name: "사라오름 입구 갈림길",
    type: "crossroad",
    altitude: 1324,
    lat: 33.3648,
    lng: 126.5662,
    description: "사라오름 전망대(산정호수)와 정상 방향 갈림길 이정표 (4-12 표지목)",
    keywords: ["사라오름", "갈림길", "4-12", "이정표", "분기점", "1324", "1300", "나무계단"]
  },
  {
    id: "halla-06",
    name: "진달래밭 대피소 (통제소)",
    type: "shelter",
    altitude: 1500,
    lat: 33.3602,
    lng: 126.5528,
    description: "정상 등반 통제소, 대형 기상 전광판 및 해발 1,500m 고도 안내판",
    keywords: ["진달래밭", "진달래", "대피소", "통제소", "1500", "전광판", "천오백", "통제"]
  },
  {
    id: "halla-07",
    name: "구상나무 고사목 지대 (너덜바위)",
    type: "rock",
    altitude: 1700,
    lat: 33.3571,
    lng: 126.5412,
    description: "하얗게 마른 구상나무 고사목 군락과 돌무더기 급경사, 안개 다발 구간",
    keywords: ["고사목", "구상나무", "마른나무", "바위길", "너덜", "돌", "안개", "1700", "바람"]
  },
  {
    id: "halla-08",
    name: "백록담 정상 (동능 정상 표지석)",
    type: "ridge",
    altitude: 1950,
    lat: 33.3617,
    lng: 126.5348,
    description: "대한민국 최고봉 1,950m 표지석, 백록담 분화구 조망 목재 데크",
    keywords: ["백록담", "정상", "정상석", "1950", "분화구", "꼭대기", "동능"]
  }
];

export const DEFAULT_HIKING_TRAIL = {
  mountainName: "한라산 국립공원 (성판악 코스)",
  location: "제주특별자치도",
  startPointName: "성판악 탐방안내소 (750m)",
  summitName: "한라산 백록담 정상 (1,950m)",
  courseDistanceKm: 9.6,
  expectedHours: 4.5,
  landmarks: HALLASAN_LANDMARKS
};
