import { Petition, PetitionStatus } from "@/types/petition";

export function parseDate(val: any): Date | null {
  if (!val) return null;
  if (typeof val.toDate === "function") {
    const d = val.toDate();
    return isNaN(d.getTime()) ? null : d;
  }
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val.seconds === "number") {
    return new Date(val.seconds * 1000);
  }
  if (typeof val._seconds === "number") {
    return new Date(val._seconds * 1000);
  }
  return null;
}

export function isPetitionExpired(petition: Petition): boolean {
  if (!petition) return false;
  // 일반 건의(1:1 건의)는 마감 기간 없이 답변 시까지 상시 유지 (만료 대상 제외)
  if (petition.type === "general") return false;

  if (petition.status === "expired") return true;
  if (!petition.expiresAt) return false;
  
  // 답변 완료되었거나 반려된 청원은 해당 상태 유지
  if (
    petition.status === "answered" ||
    petition.status === "rejected"
  ) {
    return false;
  }

  const expDate = parseDate(petition.expiresAt);
  if (!expDate) return false;

  return Date.now() > expDate.getTime();
}

export function getEffectiveStatus(petition: Petition): PetitionStatus {
  if (!petition || !petition.status) {
    return "active";
  }
  if (petition.status === "expired") {
    return "expired";
  }
  if (
    petition.status !== "answered" &&
    petition.status !== "rejected" &&
    isPetitionExpired(petition)
  ) {
    return "expired";
  }
  return petition.status;
}

export function formatDate(dateVal: any): string {
  const d = parseDate(dateVal);
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export function formatPetitionDateRange(petition: Petition): string {
  if (petition.type === "general") {
    const start = formatDate(petition.createdAt);
    return start ? `접수일: ${start}` : "일반건의";
  }
  const start = formatDate(petition.createdAt);
  const end = formatDate(petition.expiresAt);
  if (start && end) {
    return `${start} ~ ${end}`;
  }
  if (start) {
    return start;
  }
  return "";
}

export function getDDayText(petition: Petition): string | null {
  // 일반 건의이거나 진행 중(active) 상태가 아닌 경우(만료, 답변 완료, 반려, 검토 대기 등) D-Day 미표시
  if (petition.type === "general") return null;
  
  const status = getEffectiveStatus(petition);
  if (status !== "active") return null;

  if (!petition.expiresAt) return null;
  const expDate = parseDate(petition.expiresAt);
  if (!expDate) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const expDayStart = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate()).getTime();
  
  const diffDays = Math.round((expDayStart - todayStart) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null; // 만료된 경우 D-Day 뱃지 숨김
  if (diffDays === 0) return "D-Day";
  return `D-${diffDays}`;
}

export function cleanStudentName(rawName?: string | null): string {
  if (!rawName) return "학생";
  
  let name = rawName.trim();
  
  // 1. 대괄호/소괄호 및 학번/반 정보 제거 (예: [10101], (10101), (1학년 2반), [1-2-3])
  name = name.replace(/\[[\d\s\-학년반번]+\]/g, "");
  name = name.replace(/\([\d\s\-학년반번]+\)/g, "");
  
  // 2. '1학년 2반 3번' 또는 '1학년 2반' 형태 텍스트 제거
  name = name.replace(/\d+\s*학년\s*\d+\s*반(\s*\d+\s*번)?/g, "");
  
  // 3. 앞쪽에 붙은 학번 숫자(3~10자리 또는 1-1-01 형태) 제거 (예: 10101홍길동 -> 홍길동, 10101 홍길동 -> 홍길동)
  name = name.replace(/^[\d\-]{3,10}\s*/, "");
  
  // 4. 뒤쪽에 붙은 학번 숫자 제거 (예: 홍길동 10101 -> 홍길동, 홍길동10101 -> 홍길동)
  name = name.replace(/\s*[\d\-]{3,10}$/, "");
  
  // 5. 남은 앞뒤 숫자 및 특수문자 정리
  name = name.replace(/^[\d\s\-_.]+/, "");
  name = name.replace(/[\d\s\-_.]+$/, "");
  name = name.trim();

  return name || rawName || "학생";
}


