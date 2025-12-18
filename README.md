# 🐿️ To-Dook (투둑)

> AI 기반 스마트 할 일 관리 서비스

Gmail, Slack, Notion에서 AI가 자동으로 할 일을 추출해주는 생산성 도구입니다.

![To-Dook Banner](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)

---

## 📋 서비스 소개

**To-Dook**은 여러 서비스에 흩어진 업무 정보를 한 곳에서 관리할 수 있도록 도와주는 AI 기반 할 일 관리 서비스입니다.

### 핵심 가치
- 🤖 **AI 자동 추출**: Gmail, Slack, Notion에서 할 일을 자동으로 찾아줍니다
- 📱 **통합 관리**: 여러 플랫폼의 업무를 한 화면에서 관리
- ⚡ **빠른 조작**: 드래그 앤 드롭, 인라인 편집으로 빠른 업데이트
- 🌐 **다국어 지원**: 한국어/영어 지원

---

## ✨ 주요 기능

### 1. 할 일 관리 (To-Do)
- ✅ 할 일 생성, 수정, 삭제, 완료
- 🎯 드래그 앤 드롭으로 순서 변경
- 📅 마감일 설정 (오늘, 내일, 이번 주, 다음 주, 직접 선택)
- 🏷️ 이모지, 태그, 우선순위 지원
- ⚡ **Optimistic UI**: 백엔드 응답 전에 즉시 UI 반영

### 2. AI 할 일 자동 생성
- 📧 **Gmail 연동**: 이메일에서 할 일 추출
- 💬 **Slack 연동**: 메시지에서 할 일 추출
- 📝 **Notion 연동**: 페이지/데이터베이스에서 할 일 추출
- 🔗 출처 링크로 원본 확인 가능

### 3. 사용자 인증 & 온보딩
- 🔐 Google OAuth 로그인
- 👋 4단계 온보딩 플로우:
  1. 이름 입력
  2. 설정 안내 (서비스 연동)
  3. AI 새로고침 안내
  4. 추천인 코드 입력 (선택)

### 4. 추천인 제도
- 🎁 고유한 6자리 추천인 코드 자동 생성
- 📋 코드 복사하여 친구에게 공유
- 👥 추천한 친구 수 확인
- 🎉 추천인/피추천인 모두 혜택

### 5. 설정 & 권한 관리
- ⚙️ **일반**: 언어 설정 (한국어/영어)
- 🔗 **연결 정보**: Gmail, Slack, Notion 연동 관리
- 🔒 **권한 설정**: AI가 접근할 채널/페이지 선택
- 💳 **구독**: 플랜 관리 및 결제
- 👤 **계정**: 정보 확인 및 계정 삭제

### 6. 구독 시스템
- 🆓 7일 무료 체험
- 💰 Polar 결제 연동
- 📊 구독 상태 관리

---

## 🛠️ 기술 스택

### Frontend
- **Next.js 16** - React 프레임워크
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Tailwind CSS 4** - 스타일링
- **dnd-kit** - 드래그 앤 드롭

### Backend
- **Next.js API Routes** - 서버리스 API
- **Prisma** - ORM
- **PostgreSQL** - 데이터베이스 (Supabase)
- **NextAuth** - 인증

### AI & 외부 서비스
- **OpenAI GPT** - 할 일 추출 AI
- **Gmail API** - 이메일 연동
- **Slack API** - 슬랙 연동
- **Notion API** - 노션 연동
- **Polar** - 결제 시스템

### 배포 & 모니터링
- **Vercel** - 호스팅
- **Amplitude** - 사용자 분석

---

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/                    # API 라우트
│   │   ├── auth/               # NextAuth 인증
│   │   ├── todos/              # 할 일 CRUD
│   │   ├── onboarding/         # 온보딩
│   │   ├── referral/           # 추천인 제도
│   │   ├── settings/           # 설정 관리
│   │   ├── subscription/       # 구독 관리
│   │   └── checkout/           # 결제
│   ├── landing/                # 랜딩 페이지
│   ├── login/                  # 로그인 페이지
│   └── page.tsx                # 메인 페이지
├── components/
│   ├── Layout/
│   │   └── MainLayout.tsx      # 메인 레이아웃 + 온보딩
│   ├── Todo/
│   │   └── TodoMain.tsx        # 할 일 목록 컴포넌트
│   ├── Settings/
│   │   └── SettingsModal.tsx   # 설정 모달
│   ├── Chat/
│   │   └── ChatPanel.tsx       # AI 채팅 (준비중)
│   └── Sidebar/
│       └── Sidebar.tsx         # 사이드바
├── contexts/
│   └── LanguageContext.tsx     # 다국어 컨텍스트
├── lib/
│   ├── auth.ts                 # NextAuth 설정
│   ├── prisma.ts               # Prisma 클라이언트
│   ├── i18n.ts                 # 다국어 번역
│   └── polar-config.ts         # Polar 설정
└── types/
    └── next-auth.d.ts          # 타입 정의
```

---

## 🔧 주요 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/todos` | GET | 할 일 목록 조회 |
| `/api/todos` | POST | 할 일 생성 |
| `/api/todos` | PATCH | 할 일 수정 |
| `/api/todos` | DELETE | 할 일 삭제 |
| `/api/todos/generate` | POST | AI로 할 일 생성 |
| `/api/todos/reorder` | PATCH | 순서 변경 |
| `/api/onboarding` | GET/POST/PATCH | 온보딩 관리 |
| `/api/referral` | GET/POST | 추천인 코드 관리 |
| `/api/settings` | GET/PATCH | 설정 관리 |
| `/api/subscription` | GET | 구독 상태 조회 |

---

## 🌍 다국어 지원

현재 지원 언어:
- 🇰🇷 한국어 (기본)
- 🇺🇸 English

설정에서 언어를 변경할 수 있습니다.

---

## 📄 라이선스

MIT License

---

## 👨‍💻 개발자

- **GitHub**: [@dltmdgh0611](https://github.com/dltmdgh0611)

---

<p align="center">
  Made with ❤️ by To-Dook Team
</p>
