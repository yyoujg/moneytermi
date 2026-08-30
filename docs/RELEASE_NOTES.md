## 릴리즈 날짜 대장 (코호트 분석 기준 — 커밋일/생성일 아님)

> 코호트·리텐션 분석은 반드시 이 표의 **기능 도달일**을 D0 기준으로 쓴다.
> 콘솔 '생성일시'(커밋 근처)나 개별 노트 날짜(커밋일)를 기준으로 쓰지 말 것.
> 07-15 "0% D1" 오류의 원인이 이 혼동이었다.

| 번들 | 콘솔 출시일시 (KST) | 기능 도달일(D0 기준) | 주요 기능 |
|------|--------------------|--------------------|-----------|
| 20260829-117 | 2026-08-29 16:15 | 2026-08-29 | 신규 게스트 진입 차단 버그 수정, 친구 초대 공유 리워드 |
| 20260801-116 | 2026-08-06 16:48 | 2026-08-06 | acquisition_channel 컬럼, referrer 파싱 (07-30 113~115 검토취소·재시도 후 최종 출시) |
| 20260722-111 | 2026-07-30 10:23 | 2026-07-30 | toss_anonymous_key, profiles 컬럼 GRANT 보안픽스 |
| 20260714-110 | 2026-07-16 15:12 | 2026-07-16 | 자동출석·신규 강제 CTA·푸시동의 퍼널 앞단 |
| 20260626-106 | 2026-06-29 10:58 | 2026-06-29 | 디자인 토큰화·다크테마 보정·UX 폴리시 |
| 20260626-97  | 2026-06-26 15:09 | 2026-06-26 | SRS(SM-2 lite)·실천 레이어·코스 정렬 |
| 20260623-96  | 2026-06-25 13:52 | 2026-06-25 | (6/26 빌드군 중간 배포) |
| 20260620-95  | 2026-06-22 11:22 | 2026-06-22 | 데일리 푸시 발송코드 정정 |
| 20260617-94  | 2026-06-17 11:27 | 2026-06-17 | 리그 공유·전면 다크테마 |
| 20260616-93  | 2026-06-16 16:56 | 2026-06-16 | RPC 서버채점·푸시동의·딥링크수정·Analytics·다크모드선언 |
| 20260616-92  | 2026-06-26 18:26 | — (제외) | 93의 부분집합 재출시. 기능 도달일 아님, 코호트 분석 제외 |
| 20260601-90  | 2026-06-01 12:56 | 2026-06-01 | (5월 스파이크 이후 첫 빌드) |
| 20260406-76  | 2026-04-07 19:06 | 2026-04-07 | 초기 빌드 (SDK 2.0.5). 04-07~06-01 약 8주 출시 공백 |

### 코호트 해석 시 주의
- **5월 스파이크 코호트**: 유저가 겪은 빌드는 20260406-76 단 하나. 자동출석·SRS·신규CTA·푸시 전무 → 낮은 재방문은 빌드 한계이지 콘텐츠·채널 문제 아님.
- **RPC 서버채점 도달 = 06-16**(93). 92의 06-26 출시는 무시.
- **리텐션 개선 실측 시작점 = 07-16**(110, 자동출석·신규CTA). 그 이전 코호트와 직접 비교 금지.

# 출시 노트 (개발자용)

moneytermi 개발자용 변경 이력. 사용자 노출 문구가 아닌 기술 변경 요약이며,
각 항목에 의도와 주요 변경 파일을 함께 적는다.

## 헤더 형식 — 커밋일 ≠ 출시일

`## <커밋일> 커밋 / <출시일시> 출시 (번들 <번들ID>)`

**앱인토스 검수 리드타임이 1~3일이라 커밋일과 실제 라이브 시점이 다르다.** 코호트 분석은
반드시 **출시일시** 기준으로 해야 한다. 커밋일로 코호트를 자르면 개선 전 빌드를 받은 유저가
개선 후 코호트에 섞인다.

실측 리드타임:

| 번들 | 생성 | 출시 | 지연 |
|------|------|------|------|
| `20260626-106` | 06-26 19:07 | 06-29 10:58 | 2일 16시간 |
| `20260714-110` | 07-14 21:52 | 07-16 15:12 | 1일 17시간 |
| `20260829-117` | 08-29 15:44 | 08-29 16:15 | 31분 (이례적으로 빠름) |

