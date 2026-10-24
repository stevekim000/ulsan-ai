export const siteConfig = {
  // 청원의 이름이 아직 미정이므로, 손쉽게 변경하거나 환경변수로 주입할 수 있도록 중앙 집중 관리합니다.
  name: process.env.NEXT_PUBLIC_SITE_NAME || "학생 청원 플랫폼 (가칭)",
  schoolName: process.env.NEXT_PUBLIC_SCHOOL_NAME || "우리학교",
  slogan: "학생과 학교가 함께 만들어가는 주체적인 공론장",
  description: "한 학교만의 주체적인 온라인 학생 청원 플랫폼입니다. 투명하고 신뢰성 있는 학생 자치를 지원합니다.",
  domain: process.env.NEXT_PUBLIC_SCHOOL_DOMAIN || "school.hs.kr",
  
  // 관리자(학생회/담당교사) 이메일 목록
  adminEmails: (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "520stevekim@gmail.com,admin@school.hs.kr")
    .split(",")
    .map((e) => e.trim().toLowerCase()),

  // 청원 운영 기준
  defaultGoalCount: 50,       // 공식 답변 요건 (50명 동의)
  petitionPeriodDays: 14,     // 청원 진행 기간 (14일)

  // 카테고리 목록
  categories: ["시설/환경", "학사/수업", "학생복지", "기타"] as const,

  // 청원 플랫폼 이름 후보 (추후 결정 시 손쉽게 반영 가능)
  candidateNames: [
    { name: "스쿨보이스 (SchoolVoice)", desc: "학생의 생생한 목소리가 학교의 긍정적인 변화를 이끕니다" },
    { name: "소리샘", desc: "작은 의견과 아이디어가 샘솟는 학생 자치 공간" },
    { name: "청음 (聽音)", desc: "학교와 학생이 진심으로 서로의 의견을 경청하는 플랫폼" },
    { name: "울림 (Echo)", desc: "학생들의 깊은 공감이 모여 학교 전체에 변화의 울림을 전합니다" },
    { name: "한터청원", desc: "모든 학생이 자유롭게 모여 목소리를 내는 큰 터전" }
  ]
};
