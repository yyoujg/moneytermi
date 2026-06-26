# 출시 노트 (개발자용)

moneytermi 개발자용 변경 이력. 사용자 노출 문구가 아닌 기술 변경 요약이며,
각 항목에 의도와 주요 변경 파일을 함께 적는다.

---

## 2026-06-26 — 디자인 토큰화 / 다크테마 보정 / UX 폴리시

### 토스 콘솔 출시노트 (사용자 노출용 — 아래 평문 그대로 등록)

```
이번 업데이트 주요 내용

[복습이 똑똑해졌어요]
오늘 복습할 단어만 골라서 보여드려요. 자주 틀린 단어는 자주, 익숙한 단어는 뜸하게 나오는 간격 반복 방식이라 더 효율적으로 외울 수 있어요.

[새로워진 '실천' 탭]
배운 경제 개념을 행동으로 옮겨보세요. 단어 카드에서 실천 항목을 담고, 나만의 체크리스트로 관리할 수 있어요.

[다크 모드 개선]
설정과 도움말 같은 팝업 화면까지 어두운 테마가 자연스럽게 적용돼요. 어두운 화면에서 하단 메뉴도 더 또렷해졌어요.

[그 외]
화면 곳곳의 간격과 정렬을 다듬고, 앱 사용법 안내를 최신 기능에 맞춰 업데이트했어요.
```

### 리팩터

- **브랜드·시맨틱 색 + 폰트 크기 @theme 토큰화** (`3630de4`)
  - `index.css @theme`에 `--color-brand-*`(200~600·deep)·`--color-success/danger/warning-*`,
    `--text-2xs/3xs/4xs`(11/10/9px) 정의. 하드코딩 `orange/green/red/yellow` 클래스 ~145곳을
    `brand/success/danger/warning`로, 임의 `text-[Npx]` 60곳을 토큰/기존 스케일로 1:1 치환. 시각 변화 없음.
  - 간격(p/m/gap)은 Tailwind 스케일이 이미 토큰이라 미변경(over-engineering 회피).

- **radius 토큰화 + 버튼/입력 pill**
  - `@theme`에 `--radius-card`(16)·`--radius-button`(pill)·`--radius-chip`(12) 정의. `rounded-2xl`→`rounded-card`,
    `rounded-xl`→`rounded-chip` 전면 치환. BUTTON/INPUT 25곳을 `rounded-button`(pill)으로 — 둥근 nav와 톤 일치.
    `rounded-full`(원형·진행바·점)·`rounded-t*`는 유지.

- **카드 등 컴포넌트화 + 세로 간격 통일**
  - 신규 `src/components/ui/`의 `Card`(tone card/surface · pad none/sm/md/lg)·`IconBox`·`StatCard`로 반복 마크업 단일화.
  - **전 화면 적용**: 모든 card/surface 카드 표면을 `<Card>`로 교체(Home·MyPage·Course·League·Review·Quiz·WordCard·
    CourseWordList·LeagueRules·Actions·SettingsSheet·NicknameSheet·DailyAlarm·AttendanceCalendar). 홈 통계 3종 `<StatCard>`,
    아이콘 홀더 `<IconBox>`. 읽기 카드는 `pad="none"`으로 기존 `px-5` 보존, 대칭 패딩은 md/lg 변형으로 통일.
    버튼형 카드(학습 알림·실천하기)는 `<button>` 의미 유지 위해 제외.
  - 세로 리듬 규칙: 최상위 블록·카드 16px(mb-4/gap-4), 섹션 헤더→내용 12px(mb-3). Home·MyPage·Review·Actions의
    이탈값(`mb-5`=20px, `p-6`=24px 등) 정리.

### UX

- **다크 모드 보정**
  - 하단 NavBar 알약에 `border-[var(--color-line)]` 추가 — 다크 캔버스에서 그림자만으로 안 보이던
    가장자리를 토큰 보더로 구분. (`NavBar.tsx`)
  - **TDS 바텀시트 다크 미적용 해결**: TDS 시트 배경은 OS `prefers-color-scheme` 기준 `var(--adaptiveBackground)`
    계열 변수에서 와서, 수동 다크(OS 라이트) 시 패널이 흰색으로 남던 문제. 컨텍스트 기반 시도(provider
    `colorScheme` prop, `ColorSchemeArea`)는 시트 패널에 미반영 → **`index.css` `.dark`에서 TDS adaptive 표면
    변수 9종(`--adaptiveBackground`/`Float`/`Layered`/`Level01/02/B01`/`GreyBackground`/`CardBgWhite/Grey`)을
    `var(--color-card/surface)`로 `!important` 오버라이드**(`<html>.dark`라 body 포털까지 상속). 시트 헤더 5종은
    TDS 기본 텍스트라 `color: var(--color-ink)` 명시. `useTheme.isDark`+`ColorSchemeArea`는 Switch 등 컨텍스트
    컴포넌트용으로 유지. (`index.css`, 5개 Sheet, `useTheme.tsx`, `main.tsx`)
- **화면 폴리시** (`17baa25`, `d237bd3`)
  - 홈 복습 카드 `<button>`(블록 중첩 오버플로)→`<div role="button">` 코스카드 패턴으로 겹침 수정.
  - 홈/실천 하단 여백(`pb-32`), 실천 섹션 헤더↔항목 간격(margin 미반영 대비 flex-gap), 퀴즈/복습 뜻↔설명 간격 보강.
  - NavBar 6탭 간격, 실천 화면 접근성(aria-label·탭 타깃), 복습 진입 흰 깜빡임 제거.

### 문서

- `GuideSheet`(앱 사용법 FAQ) 갱신: 복습 간격반복·실천 탭·다크 모드 항목 추가, stale 문구 정리.

---

