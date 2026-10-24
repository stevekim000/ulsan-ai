import { Student, LocationPoint, RescueTimelineEvent } from "@/types/rescue";
import { HALLASAN_LANDMARKS } from "@/lib/mountainData";

const STORAGE_KEY_STUDENTS = "sanwoolim_students_v1";
const STORAGE_KEY_TIMELINE = "sanwoolim_timeline_v1";
const STORAGE_KEY_MY_GPS = "sanwoolim_offline_gps_v1";

// 기본 초기 수학여행 학생 데이터셋 (한라산 성판악 코스)
export const INITIAL_STUDENTS: Student[] = [
  {
    id: "std-01",
    name: "김민준 (조난 학생)",
    grade: 2,
    classNum: 3,
    studentNumber: "20305",
    status: "emergency",
    battery: 32,
    network: "unstable",
    lastLocation: {
      lat: 33.3605,
      lng: 126.5532,
      altitude: 1485,
      accuracy: 45,
      heading: 275,
      timestamp: Date.now() - 1000 * 60 * 3, // 3분 전
    },
    locationHistory: [
      { lat: 33.3846, lng: 126.6171, altitude: 750, timestamp: Date.now() - 1000 * 60 * 180 },
      { lat: 33.3789, lng: 126.5982, altitude: 900, timestamp: Date.now() - 1000 * 60 * 120 },
      { lat: 33.3721, lng: 126.5824, altitude: 1100, timestamp: Date.now() - 1000 * 60 * 70 },
      { lat: 33.3648, lng: 126.5662, altitude: 1324, timestamp: Date.now() - 1000 * 60 * 30 },
      { lat: 33.3605, lng: 126.5532, altitude: 1485, timestamp: Date.now() - 1000 * 60 * 3 },
    ],
    emergencyVoiceLog: "선생님, 친구들이랑 떨어졌는데 안개가 너무 짙어요. 앞에 해발 1500미터라고 적힌 큰 나무 팻말이 보이고 대피소 건물이 희미하게 보여요.",
    updatedAt: Date.now() - 1000 * 60 * 3,
  },
  {
    id: "std-02",
    name: "이서연",
    grade: 2,
    classNum: 3,
    studentNumber: "20312",
    status: "safe",
    battery: 84,
    network: "online",
    lastLocation: {
      lat: 33.3648,
      lng: 126.5662,
      altitude: 1324,
      accuracy: 10,
      timestamp: Date.now(),
    },
    locationHistory: [],
    updatedAt: Date.now(),
  },
  {
    id: "std-03",
    name: "박도윤",
    grade: 2,
    classNum: 3,
    studentNumber: "20308",
    status: "safe",
    battery: 68,
    network: "online",
    lastLocation: {
      lat: 33.3721,
      lng: 126.5824,
      altitude: 1100,
      accuracy: 12,
      timestamp: Date.now(),
    },
    locationHistory: [],
    updatedAt: Date.now(),
  },
  {
    id: "std-04",
    name: "최예은",
    grade: 2,
    classNum: 3,
    studentNumber: "20319",
    status: "safe",
    battery: 91,
    network: "online",
    lastLocation: {
      lat: 33.3685,
      lng: 126.5741,
      altitude: 1250,
      accuracy: 15,
      timestamp: Date.now(),
    },
    locationHistory: [],
    updatedAt: Date.now(),
  },
];

export const INITIAL_TIMELINE: RescueTimelineEvent[] = [
  {
    id: "tl-01",
    timestamp: Date.now() - 1000 * 60 * 15,
    title: "한라산 성판악 코스 수학여행 단체 등반 시작",
    content: "울산중앙고등학교 2학년 3반 28명 성판악 매표소 통과 (인솔 교사: 김선생, 박선생)",
    type: "resolved",
    actor: "인솔교사",
  },
  {
    id: "tl-02",
    timestamp: Date.now() - 1000 * 60 * 5,
    title: "김민준 학생 조난 SOS 신호 발생",
    content: "해발 1,400m 이상 고산지대 급격한 안개 발생으로 대열 이탈 감지. 단말기 긴급 조난 모드 가동.",
    type: "alert",
    actor: "산울림 AI 감지기",
  },
  {
    id: "tl-03",
    timestamp: Date.now() - 1000 * 60 * 3,
    title: "학생 주변 환경 음성 제보 접수 및 AI 분석 완료",
    content: "학생 음성: '해발 1500m 팻말과 대피소 건물이 희미하게 보여요' ➜ AI 분석: 진달래밭 대피소(1,500m) 인근 반경 35m로 위치 특정.",
    type: "ai_analysis",
    actor: "산울림 AI 엔진",
  },
  {
    id: "tl-04",
    timestamp: Date.now() - 1000 * 60 * 1,
    title: "119 한라산 산악구조대 및 인솔교사 현장 이동",
    content: "AI 특정 좌표(진달래밭 대피소 부근)로 구조대 및 인솔교사 급파. 학부모 안심 리포트 실시간 동기화.",
    type: "rescue_team",
    actor: "제주소방 산악구조대 & 교직원",
  },
];

export function getStoredStudents(): Student[] {
  if (typeof window === "undefined") return INITIAL_STUDENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STUDENTS;
  }
}

export function saveStudents(students: Student[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error("Failed to save students", e);
  }
}

export function getStoredTimeline(): RescueTimelineEvent[] {
  if (typeof window === "undefined") return INITIAL_TIMELINE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TIMELINE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(INITIAL_TIMELINE));
      return INITIAL_TIMELINE;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TIMELINE;
  }
}

export function addTimelineEvent(event: Omit<RescueTimelineEvent, "id">) {
  if (typeof window === "undefined") return;
  const current = getStoredTimeline();
  const newEvent: RescueTimelineEvent = {
    ...event,
    id: "tl-" + Date.now(),
  };
  const updated = [newEvent, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to add timeline event", e);
  }
}

// 오프라인 GPS 기록
export function appendOfflineGps(point: LocationPoint) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MY_GPS);
    const list: LocationPoint[] = raw ? JSON.parse(raw) : [];
    list.push(point);
    // 최대 최근 100개 포인트 보관
    if (list.length > 100) list.shift();
    localStorage.setItem(STORAGE_KEY_MY_GPS, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save GPS point", e);
  }
}

export function getOfflineGpsPoints(): LocationPoint[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MY_GPS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