> **운영 규칙**: 검수 2~3일 지연이 구조적이다. 유입 스파이크가 예상되면 **역산해 최소 3영업일
> 전에 배포를 제출**한다. 07-15(최대 코호트)가 개선 전 빌드를 받은 것이 이 규칙이 없어서였다.

> **TODO**: 06-20 / 06-17 / 06-16 항목의 실제 출시일은 미확인이다.
> 앱인토스 콘솔 → 버전 내역 2~8페이지에서 확인해 채울 것.

---

## 2026-08-29 커밋 / 2026-08-29 16:15 출시 (번들 20260829-117, PR #27) — 신규 진입 버그 수정 + 친구 초대 리워드

콘솔 생성일시 2026-08-29 15:44 (SDK 2.6.1) → 16:15 출시. 생성~출시 31분으로 기존 리드타임(1~3일)보다
이례적으로 빠르다 — 소규모 변경이라 우선순위 검수였을 가능성, 확정은 아님.

### 토스 콘솔 출시노트 (사용자 노출용 — 아래 평문 그대로 등록)

```
이번 업데이트 주요 내용

[친구 초대하고 포인트 받기]
토스 친구를 초대하면 포인트를 받을 수 있어요. 리그 화면에서 초대해보세요.

[더 안정적인 시작 화면]
앱을 처음 시작할 때 불안정하던 부분을 고쳤어요.
```

### 🐛 버그 수정 — 신규 게스트 진입 전체 차단

`word_progress_own`/`daily_missions_own`/`attendance_own` RLS 정책이 `profiles.guest_token`을
직접 서브쿼리하는데, 이전 `migration_profiles_grants.sql`이 anon의 `profiles` SELECT를
9개 컬럼(guest_token·auth_id 제외)으로 좁히면서 이 서브쿼리가 permission denied로 깨졌다.
신규 게스트가 앱 진입 시 스플래시에서 멈추는 심각도 높은 버그였다(기존 게스트는 로컬에 저장된
프로필로 우회 복원되어 영향 없음 — 그래서 발견이 늦었다).

`current_profile_id()`(SECURITY DEFINER, `migration_points_integrity.sql`에서 이미
같은 문제 해결용으로 도입돼 있었으나 이 세 정책만 반영이 안 돼 있었다) 를 쓰도록 세 정책을 교체.

변경 파일: `supabase/migration_fix_rls_profiles_permission.sql`(신규, 운영 DB 수동 실행 필요)

### 🎁 친구 초대 공유 리워드

앱인토스 SDK `contactsViral`(친구초대) 연동. 콘솔 "미니앱 > 공유 리워드" 메뉴에서 발급한
moduleId를 env로 주입하며, 미설정 시 기능 자체가 숨겨진다(`VITE_SHARE_REWARD_MODULE_ID`).

리워드 지급은 콘솔이 아니라 파트너(우리) 책임이라, 서버 RPC `claim_referral_reward`가
1회 최대 50P·일일 합계 최대 200P로 클램프한 뒤 적립한다 — `sendViral` 이벤트에 중복 지급
방지용 고유 키가 없어서 둔 방어용 상한이다. 콘솔의 친구별 "보냄" 상태 자체가 1차 중복 방지 역할을
하므로, 이 클램프는 2차 안전장치.

변경 파일: `src/lib/referral.ts`(신규), `src/context/AppContext.tsx`(`claimReferralReward`),
`src/pages/LeagueScreen.tsx`(친구 초대 버튼 + 리워드 토스트), `supabase/migration_referral.sql`(신규)

### 기타

- 첫 학습 카드 완료 시점(`activation_first_card`)에 `requestAppReview()` 호출 추가 —
  `src/context/AppContext.tsx`(`toggleKnown`), `src/pages/WordCardScreen.tsx`(`goNext`)
- 앱인토스 콘솔 등록용 앱 정보(부제/상세설명/페르소나/검색 키워드) 초안 — `docs/APP_STORE_LISTING.md`(신규)

---

## 2026-07-22 커밋 / 출시 대기 (번들 20260722-112) — 토스 익명 키로 프로필 식별 (재설치 복구)