## 2026-06-26 — SRS 복습 / 실천 레이어 / 코스 정렬

### 주요 기능

- **SRS(SM-2 lite) 간격반복 복습** (`3965b72`)
  - 신규 `src/lib/srs.ts` — `nextSrs`(오답=리셋, 정답+힌트=hard, 정답=good) / `gradeFromResult` / `addDays`.
  - `word_progress` 확장(ease·interval_d·reps·due_date·last_grade, DB 마이그레이션 별도 실행)에 맞춰
    `database.types.ts` 동기화.
  - `AppContext`에 `dueQueue`(due_date<=오늘 파생)·`recordReview`(SRS 일정만 갱신, 포인트 RPC 무관) 추가.
  - `ReviewScreen`을 전체 셔플 -> `dueQueue` 스냅샷 소비로 전환, 단어별 첫 제출에만 1회 채점,
    빈 큐/완료 상태 정리. 홈에 "오늘 복습할 단어 N개" 카드(`review_start` 로깅) 추가.

- **실천(actions) 레이어** (`664cf2d`, `dce635e`, `e17a279`)
  - 신규 테이블 `actions`(공개 템플릿) / `user_actions`(본인 체크리스트) — DB는 별도 실행, 앱에 타입·로직 추가.
  - `database.types.ts` + `src/types.ts`(`ActionTemplate`/`UserAction`) 동기화.
  - `AppContext`: `allActions`·`myActions` 상태, `actionsByWord`·`addAction`·`addCustomAction`·
    `toggleAction`·`removeAction`(낙관적, status 직접 쓰기, 포인트 경로 불가침).
  - 신규 `ActionsScreen`(미완료/완료 분리 체크리스트 + 직접 추가), `ActionPickerSheet`(TDS BottomSheet),
    단어 카드 "실천하기" 섹션(담은 개수 뱃지). `/actions` 라우트 + NavBar 6번째 "실천" 탭.

### 개선

- **코스 정렬 / 관련 용어 데드링크 필터** (`6c32c95`, `72de603`)
  - `courses` 조회에 `.order('sort_order')` 적용(학습 권장 순서), `database.types.ts`에 `sort_order` 동기화.
  - 단어 카드 "관련 용어"를 `allWords`에 존재하는 항목만 렌더(클릭 시 막히던 데드링크 제거).

### 문서

- `DATA_STRUCTURE.md` 갱신: `sort_order`·콘텐츠 시드 확장(words 233)·related_words 정합성 (`c11da35`).
- `APP_INTRO.md` 갱신: SRS 복습/실천 레이어/코스 수치(22코스·233단어)/다크테마 반영 (`d668233`).

---

## 2026-06-20 — 데일리 푸시 발송 코드 정정

### 버그 수정

- **데일리 푸시 `templateCode` 불일치** (`7e7d0e3`)
  - `useNotificationAgreement`의 `TEMPLATE_CODE`를 `DAILY_TERM_PUSH` -> `moneytermi-DAILY_TERM_PUSH`로
    수정. 콘솔엔 후자(기능성 캠페인 발송 코드)만 존재해 기존 값으론 동의 UI가 뜨지 않았음
    (`moneytermi-` 접두사는 콘솔 자동 부여).

### 문서

- 발송 방식을 **"토스에게 발송 요청"(서버리스 정기발송)** 으로 명확화. 직접 API 발송 대안의
  전제(userKey=토스 로그인 / 서버 간 mTLS / 사업자등록) 정리.
- 토스 문서의 "동의문 코드" vs "캠페인 발송 코드" 혼용 정정(이전 06-17 노트의
  "`DAILY_TERM_PUSH`=동의문 코드" 서술 대체). A-1의 "기능성 푸시=토스 로그인 필수" 과한 서술 완화.
- 주요 파일: `DAILY_TERM_PUSH.md`, `APPS_IN_TOSS_TODO.md`.
- 남은 콘솔 작업: 알림 동의문 등록 -> 캠페인 발송 방법을 "토스에게 발송 요청"으로 재설정 -> 검수/활성화.

---

## 2026-06-17 — 공유 / 전면 다크 테마 빌드

### 주요 기능

- **리그 공유 (C-1)** (`119bb0a`)
  - `share` / `getTossShareLink`가 `@apps-in-toss/web-bridge`(web-framework 재노출)로
    사용 가능함을 확인(이전 "패키지 미지원" 판단 정정).
  - 신규 `src/lib/share.ts` `shareTossLink(path, message)` — 링크 생성 후 네이티브 공유 시트,
    가드 try/catch(미지원/취소 무시), OG 이미지=브랜드 아이콘.
  - `LeagueScreen` 헤더에 공유 버튼 추가(`intoss://moneytermi/league`, `league_share` 로깅).

### UX

- **전면 다크 테마** (`a4868ea`)
  - CSS 변수 토큰 도입(`src/index.css` `:root`/`.dark` 12종). 하드코딩 색 전량
    `var(--color-*)` 치환(hex 298곳 + `bg-white` 72곳 + 인라인 rgba). 브랜드/의미색은 유지.
  - 활성화: 기본 시스템 따름 + 설정 수동 토글(시스템/라이트/다크).
    `src/hooks/useTheme.tsx`(ThemeProvider, Storage `setting_theme`), `SettingsSheet` 테마 UI.
  - 이전 light-only 강제(`color-scheme: light` 메타/`:root`)는 해제.

### 문서

- `APPS_IN_TOSS_TODO.md` 갱신: 출시 완료 항목 정리, 사업자등록 필요 항목 🔒 표기,
  E-2(스마트 메시지) 상세 절차 + `DAILY_TERM_PUSH`=동의문 코드 정정, F 콘솔 작업 순서.
- `DATA_STRUCTURE.md`에 `setting_theme` 키 추가.

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
