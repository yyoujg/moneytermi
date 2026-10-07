# 머니터미 (moneytermi)

토스 미니앱(Apps in Toss) 환경에서 동작하는, 경제/금융 용어를 카드-퀴즈-복습 사이클로 익히는 학습 앱.

## 어떤 문제를 풀려고 만들었나

코드 흐름 기준으로 유추한 내용이며, 기획 의도를 단정하지 않는다.

- **첫 학습 진입장벽**: `HomeScreen`은 학습 이력이 없는 신규 유저에게 통계 대신 "단어 1개만 배워볼까요?" 단일 CTA를 보여준다. 처음 마주하는 경제 용어 학습에 대한 부담을 줄이려는 설계로 보인다.
- **한 번 배운 단어를 잊는 문제**: `src/lib/srs.ts`가 SM-2 경량판(ease/interval/reps)으로 정답 여부와 힌트 사용 여부에 따라 다음 복습일을 계산하고, `AppContext`의 `dueQueue`가 "오늘 복습할 단어"만 골라 `DAILY_REVIEW_CAP`(10개)로 제한한다. 학습 후 방치되지 않도록 복습 타이밍을 앱이 대신 관리하는 구조다.
- **지속 학습 동기부여 부족**: 세로 패스(코스), 주간 XP 리그와 5단계 티어(루키~레전드, `constants.ts`), 콤보 기반 퀴즈 포인트, 8시간마다 리셋되는 미션 5종, 배지가 반복 방문을 유도하는 장치다.
- **재설치 시 학습 기록 유실**: 기존에는 `guest_token`(로컬 저장)만으로 유저를 식별해 재설치·기기 변경 시 진행도가 끊기는 문제가 있었다(`docs/RELEASE_NOTES.md` 2026-07-22 항목). `useAuth.tsx`가 토스 `getAnonymousKey()` 해시를 `resolve_profile_by_toss_key` RPC로 서버 조회/승격시켜, 재설치해도 같은 프로필로 복구되도록 되어 있다.

## 핵심 기능

- **카드 학습 + 퀴즈 + 간격반복 복습**: `WordCardScreen`(뜻/상세설명/뉴스 예시/연관 단어 슬라이드), `QuizScreen`(4지선다, 콤보 보너스), `ReviewScreen`(주관식 + 초성 힌트, SM-2 기반 출제)이 하나의 학습 사이클로 이어진다.
- **리그**: 주간 XP 랭킹(월요일 00:00 KST 초기화, `leaderboard_top`/`my_league_rank`). 티어는 `getGrowthStage(xp)`로 누적 XP에서 계산한다. XP는 학습 행동(새 단어 1 · 퀴즈 정답 2 · 출석 3 · 미션 수령 5)으로만 쌓이고, 포인트는 부스트 구매용 소모 재화다.
- **데일리 미션 + 출석**: 앱 진입 시 자동 출석 체크(`checkIn`), 퀴즈 정답 3회 미션(m3)을 채우면 `claimReward`로 포인트를 수령한다.

## 기술적으로 신경 쓴 부분

