# 🏫 학교 전용 주체적 학생 청원 플랫폼 (School Petition Platform)

한 학교만의 자율적이고 주체적인 공론장을 형성하기 위한 온라인 학생 청원 플랫폼입니다.  
학생들의 목소리를 투명하게 수렴하고, 목표 동의 인원 달성 시 학생회 및 학교 측의 공식 답변을 연계합니다.

> **💡 청원 플랫폼 명칭 안내**:  
> 현재 플랫폼 명칭은 미정 상태이며, `lib/siteConfig.ts` 또는 환경변수(`NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SCHOOL_NAME`)를 통해 언제든지 원클릭으로 변경할 수 있도록 모듈화되어 있습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Backend & Database**: Firebase (Authentication, Cloud Firestore)
- **Deployment**: Vercel / GitHub Actions

---

## ✨ 핵심 기능 및 설계 (Core Features)

1. **학교 인증 체계 (Firebase Auth & Domain Verification)**
   - 학교 전용 구글 계정(`@school.hs.kr`) 도메인 자동 검증
   - 권한 분리: 일반 학생 (`student`), 학생회/관리자 (`admin`)

2. **청원 라이프사이클 관리 (Cloud Firestore)**
   - **공개청원**: 전교생 공개 및 동의 서명 수집 (목표 50명 달성 시 공식 답변 대기 전환)
   - **일반건의**: 비공개 1:1 건의
   - **상태 관리**: `[검토 대기 중]` ➜ `[진행 중]` ➜ `[답변 대기 중]` ➜ `[답변 완료]` / `[기간 만료]`

3. **1인 1동의 중복 방지 시스템**
   - Firestore Transaction 및 서브 컬렉션 기반의 무결성 보장
   - 실시간 동의율 및 프로그레스 바 시각화

4. **학생회/학교 공식 답변 시스템**
   - 목표 동의 수 도달 청원에 대한 공식 답변 등록 및 공지
   - 답변 완료 시 실시간 상태 갱신

5. **자율적 커스터마이징 구조 (`lib/siteConfig.ts`)**
   - 플랫폼 이름, 학교명, 도메인, 목표 동의수, 카테고리를 한 곳에서 일괄 수정 가능

---

## 🚀 실행 방법

### 1. 환경 변수 설정 (`.env.local`)
`.env.example` 파일을 복사하여 생성합니다:
```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_SCHOOL_DOMAIN=school.hs.kr
NEXT_PUBLIC_SITE_NAME=학생 청원 플랫폼
NEXT_PUBLIC_SCHOOL_NAME=우리학교
```

### 2. 패키지 설치 및 개발 서버 실행
```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📦 원격 저장소 (GitHub)
- Repository: [https://github.com/stevekim000/ulsan-ai](https://github.com/stevekim000/ulsan-ai)