의도: 지금까지 사용자 식별은 `guest_token`(localStorage)만 사용해 재설치·기기 변경 시 토큰이
소실되면 새 프로필이 생성돼 학습 진행도(word_progress·attendance·points·리그)가 전부 유실됐다
(APPS_IN_TOSS_TODO A-1). 토스 `getAnonymousKey()` hash(미니앱별 고유·기기 무관)를 프로필에 붙여
식별 키로 써서 재설치해도 같은 프로필로 복구한다. 기존 사용자는 첫 실행 시 저장된 게스트 프로필에
키가 붙어 승격되므로 유실 없음. 토스 로그인(`appLogin`)은 범위 밖(A-1 유지).

주요 변경:
- DB: `profiles.toss_anonymous_key TEXT UNIQUE` + `resolve_profile_by_toss_key(p_toss_key, p_guest_token)`
  RPC(SECURITY DEFINER, 조회/승격/생성). `supabase/migration_toss_anonymous_key.sql`(수동 실행),
  `supabase/schema.sql`, 검증용 `supabase/test_resolve_profile.sql`.
- 클라: `src/hooks/useAuth.tsx` `initAuth()` — 토스 키 조회 → 저장 키 일치 시 즉시 복원, 아니면 RPC로
  조회/승격/스위칭, 키 없음(브라우저/구버전)·RPC 실패 시 기존 게스트 경로로 폴백. `src/lib/database.types.ts`.

⚠️ 코호트 주의: 이 변경 전엔 재설치 = 새 프로필 = 신규 유저로 집계됐고, 이후엔 재설치가 동일 프로필로
합쳐진다. 코호트 기준선이 배포일에서 끊기므로 배포 전/후를 섞어 분석하지 말 것.
**배포 시 실제 프로덕션 반영 시각(마이그레이션 적용 + 코드 배포 완료 시점)을 분 단위로 여기에 기입할 것.**

---

## 2026-07-22 커밋 / 출시 대기 (번들 20260722-112) — 저장소 public 전환 준비 / profiles 권한 정리

사용자 노출 변경 없음. 저장소를 public으로 돌리기 전 점검에서 나온 항목들.

### 민감정보 정리

하드코딩된 시크릿은 없었다(`.env` 커밋 이력 없음, Edge Function 전부 `Deno.env.get`,
CI는 GitHub Secrets). `.gitignore` 규칙이 추가되기 *전에* 커밋되어 계속 추적 중이던 파일을 해제.

- `supabase/.temp/` — `pooler-url`(DB 호스트+유저명, 비밀번호 없음), `project-ref`
- `.claude/settings.local.json` — 로컬 절대경로, 권한 허용 목록
- `moneytermi.ait` — 4.3MB 빌드 산출물(자격증명 미포함 확인). `.gitignore` 추가
- `granite.config.ts` — 홈 LAN IP 하드코딩 → `process.env.AIT_DEV_HOST ?? '0.0.0.0'`
- `.env.example` 추가, README에 Edge Function 측 env 설정 위치 명시

git 이력은 재작성하지 않았다. project ref는 `VITE_SUPABASE_URL`로 클라이언트 번들에
인라인되는 설계상 공개 값이고 비밀번호가 없어 실질 위험이 낮다.

### profiles 권한 구멍 2건 (migration_profiles_grants.sql — 운영 DB 수동 실행 필요)

`migration_points_integrity.sql`이 UPDATE만 컬럼 단위로 좁히고 INSERT/SELECT는
테이블 전체 권한을 남겨둔 것이 원인.

- **INSERT** — `WITH CHECK (true)` + 테이블 INSERT 권한이라 anon key만으로
  `points`/`league_tier`를 지정한 프로필 생성이 가능했다(리그 랭킹 즉시 1위).
  → `guest_token`만 컬럼 GRANT + 정책 `WITH CHECK` 강화
- **SELECT** — `migration_league_rls.sql`이 랭킹 표시용으로 정책을 `USING (true)`로 열면서
  `guest_token`까지 전체 공개됐다. `guest_token`은 `x-guest-token` 헤더로 쓰이는
  인증 자격증명이라 조회한 토큰으로 임의 사용자를 가장할 수 있었다.
  → 비민감 컬럼 9개만 GRANT (`guest_token`/`auth_id`/`email` 제외)

