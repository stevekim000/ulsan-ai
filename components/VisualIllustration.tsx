"use client";

import React, { useState } from "react";
import { 
  Compass, 
  MapPin, 
  Eye, 
  Info, 
  CheckCircle2, 
  X, 
  Mountain, 
  Navigation,
  Sparkles,
  Layers
} from "lucide-react";
import { TrailName } from "@/lib/mountainData";

export interface LandmarkIllustrationData {
  id: string;
  name: string;
  course: TrailName | "공통";
  altitude: string;
  signCode?: string;
  featureTitle: string;
  description: string;
  identificationClues: string[];
  terrainCondition: string;
}

export const LANDMARK_ILLUSTRATIONS: LandmarkIllustrationData[] = [
  {
    id: "jindalrae",
    name: "진달래밭 대피소",
    course: "성판악",
    altitude: "1,500m",
    signCode: "성판악 1-24",
    featureTitle: "붉은 지붕 대피소와 완만한 고원 분지",
    description: "성판악 코스 해발 1,500m에 위치한 핵심 대피소. 선명한 붉은색 기와지붕 건물과 기상관측 장비, 백록담 동릉 정상 진입 통제소가 있습니다.",
    identificationClues: ["붉은색/주황색 지붕 건물", "해발 1500m 표지석", "백록담 정상 통제 게이트", "성판악 1-24 표지목"],
    terrainCondition: "완만한 화산암 자갈길 및 목재 데크 쉼터",
  },
  {
    id: "byeongpung",
    name: "영실 기암 병풍바위",
    course: "영실",
    altitude: "1,400m ~ 1,450m",
    signCode: "영실 1-10 ~ 1-12",
    featureTitle: "수직 암벽 주상절리와 웅장한 원경",
    description: "영실 코스의 상징적인 거대 주상절리 기암괴석 벽. 병풍을 둘러친 듯 깎아지른 수직 바위 기둥들이 서귀포 남해 바다와 함께 조망됩니다.",
    identificationClues: ["거대한 수직 바위벽(병풍바위)", "오백나한 바위 봉우리", "가파른 목재 계단", "영실 1-12 표지목"],
    terrainCondition: "가파른 급경사 목재 데크 계단 및 거친 암반 너덜길",
  },
  {
    id: "samgakbong",
    name: "삼각봉 대피소",
    course: "관음사",
    altitude: "1,500m",
    signCode: "관음사 2-24",
    featureTitle: "피라미드형 거대 암봉과 현대식 대피소",
    description: "관음사 코스 북벽 방향의 해발 1,500m 거점. 삼각형 뿔처럼 솟아오른 삼각봉 암벽 아래 현대식 대피소가 위치합니다.",
    identificationClues: ["삼각형 모양의 뾰족한 암봉", "삼각봉 대피소 쉼터", "화물 모노레일 종착지", "관음사 2-24 표지목"],
    terrainCondition: "협곡 능선 화산암 너덜길 및 급경사 바위길",
  },
  {
    id: "yongjingak",
    name: "관음사 용진각 현수교",
    course: "관음사",
    altitude: "1,600m",
    signCode: "관음사 2-27",
    featureTitle: "깊은 V자 협곡과 현수교(출렁다리)",
    description: "과거 용진각 대피소가 있던 깊은 계곡 위를 가로지르는 붉은 케이블의 현수교. 백록담 북벽의 웅장한 암벽이 머리 위에 올려다보입니다.",
    identificationClues: ["흔들리는 출렁다리(현수교)", "깊은 계곡 V자 협곡", "붉은색 주탑 케이블", "백록담 북벽 암벽"],
    terrainCondition: "가파른 협곡 목재 데크 및 철제 보행교",
  },
  {
    id: "guringul",
    name: "구린굴",
    course: "관음사",
    altitude: "720m",
    signCode: "관음사 2-5",
    featureTitle: "천연 용암동굴 입구와 거친 암석 지대",
    description: "관음사 코스 하단 숲속에 위치한 한라산 천연 용암동굴. 입구에 커다란 용암 괴석들이 널려 있으며 한기가 느껴집니다.",
    identificationClues: ["어두운 천연 석굴/동굴 입구", "용암 바위 함몰지", "울창한 낙엽활엽수림", "관음사 2-5 표지목"],
    terrainCondition: "울창한 숲길 옆 용암 함몰구 암석 지대",
  },
  {
    id: "monorail",
    name: "탐라계곡 모노레일",
    course: "관음사",
    altitude: "910m ~ 1,300m",
    signCode: "관음사 2-10 ~ 2-20",
    featureTitle: "산악 구조 및 물류 운반용 철제 레일",
    description: "관음사 코스를 따라 대피소 물품 공급 및 구조용으로 설치된 1가닥의 철제 모노레일 레일. 등산로 옆에 길게 이어집니다.",
    identificationClues: ["바닥이나 옆에 깔린 철제 단궤 레일", "노란색/은색 기둥 받침", "탐라계곡 숲속"],
    terrainCondition: "개미등 급경사 흙길 및 현무암 너덜길",
  },
  {
    id: "seonjakjiwat",
    name: "선작지왓 고원",
    course: "영실",
    altitude: "1,600m ~ 1,650m",
    signCode: "영실 1-19",
    featureTitle: "탁 트인 고산 평전, 조릿대와 구상나무 고사목",
    description: "'작은 돌들이 널려있는 밭'이라는 제주 방언 고원 평전. 넓게 펼쳐진 제주조릿대와 하얗게 마른 구상나무 고사목, 백록담 화채봉이 조망됩니다.",
    identificationClues: ["탁 트인 드넓은 고산 초원 평전", "하얗게 마른 고사목(구상나무)", "제주조릿대 융단", "완만한 목재 데크길"],
    terrainCondition: "바람이 매우 강한 평탄한 목재 데크 탐방로",
  },
  {
    id: "saraoreum",
    name: "사라오름 산정호수",
    course: "성판악",
    altitude: "1,324m",
    signCode: "사라오름 1-2",
    featureTitle: "화산 분화구 호수와 물 위의 목재 데크",
    description: "성판악 코스 1,300m 지점에서 분기되는 기생화산. 분화구 안에 비가 오면 호수가 차오르고, 호수 위를 가로지르는 목재 데크가 설치되어 있습니다.",
    identificationClues: ["동그란 분화구 호수(물)", "호수 위를 걷는 나무 데크", "호수 건너편 전망대", "안개 자욱한 물가"],
    terrainCondition: "호수 둘레 목재 데크 및 완만한 분화구 능선",
  },
  {
    id: "mansedongsan",
    name: "만세동산 전망 능선",
    course: "어리목",
    altitude: "1,600m",
    signCode: "어리목 1-13",
    featureTitle: "광활한 제주 서부 오름 조망 능선",
    description: "어리목 코스 사제비동산을 지나 윗세오름으로 향하는 고산 능선 전망대. 맑은 날 제주 서부 수십 개의 오름과 바다가 파노라마로 펼쳐집니다.",
    identificationClues: ["2층 목재 전망 데크", "넓게 펼쳐진 서부 오름 조망", "만세동산 표지목", "제주조릿대 군락"],
    terrainCondition: "완만한 능선길 현무암 판석 및 목재 데크",
  },
  {
    id: "nambyeok",
    name: "백록담 남벽 분기점",
    course: "돈내코",
    altitude: "1,600m",
    signCode: "남벽 1-1",
    featureTitle: "거대한 백록담 남벽 암벽과 고산 분기점",
    description: "영실·어리목(윗세오름) 길과 돈내코 코스가 만나는 삼거리. 머리 바로 위에 백록담 남쪽의 거대하고 거친 수직 암벽이 위압적으로 솟아 있습니다.",
    identificationClues: ["거대한 남벽 수직 절벽", "영실/돈내코 갈림길 표지목", "무인 대피 통제 초소", "남벽 1-1 표지목"],
    terrainCondition: "자갈과 흙이 섞인 고산 평원 삼거리 갈림길",
  },
  {
    id: "national_sign",
    name: "국가지점번호 안내 표지판",
    course: "공통",
    altitude: "전 구간 (250m 간격)",
    signCode: "다라 / 다사 xxxx xxxx",
    featureTitle: "조난 시 10m 정밀 위치 특정 노란색 표지판",
    description: "산악 전역 250m 간격으로 설치된 공식 위치 식별판. 한글 2글자와 아라비아 숫자 8자리로 10m 단위 좌표를 소방청과 1:1 공유합니다.",
    identificationClues: ["선명한 노란색 사각 표지판", "'다라' 또는 '다사'로 시작하는 8자리 숫자", "119 구조 요청 번호 병기"],
    terrainCondition: "등산로 변 250m 간격 지주목 부착",
  },
  {
    id: "contour_1500m",
    name: "해발 1,500m 등고선 링",
    course: "공통",
    altitude: "1,500m 등고선",
    signCode: "한라산 전역 1500m 대역",
    featureTitle: "5대 코스가 모두 통과하는 아고산대 분기선",
    description: "한라산의 해발 1,500m 등고선 대역. 진달래밭(성판악), 오백나한(영실), 삼각봉(관음사), 사제비동산(어리목), 넓은드르(돈내코)가 둥글게 이어지는 핵심 고도 구간입니다.",
    identificationClues: ["기온 급강하(체감 5~8°C 하락)", "구상나무 아고산대 수림 시작", "등산로 주변 해발 1500m 표지석/팻말"],
    terrainCondition: "한라산 5대 코스가 교차 통과하는 원형 등고선 대역",
  },
];