- **서버 권위 채점**: 포인트/콤보/미션 진행도를 클라이언트가 아니라 Postgres RPC(`submit_quiz_answer`, `claim_mission_reward`, `checkin`)가 계산·기록한다. `profiles` 테이블은 anon에 `UPDATE (nickname, emoji)`만 부여해(`supabase/schema.sql`) 클라이언트가 포인트를 직접 조작할 수 없게 막는다. RPC 정의 SQL(`migration_points_integrity.sql`)은 DB 적용 후 저장소에서 제거됐다(72bef94).
- **게스트 인증 + 재설치 복구**: `guest_token`을 요청 헤더(`x-guest-token`)로 실어 RLS를 통과시키는 게스트 클라이언트(`getGuestClient`, `src/lib/supabase.ts`)와, 토스 익명 키로 같은 프로필을 복구하는 `resolve_profile_by_toss_key` RPC(`useAuth.tsx`)를 함께 쓴다. 브라우저 dev 환경처럼 토스 브릿지가 없으면 기존 게스트 생성 경로로 자동 폴백한다.
- **상태관리**: 별도 상태관리 라이브러리 없이 React Context 2개(`AppContext`, `AuthProvider`)로 구성했다. `profileIdRef`, `dbRef`를 `useRef`에 캐싱해 재렌더 없이 최신 프로필/DB 클라이언트를 참조하고, `word_progress` 저장은 `useDebouncedEffect`로 2초 디바운스한다.
- **iOS WebView 대응**: iOS WKWebView(토스 앱)에서 Web Locks API가 `Lock was stolen` AbortError를 던지는 문제를 no-op lock으로 우회한다(`src/lib/supabase.ts:11-17`).
- **외부 API 프록시 + 프리페치**: 네이버 뉴스·한국은행 ECOS API 키를 클라이언트에 노출하지 않도록 Supabase Edge Function(`naver-news`, `ecos-series`)을 경유한다. `useNews.ts`는 현재 단어를 세션 캐시 우선 조회하고 다음 단어는 미리 fetch해둔다. `ecos-series`는 단어 설명 그래프(`WordVisuals.tsx`)에 쓰이며, 통계 하나가 실패하면 해당 카드만 숨긴다.
- **딥링크 랜딩 분기**: `App.tsx`의 `resolveLandingTarget`이 `getSchemeUri()`를 `parseLandingPath`(`src/lib/landing.ts`)로 파싱해 초기 라우트를 정하고, 유입 경로를 `logClick('entry', { referrer, target })`로 기록한다.
- **단위 테스트**: `vitest`로 퀴즈 포인트·보기 생성(`src/pages/QuizScreen.test.ts`), 정답 판정·배지·리그·스트릭·닉네임·코스 경로(`src/lib/*.test.ts`), 이해 확인 화면(`LessonCheckScreen.test.tsx`), 뉴스·알림 동의 훅(`src/hooks/*.test.*`)을 검증한다.

## 스택

`package.json` 기준.

- **프레임워크/언어**: React 18.3, TypeScript 5.9, Vite 8
- **라우팅**: React Router DOM 7
- **스타일**: Tailwind CSS 4 (`@tailwindcss/vite`)
- **UI 컴포넌트**: `@toss/tds-mobile`, `@toss/tds-mobile-ait` (Toss Design System), `lucide-react` (아이콘)
- **백엔드**: Supabase (`@supabase/supabase-js`) - DB, RPC, Edge Functions
- **플랫폼 프레임워크**: `@apps-in-toss/web-framework` (Apps in Toss)
- **모니터링**: `@sentry/react`
- **기타**: `sonner`(토스트)
- **테스트**: Vitest, Testing Library(jest-dom), jsdom
- **린트**: ESLint 9 + typescript-eslint

## 로컬 실행 방법

```bash
npm install
cp .env.example .env
npm run dev
```

`.env.example` 기준 필요한 값:

| 변수명 | 필수 여부 | 비고 |
|--------|-----------|------|
| `VITE_SUPABASE_URL` | 필수 | 없으면 `src/lib/supabase.ts`에서 즉시 예외 발생 |
| `VITE_SUPABASE_ANON_KEY` | 필수 | 위와 동일 |
| `VITE_SENTRY_DSN` | 선택 | `src/main.tsx`에서 `PROD` 빌드일 때만 Sentry 활성화 |
| `VITE_REWARDED_AD_GROUP_ID` | 선택 | 리워드 광고 그룹 ID(`src/lib/ads.ts`). 없으면 광고 기능 숨김 |
| `VITE_PROMOTION_CODE` | 선택 | 토스 프로모션 코드(`src/lib/promotion.ts`). 없으면 첫 학습 보상 숨김 |
| `VITE_SHARE_REWARD_MODULE_ID` | 미사용 | 공유 리워드 연동 제거(a762db6) 후 코드에서 참조하지 않음 |

값 출처: TODO: 확인 필요 (Supabase 프로젝트 발급 방식/대상은 코드에 없음).

기타 스크립트:

```bash
npm run build      # vite build && ait build
npm run preview    # vite preview
npm run deploy     # ait deploy
npm run lint       # eslint .
npm run test       # vitest run
npm run test:watch # vitest
```