앱 레이어 필터링은 방어가 되지 않는다(anon key로 PostgREST 직접 호출 가능).

변경 파일: `supabase/migration_profiles_grants.sql`(신규), `supabase/schema.sql`,
`src/hooks/useAuth.tsx`(게스트 생성 `select()` → 컬럼 명시), `docs/DATA_STRUCTURE.md` §2.4

---

## 2026-07-14 커밋 / 2026-07-16 15:12 출시 (번들 20260714-110) — 신규 유저 활성화 / 재방문 트리거

판정 근거: 신규 유입은 홈에서 46%가 아무것도 안 하고 이탈(빈 성적표), 출석 발견율 2.6%,
푸시 동의 모수 상한 27%(완주 시점에만 노출). 기술 버그·콘텐츠 문제는 아님 → 입구(홈)와
재방문 트리거를 손봄.

### 토스 콘솔 출시노트 (사용자 노출용 — 아래 평문 그대로 등록)

```
이번 업데이트 주요 내용

[처음 오면 바로 학습부터]
앱을 처음 켜면 복잡한 숫자 대신 "단어 1개만 배워볼까요?" 한 번만 눌러 바로 첫 단어 학습을 시작할 수 있어요.

[출석은 자동으로]
앱을 열기만 하면 오늘 출석이 자동으로 체크돼요. 매일 들어오는 것만으로 출석이 쌓여요.

[매일 알림 받기 안내]
학습을 마치면 매일 09:00 오늘의 경제 용어를 알림으로 받아볼지 물어봐요. 켜두면 잊지 않고 이어갈 수 있어요.
```

### 기능

- **앱 진입 시 자동 출석 체크** (`ddd8c33`)
  - `ready && profileId` 확보 후 오늘 미출석이면 기존 `checkIn()` 1회 자동 호출.
    `checkin` RPC는 idempotent(attendance UNIQUE·m1 upsert)이고 포인트 미지급이라 무결성 리스크 0.
    출석 발견율 2.6% → m1 미션 루프 진입 회복. (`src/context/AppContext.tsx`)

- **신규 유저 홈 = 강제 첫 학습 CTA** (`ddd8c33`)
  - `knownWords.length === 0`이면 빈 통계 행(포인트0/출석0/단어0)·주간 바 차트를 숨기고
    상단 CTA 문구를 "단어 1개만 배워볼까요?"로 전환 → `/word-card` autoAdvance 직행.
    46% 홈 이탈(단일 최대 누수) 대응. (`src/pages/HomeScreen.tsx`)

- **첫 카드 완료 = 활성화 마일스톤 이벤트** (`ddd8c33`)
  - `knownWords` 0→1 유저 액션 시점에 `logClick('activation_first_card')`. 완료 경로가 둘이라
    autoAdvance `goNext`와 `toggleKnown` else 분기 양쪽에 `length===0` 가드. hydration 오발화를
    피하려 effect 대신 액션 시점 계측. 위 홈 개선 효과 측정 지표.
    (`src/pages/WordCardScreen.tsx`, `src/context/AppContext.tsx`)

- **푸시 동의 노출을 퍼널 앞단으로** (`68cf44c`)
  - `DailyAlarmPromptCard`가 퀴즈/복습 완료(완주율 27%)에만 있어 동의 모수 상한이 27%로
    막혀 있었음. autoAdvance 코스 완료 화면에도 노출해 학습 완주자 전원으로 확장.
    컴포넌트 전역 `SEEN_KEY` 게이팅으로 기존 위치와 이중 노출 없음(먼저 뜨는 화면이 이김).
    (`src/pages/WordCardScreen.tsx`)

### 수정 (배포 전 검증)

- **날짜 KST 통일** (`aa11580`)
  - `toDateStr`가 `toISOString()`(UTC) 기반이라 00:00~09:00 KST 구간에서 하루 밀림
    (예: 07-14 08:00 KST = 07-13 23:00 UTC). 아침 자동 출석이 전날로 기록돼 P0-1이 훼손되던
    문제. 공유 `src/lib/date.ts`(+9h) 신설, 흩어져 있던 `toISOString().slice(0,10)` 5곳
    (`AppContext`·`HomeScreen` streak·`WeeklyBarChart`·`AttendanceCalendar`·`srs.addDays`)을
    일괄 교체해 출석 write/read·streak·SRS due 비교가 같은 규칙을 쓰도록 함.

