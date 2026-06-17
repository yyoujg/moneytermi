# 출시 노트 (개발자용)

moneytermi 개발자용 변경 이력. 사용자 노출 문구가 아닌 기술 변경 요약이며,
각 항목에 의도와 주요 변경 파일을 함께 적는다.

---

## 2026-06-16 — 분석 / 다크모드 후속 빌드

### 주요 기능

- **Analytics 이벤트 로깅 (C-4)** (`d145aa4`)
  - `@apps-in-toss/web-analytics`의 `Analytics.screen/click`를 감싼 가드 래퍼
    `src/lib/analytics.ts` 신설(init 불필요, 미지원/웹/개발 환경 조용히 무시).
  - 도입 이벤트: `screen_view`(라우트 변경, `App.tsx` ScreenLogger),
    `course_start`(`CourseScreen`/`HomeScreen`, course_id·title),
    `quiz_complete`(`QuizScreen` mode:quiz / `ReviewScreen` mode:review, total·correct),
    `mission_reward_claim`(`AppContext.claimReward`, mission_id·reward).
  - 기존 `requestAppReview` 지점에 병치. 프로덕션에서만 집계(대시보드 +1일).

### UX

- **다크모드 light-only 명시** (`16e0d25`)
  - `index.html`에 `color-scheme: light` / `theme-color: #F97316` 메타,
    `src/index.css`에 `:root { color-scheme: light }` 추가.
  - OS/웹뷰 강제 다크 반전과 UA 폼 컨트롤 다크 렌더로 인한 가독성 깨짐 방지.
    전면 다크 테마(하드코딩 색 298개 토큰화)는 별도 작업으로 미대응.

### 문서

- **문서 추가/갱신** (`8188b3c`)
  - `RELEASE_NOTES.md`, `DATA_STRUCTURE.md` 추가, `APPS_IN_TOSS_TODO.md` 갱신
    (완료 항목 정리 + 앱인토스 콘솔 설정 E 섹션 구체화), `README.md` 문서 링크.

---

## 2026-06-16 — Apps in Toss 출시 준비 빌드

### 주요 기능

- **데일리 용어 푸시 동의 (DAILY_TERM_PUSH)** (`b1becfc`)
  - 토스 콘솔 스마트 발송용 알림 동의 플로우 추가. `requestNotificationAgreement`로
    동의를 받고 결과를 `setting_notification_agreement`에 저장.
  - 퀴즈/복습 결과 화면에 동의 유도 카드 노출.
  - 발송 코드 `DAILY_TERM_PUSH`, 매일 09:00 KST, 이동 URL `intoss://moneytermi/word-card`.
  - 직접 API 발송 대비 백업 자산(미배포): `migration_push_subscriptions.sql`,
    Edge Function `toss-register-push` / `daily-term-push`.
  - 주요 파일: `src/hooks/useNotificationAgreement.ts`,
    `src/components/DailyAlarmPromptCard.tsx`, `src/components/mypage/SettingsSheet.tsx`.

### 보안 / 무결성

- **포인트 서버 권위 채점 (RPC)** (`5bbf494`)
  - 포인트 적립 경로를 서버 RPC로 일원화. 클라이언트의 `points`/`missions`는
    RPC 응답·초기 로드로 갱신되는 read-model로 전환.
  - `profiles.points` 직접 UPDATE 차단(`REVOKE UPDATE` 후 `emoji`/`nickname`만 컬럼 GRANT),
    `daily_missions`/`attendance` 클라 직접 쓰기 차단(SELECT만).
  - SECURITY DEFINER RPC 신설: `submit_quiz_answer`(서버가 `words.word`로 정답 판정,
    mode mc/typed별 점수·콤보·m3 진행), `claim_mission_reward`(자격 검증 후 m1=10/m3=30 적립),
    `checkin`(출석+m1 진행, 포인트 미지급), `current_profile_id`.
  - `profiles.quiz_combo` 컬럼 추가(서버 채점용 콤보 상태).
  - 한계: `guest_token`은 누구나 발급 가능 → 계정당 부풀림만 차단, 다계정 농사는 미차단.
  - 주요 파일: `supabase/migration_points_integrity.sql`, `src/context/AppContext.tsx`,
    `src/pages/QuizScreen.tsx`, `src/pages/ReviewScreen.tsx`, `src/lib/database.types.ts`.

### 안정성 / 버그 수정

- **Apps in Toss 적용 묶음** (`b9f152e`)
  - 푸시 딥링크 버그 수정: `landing.ts` `ALLOWED_PATHS`에 `/word-card` 추가(이전엔 `/home`
    폴백). state 없는 콜드 딥링크 진입 시 미완료 코스 기준 기본 단어 로드, 콘텐츠 로딩 중
    리다이렉트 보류. (`src/lib/landing.ts`, `src/pages/WordCardScreen.tsx`, `src/App.tsx`,
    회귀 테스트 `src/App.test.ts`)
  - SafeAreaInsets 적용: `SafeAreaInsets.get()` + `subscribe()` 기반 훅 신설, 루트 상단/
    네비바 하단 인셋 패딩. 웹/미지원 환경은 0 폴백. (`src/hooks/useSafeAreaInsets.ts`,
    `src/App.tsx`, `src/components/NavBar.tsx`)
  - requestReview 도입: 보상 수령·퀴즈 완료 등 긍정 순간에 호출(게이팅 없음, 노출은
    플랫폼 제어). (`src/lib/review.ts`, `src/context/AppContext.tsx`, `QuizScreen.tsx`,
    `ReviewScreen.tsx`)

### 이전 빌드의 관련 변경 (참고)

- 랜딩 스킴 라우팅을 HashRouter -> BrowserRouter(경로 기반)로 전환, 진단 로그 강화 (`d7f038f`).
- 비보안 컨텍스트(iOS http 샌드박스)에서 `crypto.randomUUID` 폴백 추가 (`295985a`).
- 브라우저 dev 백이벤트 크래시 가드 + 스킴 회귀 테스트 (`a2aae0b`).
- 라우트 코드 분할(`React.lazy`)·미사용 에셋 제거로 초기 로드 개선 (`3640427`).
- `@apps-in-toss/web-framework` 2.6.1 업데이트 (`75006fe`).

### 문서

- `DATA_STRUCTURE.md`(데이터 구조·RPC), `APP_INTRO.md`, `APPS_IN_TOSS_TODO.md`,
  `DAILY_TERM_PUSH.md` 추가/갱신. README `## 문서` 섹션에서 상호 링크.

---

## 배포 시 필요한 조치 (개발자 체크리스트)

- [ ] Supabase에 `migration_points_integrity.sql` 적용(미적용 시 RPC 부재로 채점/적립 실패).
- [ ] Supabase Auth URL Configuration에 origin 등록:
      `https://moneytermi.apps.tossmini.com`, `https://moneytermi.private-apps.tossmini.com`.
- [ ] 모든 테이블 RLS 활성 상태 재확인.
- [ ] (실기기 확인) `intoss://moneytermi/word-card` 딥링크 진입 시 단어 정상 표시.
- [ ] (실기기 확인) 노치/홈 인디케이터 영역 침범 없음(SafeAreaInsets).
- [ ] (실기기 확인) 리뷰 프롬프트 노출 조건 동작.
- [ ] (출시 후) 콘솔 분석 대시보드에서 이벤트 수집 확인(+1일, 프로덕션만 집계).
- [ ] 남은 출시 항목은 `APPS_IN_TOSS_TODO.md` 참고(특히 A-1 토스 로그인 연동).

> 참고: `package.json` 버전은 현재 `0.0.0`. 출시 시 버전 정책 확정 필요.