interface VisualIllustrationProps {
  onSelectLandmark?: (landmark: LandmarkIllustrationData) => void;
  selectedLandmarkId?: string;
}

export default function VisualIllustration({
  onSelectLandmark,
  selectedLandmarkId,
}: VisualIllustrationProps) {
  const [activeModalLandmark, setActiveModalLandmark] = useState<LandmarkIllustrationData | null>(null);
  const [filterCourse, setFilterCourse] = useState<string>("전체");

  const filteredLandmarks = filterCourse === "전체"
    ? LANDMARK_ILLUSTRATIONS
    : LANDMARK_ILLUSTRATIONS.filter((l) => l.course === filterCourse || l.course === "공통");

  const renderSvgArtwork = (id: string) => {
    switch (id) {
      case "jindalrae":
        // 1. 진달래밭 대피소: 붉은 지붕, 산악 대피소와 주변 분지
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="skyJindalrae" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
            </defs>
            {/* Background Sky & Distant Peak */}
            <rect width="320" height="200" fill="url(#skyJindalrae)" />
            <path d="M0 130 Q160 70 320 130 L320 200 L0 200 Z" fill="#1e293b" opacity="0.6" />
            <path d="M40 140 Q160 90 280 140 L320 200 L0 200 Z" fill="#334155" />
            {/* Shelter Building Body */}
            <rect x="90" y="115" width="140" height="55" rx="3" fill="#64748b" stroke="#475569" strokeWidth="2" />
            {/* Red Roof */}
            <polygon points="80,118 160,78 240,118" fill="url(#roofGrad)" stroke="#fca5a5" strokeWidth="2" />
            {/* Windows & Door */}
            <rect x="110" y="130" width="20" height="18" rx="2" fill="#38bdf8" opacity="0.8" />
            <rect x="145" y="130" width="30" height="40" rx="2" fill="#1e293b" />
            <rect x="190" y="130" width="20" height="18" rx="2" fill="#38bdf8" opacity="0.8" />
            {/* Weather Sensor Tower */}
            <line x1="225" y1="115" x2="225" y2="70" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="225" cy="68" r="4" fill="#38bdf8" />
            {/* Foreground Terrain & Wooden Deck */}
            <path d="M0 170 Q160 160 320 170 L320 200 L0 200 Z" fill="#475569" />
            <line x1="60" y1="180" x2="260" y2="180" stroke="#78350f" strokeWidth="3" />
            <text x="160" y="193" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
              진달래밭 대피소 (해발 1,500m)
            </text>
          </svg>
        );

      case "byeongpung":
        // 2. 영실 기암 병풍바위: 수직 암벽, 주상절리 느낌의 바위와 원경
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="skyByeong" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
              <linearGradient id="rockGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#skyByeong)" />
            {/* Distant Sea/Horizon */}
            <path d="M0 120 L320 120 L320 200 L0 200 Z" fill="#1e293b" opacity="0.5" />
            {/* Vertical Basalt Columns (병풍바위 주상절리) */}
            <path d="M40 70 L60 65 L60 150 L40 150 Z" fill="url(#rockGrad)" stroke="#94a3b8" strokeWidth="1" />
            <path d="M65 55 L90 50 L90 155 L65 155 Z" fill="url(#rockGrad)" stroke="#94a3b8" strokeWidth="1" />
            <path d="M95 40 L125 35 L125 160 L95 160 Z" fill="url(#rockGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M130 30 L165 25 L165 165 L130 165 Z" fill="url(#rockGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M170 38 L200 32 L200 162 L170 162 Z" fill="url(#rockGrad)" stroke="#94a3b8" strokeWidth="1" />
            <path d="M205 50 L235 45 L235 158 L205 158 Z" fill="url(#rockGrad)" stroke="#94a3b8" strokeWidth="1" />
            <path d="M240 68 L270 62 L270 150 L240 150 Z" fill="url(#rockGrad)" stroke="#64748b" strokeWidth="1" />
            {/* Steep Wooden Deck Stairs */}
            <path d="M70 185 L140 150 L200 130" stroke="#f59e0b" strokeWidth="3" fill="none" strokeDasharray="4,3" />
            <text x="160" y="192" fill="#fde68a" fontSize="11" fontWeight="bold" textAnchor="middle">
              영실 기암 병풍바위 수직 주상절리
            </text>
          </svg>
        );

      case "samgakbong":
        // 3. 삼각봉 대피소: 피라미드형 암봉과 산악 대피소
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="skySamgak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0c4a6e" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#skySamgak)" />
            {/* Pyramid Peak (삼각봉) */}
            <polygon points="160,30 80,160 240,160" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
            <polygon points="160,30 160,160 240,160" fill="#1e293b" opacity="0.6" />
            {/* Shelter Building Under Peak */}
            <rect x="180" y="140" width="60" height="28" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <polygon points="175,140 210,120 245,140" fill="#0284c7" />
            {/* Foreground Ridge */}
            <path d="M0 165 Q160 155 320 165 L320 200 L0 200 Z" fill="#1e293b" />
            <text x="160" y="190" fill="#bae6fd" fontSize="11" fontWeight="bold" textAnchor="middle">
              관음사 삼각봉 대피소 (해발 1,500m)
            </text>
          </svg>
        );

      case "yongjingak":
        // 4. 관음사 용진각 현수교: 깊은 협곡과 현수교
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="skyYong" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#skyYong)" />
            {/* Deep V-shaped Valley */}
            <polygon points="0,70 90,190 0,200" fill="#0f172a" />
            <polygon points="320,70 230,190 320,200" fill="#0f172a" />
            {/* Suspension Bridge Towers */}
            <line x1="85" y1="75" x2="85" y2="145" stroke="#ef4444" strokeWidth="4" />
            <line x1="235" y1="75" x2="235" y2="145" stroke="#ef4444" strokeWidth="4" />
            {/* Main Hanging Cable */}
            <path d="M85 85 Q160 135 235 85" stroke="#fca5a5" strokeWidth="2.5" fill="none" />
            {/* Bridge Walkway Deck */}
            <line x1="75" y1="125" x2="245" y2="125" stroke="#e2e8f0" strokeWidth="4" />
            {/* Vertical Suspender Ropes */}
            <line x1="115" y1="105" x2="115" y2="125" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="140" y1="120" x2="140" y2="125" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="160" y1="123" x2="160" y2="125" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="180" y1="120" x2="180" y2="125" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="205" y1="105" x2="205" y2="125" stroke="#cbd5e1" strokeWidth="1" />
            <text x="160" y="185" fill="#fecaca" fontSize="11" fontWeight="bold" textAnchor="middle">
              관음사 용진각 현수교 (해발 1,600m 출렁다리)
            </text>
          </svg>
        );

      case "guringul":
        // 5. 구린굴: 용암 동굴 입구와 주변 암석
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#064e3b" />
            {/* Cave Mouth Outline */}
            <path d="M40 180 Q160 30 280 180 Z" fill="#022c22" stroke="#047857" strokeWidth="3" />
            {/* Deep Dark Cave Interior */}
            <ellipse cx="160" cy="140" rx="90" ry="45" fill="#020617" />
            {/* Lava Rocks Around Entrance */}
            <circle cx="80" cy="155" r="18" fill="#334155" stroke="#475569" strokeWidth="1" />
            <circle cx="115" cy="170" r="14" fill="#1e293b" />
            <circle cx="230" cy="160" r="22" fill="#334155" stroke="#475569" strokeWidth="1" />
            <circle cx="200" cy="172" r="12" fill="#1e293b" />
            <text x="160" y="190" fill="#a7f3d0" fontSize="11" fontWeight="bold" textAnchor="middle">
              구린굴 천연 용암동굴 (해발 720m)
            </text>
          </svg>
        );

      case "monorail":
        // 6. 탐라계곡 모노레일: 산악 지형과 철로
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#0f172a" />
            {/* Mountain Slope */}
            <polygon points="0,60 320,150 320,200 0,200" fill="#1e293b" />
            {/* Single Monorail Track Beam */}
            <line x1="10" y1="65" x2="310" y2="155" stroke="#f59e0b" strokeWidth="6" />
            <line x1="10" y1="65" x2="310" y2="155" stroke="#fef3c7" strokeWidth="2" />
            {/* Support Pillars */}
            <line x1="60" y1="80" x2="60" y2="120" stroke="#94a3b8" strokeWidth="4" />
            <line x1="130" y1="100" x2="130" y2="145" stroke="#94a3b8" strokeWidth="4" />
            <line x1="200" y1="120" x2="200" y2="170" stroke="#94a3b8" strokeWidth="4" />
            <line x1="270" y1="140" x2="270" y2="188" stroke="#94a3b8" strokeWidth="4" />
            {/* Supply Cart on Monorail */}
            <rect x="145" y="86" width="38" height="20" rx="3" fill="#dc2626" stroke="#fca5a5" strokeWidth="1.5" />
            <text x="160" y="190" fill="#fde68a" fontSize="11" fontWeight="bold" textAnchor="middle">
              탐라계곡 산악 물류 모노레일 레일
            </text>
          </svg>
        );

      case "seonjakjiwat":
        // 7. 선작지왓 고원: 고산 평전, 조릿대와 구상나무 고사목
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="skySeon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="url(#skySeon)" />
            {/* Hallasan Summit Profile in Distance */}
            <path d="M0 100 Q180 50 320 95 L320 200 L0 200 Z" fill="#334155" opacity="0.5" />
            {/* Broad Alpine Plateau (선작지왓 평전) */}
            <path d="M0 120 Q160 115 320 120 L320 200 L0 200 Z" fill="#15803d" />
            {/* Dead Korean Fir Trees (구상나무 고사목) */}
            <path d="M90 140 L90 85 M80 105 L90 98 M100 115 L90 108" stroke="#f1f5f9" strokeWidth="2.5" />
            <path d="M210 145 L210 95 M200 115 L210 108 M220 125 L210 118" stroke="#f1f5f9" strokeWidth="2.5" />
            {/* Wooden Deck Path */}
            <polygon points="150,120 170,120 190,200 130,200" fill="#78350f" opacity="0.8" />
            <text x="160" y="190" fill="#bbf7d0" fontSize="11" fontWeight="bold" textAnchor="middle">
              선작지왓 고원 평전 &amp; 구상나무 고사목 (해발 1,600m)
            </text>
          </svg>
        );

      case "saraoreum":
        // 8. 사라오름 산정호수: 분화구 호수와 주변 능선
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lakeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            <rect width="320" height="200" fill="#0f172a" />
            {/* Crater Rim Profile */}
            <path d="M0 90 Q80 120 160 85 Q240 125 320 90 L320 200 L0 200 Z" fill="#14532d" />
            {/* Crater Lake Water (산정호수) */}
            <ellipse cx="160" cy="140" rx="120" ry="38" fill="url(#lakeGrad)" stroke="#38bdf8" strokeWidth="2" />
            {/* Wooden Deck Boardwalk Crossing Water */}
            <line x1="60" y1="140" x2="260" y2="140" stroke="#f59e0b" strokeWidth="4" />
            <text x="160" y="190" fill="#bae6fd" fontSize="11" fontWeight="bold" textAnchor="middle">
              사라오름 분화구 산정호수 (해발 1,324m)
            </text>
          </svg>
        );

      case "mansedongsan":
        // 9. 만세동산 전망 능선: 조망 지점과 산악 능선
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#1e1b4b" />
            {/* Multiple Mountain Ridges & Oreums */}
            <path d="M0 100 Q90 60 180 95 Q270 65 320 100 L320 200 L0 200 Z" fill="#312e81" opacity="0.6" />
            <path d="M0 125 Q130 90 260 120 L320 200 L0 200 Z" fill="#1e293b" />
            {/* Observation Deck Platform */}
            <rect x="110" y="115" width="100" height="25" rx="3" fill="#92400e" stroke="#fbbf24" strokeWidth="2" />
            {/* Deck Railing */}
            <line x1="110" y1="110" x2="210" y2="110" stroke="#fef3c7" strokeWidth="2" />
            <line x1="130" y1="110" x2="130" y2="115" stroke="#fef3c7" strokeWidth="1.5" />
            <line x1="160" y1="110" x2="160" y2="115" stroke="#fef3c7" strokeWidth="1.5" />
            <line x1="190" y1="110" x2="190" y2="115" stroke="#fef3c7" strokeWidth="1.5" />
            <text x="160" y="185" fill="#fde68a" fontSize="11" fontWeight="bold" textAnchor="middle">
              만세동산 2층 전망 능선 데크 (해발 1,600m)
            </text>
          </svg>
        );

      case "nambyeok":
        // 10. 백록담 남벽 분기점: 거친 암벽과 산악 지형
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#0f172a" />
            {/* Massive Rugged South Wall Cliff */}
            <polygon points="30,130 90,30 180,25 240,40 290,135" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
            <line x1="90" y1="30" x2="90" y2="130" stroke="#334155" strokeWidth="2" />
            <line x1="180" y1="25" x2="180" y2="135" stroke="#334155" strokeWidth="2" />
            <line x1="240" y1="40" x2="230" y2="135" stroke="#334155" strokeWidth="2" />
            {/* Alpine Junction Trail Ground */}
            <path d="M0 135 L320 135 L320 200 L0 200 Z" fill="#1e293b" />
            {/* Signpost */}
            <line x1="160" y1="135" x2="160" y2="165" stroke="#cbd5e1" strokeWidth="3" />
            <rect x="140" y="140" width="40" height="15" rx="2" fill="#ef4444" />
            <text x="160" y="190" fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle">
              백록담 남벽 분기점 거대 암벽 (해발 1,600m)
            </text>
          </svg>
        );

      case "national_sign":
        // 11. 국가지점번호 안내 표지판: 노란색 표지판과 번호
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#0f172a" />
            {/* Signpost Post */}
            <rect x="150" y="90" width="20" height="100" fill="#64748b" stroke="#334155" strokeWidth="2" />
            {/* Standard Yellow National Point Code Sign Board */}
            <rect x="70" y="25" width="180" height="100" rx="8" fill="#facc15" stroke="#ca8a04" strokeWidth="4" />
            <text x="160" y="48" fill="#1e293b" fontSize="13" fontWeight="900" textAnchor="middle">
              국가지점번호
            </text>
            <rect x="85" y="55" width="150" height="36" rx="4" fill="#ffffff" stroke="#e2e8f0" />
            <text x="160" y="78" fill="#0f172a" fontSize="15" fontWeight="900" textAnchor="middle" letterSpacing="1">
              다라 0155 8122
            </text>
            <text x="160" y="110" fill="#b91c1c" fontSize="10" fontWeight="bold" textAnchor="middle">
              긴급 신고 119 (10m 정밀 위치)
            </text>
            <text x="160" y="190" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
              국가지점번호 노란색 표준 표지판 (250m 간격)
            </text>
          </svg>
        );

      case "contour_1500m":
        // 12. 해발 1500m 등고선 링: 동심원 형태의 고도 시각화
        return (
          <svg viewBox="0 0 320 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="200" fill="#020617" />
            {/* Topographic Contour Rings */}
            <ellipse cx="160" cy="100" rx="140" ry="70" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
            <ellipse cx="160" cy="100" rx="110" ry="55" fill="none" stroke="#0ea5e9" strokeWidth="3" opacity="0.9" />
            <ellipse cx="160" cy="100" rx="75" ry="38" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
            <ellipse cx="160" cy="100" rx="40" ry="20" fill="none" stroke="#334155" strokeWidth="1" />
            <circle cx="160" cy="100" r="4" fill="#ef4444" />
            {/* 5 Course 1500m Intersection Points */}
            <circle cx="260" cy="95" r="5" fill="#4caf50" />
            <text x="270" y="93" fill="#4caf50" fontSize="9" fontWeight="bold">성판악</text>
            <circle cx="65" cy="100" r="5" fill="#ff9800" />
            <text x="35" y="98" fill="#ff9800" fontSize="9" fontWeight="bold">영실</text>
            <circle cx="160" cy="45" r="5" fill="#2196f3" />
            <text x="160" y="38" fill="#2196f3" fontSize="9" fontWeight="bold" textAnchor="middle">관음사</text>
            <circle cx="95" cy="70" r="5" fill="#9c27b0" />
            <text x="65" y="65" fill="#9c27b0" fontSize="9" fontWeight="bold">어리목</text>
            <circle cx="205" cy="138" r="5" fill="#00bcd4" />
            <text x="215" y="148" fill="#00bcd4" fontSize="9" fontWeight="bold">돈내코</text>
            <text x="160" y="188" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
              한라산 5대 탐방로 해발 1,500m 공통 등고선 링
            </text>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-600/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>시각적 지형 랜드마크 SVG 갤러리</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                12종 일러스트
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              외부 이미지 링크 없이 인라인 SVG로 구현된 한라산 핵심 식별 지형물
            </p>
          </div>
        </div>

        {/* Course Filter Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          {["전체", "영실", "성판악", "관음사", "어리목", "돈내코", "공통"].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCourse(c)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                filterCourse === c
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 12 Landmarks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredLandmarks.map((lm) => {
          const isSelected = selectedLandmarkId === lm.id;
          return (
            <div
              key={lm.id}
              onClick={() => {
                setActiveModalLandmark(lm);
                if (onSelectLandmark) onSelectLandmark(lm);
              }}
              className={`group bg-slate-950/80 border rounded-2xl p-3 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:border-blue-500/60 shadow-lg space-y-2.5 ${
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-500/40 bg-blue-950/20"
                  : "border-slate-800/90"
              }`}
            >
              {/* Responsive SVG Artwork Box */}
              <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-slate-800/60 relative">
                {renderSvgArtwork(lm.id)}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-black/70 text-white backdrop-blur-sm border border-white/20">
                    {lm.course}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600/80 text-white backdrop-blur-sm">
                    {lm.altitude}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-xs font-black text-white group-hover:text-blue-300 transition-colors flex items-center justify-between">
                  <span>{lm.name}</span>
                  {lm.signCode && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {lm.signCode}
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {lm.featureTitle}
                </p>
              </div>

              {/* Identification Clues Badges */}
              <div className="flex flex-wrap gap-1">
                {lm.identificationClues.slice(0, 2).map((clue, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] bg-slate-900 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded font-medium truncate max-w-[140px]"
                  >
                    #{clue}
                  </span>
                ))}
                {lm.identificationClues.length > 2 && (
                  <span className="text-[9px] text-slate-500 px-1 py-0.5">
                    +{lm.identificationClues.length - 2}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Disclaimer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
        <span>* 일러스트는 지형 특징 이해를 돕기 위한 참고용 시각화 그래픽입니다.</span>
        <span>총 12종 등록 완료</span>
      </div>

      {/* Detail Modal */}
      {activeModalLandmark && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md text-xs font-black bg-blue-600 text-white">
                  {activeModalLandmark.course} 코스
                </span>
                <h3 className="text-sm font-black text-white">
                  {activeModalLandmark.name} 상세 정보
                </h3>
              </div>
              <button
                onClick={() => setActiveModalLandmark(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal SVG Display */}
            <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              {renderSvgArtwork(activeModalLandmark.id)}
            </div>

            {/* Text Information */}
            <div className="space-y-2.5 text-xs">
              <div>
                <p className="text-[11px] font-bold text-sky-400">
                  {activeModalLandmark.featureTitle}
                </p>
                <p className="text-slate-300 leading-relaxed mt-1">
                  {activeModalLandmark.description}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">위치 및 고도:</span>
                  <span className="font-bold text-white">
                    {activeModalLandmark.course} 코스 ({activeModalLandmark.altitude})
                  </span>
                </div>
                {activeModalLandmark.signCode && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">위치 표지목 코드:</span>
                    <span className="font-bold text-amber-300 font-mono">
                      {activeModalLandmark.signCode}
                    </span>
                  </div>
                )}
                <div className="text-[11px]">
                  <span className="text-slate-400">주변 지형 및 보행 환경: </span>
                  <span className="text-slate-300">{activeModalLandmark.terrainCondition}</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-300 mb-1.5">
                  🔍 음성 식별 단서 목록:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalLandmark.identificationClues.map((clue, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-slate-800 text-sky-300 border border-slate-700 px-2 py-0.5 rounded-lg font-medium"
                    >
                      ✓ {clue}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModalLandmark(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