- **신규 판정 hydration 게이트** (`aa11580`)
  - `ready` 직후 `knownWords` 하이드레이션(effect [allWords, ready]) 전 프레임에서 재방문
    유저에게 신규 CTA가 한 번 번쩍이던 문제. `hydrated` 플래그를 추가해
    `isNewUser = hydrated && knownWords.length + unknownWords.length === 0`로 판정.
    (`src/context/AppContext.tsx`, `src/pages/HomeScreen.tsx`)

- **활성화 퍼널 계측 추가** (`aa11580`)
  - 개선 여부 판정용 이벤트 4종: `checkin_auto`(자동 출석), `home_cta_click`(신규 CTA),
    `notification_prompt_view`/`notification_agree`(동의 카드 노출·수락).
    `activation_first_card`는 기존.

### 정리

- **Vercel 설정 제거** (`7108cc5`)
  - `vercel.json`·`.vercel/`·`.gitignore` `.vercel` 항목 삭제. 코드 import·의존성·lockfile·CI
    참조 없는 죽은 설정. 라이브 배포는 Apps in Toss(`ait`)+Supabase로 무관.

### 활성화 퍼널 2차 (C-1~C-5)

- **SRS 첫 due_date 시딩** (`769d860`)
  - 기존엔 학습 시 `status`만 upsert라 `due_date`가 DB 기본값(오늘)으로 채워져, 모든 학습
    단어가 복습 전인데 즉시·영구히 복습 큐에 쏟아지던 문제. `wpRows`에 없는 첫 학습 단어만
    `{ ease:2.5, interval_d:1, reps:0, due_date:내일 }`로 시드(`seedInitialSrs`). known/unknown
    둘 다 +1일. 신규 유저가 D1에 "오늘 복습할 단어" 카드를 보게 됨. (`src/context/AppContext.tsx`)

- **신규 CTA 단어 1개 로드 → 동의 카드 앞당김** (`769d860`)
  - 신규 CTA가 코스 전체 대신 `nextCourse.words[0]`(sort_order 1 코스 position 1 단어) 1개만
    autoAdvance 로드. 1카드 학습 직후 기존 완료 화면의 `DailyAlarmPromptCard`에 즉시 도달 →
    코스 완주(27%)를 기다리지 않고 동의 노출. 첫 단어도 결정적으로 고정(쉬운 단어).
    (`src/pages/HomeScreen.tsx`)

- **자동 출석 세션 래치** (`769d860`)
  - `autoCheckedRef`로 StrictMode 이중 실행 시 `checkin_auto` 이벤트 중복 로깅 방지(RPC는
    idempotent라 데이터는 원래 안전). (`src/context/AppContext.tsx`)

- **문서 코드 정합성 정정** (`12d7c1f`)
  - `APP_INTRO` HashRouter→BrowserRouter, `DATA_STRUCTURE` SRS·실천 예정→배포됨 및 발송코드
    `moneytermi-DAILY_TERM_PUSH2`, `DAILY_TERM_PUSH` 동의 노출 위치 구현 반영,
    `APPS_IN_TOSS_TODO` E-1 '푸시→토스로그인 필요' 모순 정정, `README` 실천/다크모드/SRS,
    `schema.sql` word_progress SRS 컬럼 반영.

---

## 2026-06-26 커밋 / 2026-06-29 10:58 출시 (번들 20260626-106) — 디자인 토큰화 / 다크테마 보정 / UX 폴리시

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

- **radius 토큰화 + 버튼/입력 pill** (`ff82a1c`)
  - `@theme`에 `--radius-card`(16)·`--radius-button`(pill)·`--radius-chip`(12) 정의. `rounded-2xl`→`rounded-card`,
    `rounded-xl`→`rounded-chip` 전면 치환. BUTTON/INPUT 25곳을 `rounded-button`(pill)으로 — 둥근 nav와 톤 일치.
    `rounded-full`(원형·진행바·점)·`rounded-t*`는 유지.

