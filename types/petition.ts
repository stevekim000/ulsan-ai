export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: any;
}

export type PetitionCategory = '시설/환경' | '학사/수업' | '학생복지' | '기타';

export type PetitionType = 'public' | 'general'; // 공개청원(전교생 동의) | 일반청원(비공개 건의)

export type PetitionStatus = 'pending' | 'active' | 'waiting_answer' | 'answered' | 'expired' | 'rejected';

export interface OfficialAnswer {
  content: string;
  answeredBy: string;
  answeredAt: any;
}

export interface Petition {
  id: string;
  title: string;
  category: PetitionCategory;
  type: PetitionType;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  agreeCount: number;
  goalCount: number; // 기본 50명
  status: PetitionStatus;
  createdAt: any;
  expiresAt?: any; // 공개청원: 작성일 기준 14일 후 (일반건의: 미적용)
  officialAnswer?: OfficialAnswer;
  rejectionReason?: string; // 반려 사유
}

export interface Agreement {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  agreedAt: any;
}