- **카드 등 컴포넌트화 + 세로 간격 통일** (`ff82a1c`, `62c2ee2`)
  - 신규 `src/components/ui/`의 `Card`(tone card/surface · pad none/sm/md/lg)·`IconBox`·`StatCard`로 반복 마크업 단일화.
  - **전 화면 적용**: 모든 card/surface 카드 표면을 `<Card>`로 교체(Home·MyPage·Course·League·Review·Quiz·WordCard·
    CourseWordList·LeagueRules·Actions·SettingsSheet·NicknameSheet·DailyAlarm·AttendanceCalendar). 홈 통계 3종 `<StatCard>`,
    아이콘 홀더 `<IconBox>`. 읽기 카드는 `pad="none"`으로 기존 `px-5` 보존, 대칭 패딩은 md/lg 변형으로 통일.
    버튼형 카드(학습 알림·실천하기)는 `<button>` 의미 유지 위해 제외.
  - 세로 리듬 규칙: 최상위 블록·카드 16px(mb-4/gap-4), 섹션 헤더→내용 12px(mb-3). Home·MyPage·Review·Actions의
    이탈값(`mb-5`=20px, `p-6`=24px 등) 정리.

### UX

- **다크 모드 보정** (`b3a4851`, `1693847`)
  - 하단 NavBar 알약에 `border-[var(--color-line)]` 추가 — 다크 캔버스에서 그림자만으로 안 보이던
    가장자리를 토큰 보더로 구분. (`NavBar.tsx`)
  - **TDS 바텀시트 다크 미적용 해결**: TDS 시트 배경은 OS `prefers-color-scheme` 기준 `var(--adaptiveBackground)`
    계열 변수에서 와서, 수동 다크(OS 라이트) 시 패널이 흰색으로 남던 문제. 컨텍스트 기반 시도(provider
    `colorScheme` prop, `ColorSchemeArea`)는 시트 패널에 미반영 → **`index.css` `.dark`에서 TDS adaptive 표면
    변수 9종(`--adaptiveBackground`/`Float`/`Layered`/`Level01/02/B01`/`GreyBackground`/`CardBgWhite/Grey`)을
    `var(--color-card/surface)`로 `!important` 오버라이드**(`<html>.dark`라 body 포털까지 상속). 시트 헤더 5종은
    TDS 기본 텍스트라 `color: var(--color-ink)` 명시. `useTheme.isDark`+`ColorSchemeArea`는 Switch 등 컨텍스트
    컴포넌트용으로 유지. (`index.css`, 5개 Sheet, `useTheme.tsx`, `main.tsx`)
- **화면 폴리시** (`17baa25`, `d237bd3`, `bf2ccd0`, `1693847`)
  - 홈 복습 카드 `<button>`(블록 중첩 오버플로)→`<div role="button">` 코스카드 패턴으로 겹침 수정.
  - 홈/실천 하단 여백(`pb-32`), 실천 섹션 헤더↔항목 간격(margin 미반영 대비 flex-gap), 퀴즈/복습 뜻↔설명 간격 보강.
  - NavBar 6탭 간격, 실천 화면 접근성(aria-label·탭 타깃), 복습 진입 흰 깜빡임 제거.

### 문서

- `GuideSheet`(앱 사용법 FAQ) 갱신: 복습 간격반복·실천 탭·다크 모드 항목 추가, stale 문구 정리.

---

## 2026-06-26 커밋 / 2026-06-29 10:58 출시 (번들 20260626-106) — SRS 복습 / 실천 레이어 / 코스 정렬

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

## 2026-06-20 커밋 / 출시일 미확인 (콘솔 확인 필요) — 데일리 푸시 발송 코드 정정

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

## 2026-06-17 커밋 / 출시일 미확인 (콘솔 확인 필요) — 공유 / 전면 다크 테마 빌드

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

## 2026-06-16 커밋 / 출시일 미확인 (콘솔 확인 필요) — 분석 / 다크모드 후속 빌드

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

## 2026-06-16 커밋 / 출시일 미확인 (콘솔 확인 필요) — Apps in Toss 출시 준비 빌드

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
