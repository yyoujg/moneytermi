# 데이터 구조 (Data Structure)

머니터미(moneytermi)의 데이터 모델과 저장/동기화 흐름을 한곳에 정리한 문서.

> **최종 갱신 2026-07-14**
> - 실행 완료: `courses.sort_order` 추가(학습 순서 제어), 콘텐츠 시드 확장(`words` 총 233개·id 최대 2025), `related_words` 데이터 정합성 정리, **SRS 간격반복(`word_progress` 확장)·실천 레이어(`actions`/`user_actions`) 배포**, 자동 출석·신규 홈 첫 학습 CTA·날짜 KST 통일.
> - 예정(미실행): 시장지표(`market_indicators`). → §8 로드맵 참고.

## 1. 개요

데이터는 3개 계층에 나뉘어 존재한다.

```
localStorage / 토스앱 Storage   React AppContext           Supabase (PostgreSQL)
(클라이언트 영속)                (런타임 상태)              (서버 영속)
- moneytermi_auth         <->   profileId, guestToken  <->  profiles
- setting_notification...        points, knownWords...       word_progress
                                 missions, attendance...     daily_missions
                                                             attendance
                                 courses, allWords      <--  words / courses / course_words (읽기 전용)
```

- 사용자 식별: 최초 방문 시 게스트 프로필을 생성하고 `guest_token`(UUID)을 localStorage에 저장한다. 이후 모든 서버 접근은 이 토큰을 `x-guest-token` 헤더로 보내 RLS로 본인 행만 접근한다.
- 콘텐츠(용어/코스)는 공개 읽기 전용 테이블이며 앱 시작 시 한 번 로드한다.
- 학습 상태(`word_progress`, known/unknown)는 상태 변경 시 디바운스되어 Supabase에 upsert된다.
- 포인트·콤보·미션 진행도·출석은 클라이언트가 직접 쓰지 않는다. SECURITY DEFINER RPC가 서버에서 정답·자격을 검증하고 적립하는 단일 진실원(§2.4, §5.2 참고). 클라의 `points`/`missions` 상태는 RPC 응답·초기 로드로 갱신되는 read-model이다.

## 2. Supabase 스키마

출처: `supabase/schema.sql`, `supabase/migration_content_tables.sql`, `supabase/migration_points_integrity.sql`, `supabase/migration_push_subscriptions.sql`, 타입: `src/lib/database.types.ts`

### 2.1 사용자 데이터 테이블

#### profiles
사용자 프로필. 게스트/로그인 공통.

| 컬럼 | 타입 | 제약 / 기본값 | 의미 |
|------|------|--------------|------|
| id | UUID | PK, default gen_random_uuid() | 프로필 ID |
| guest_token | UUID | UNIQUE NOT NULL, default gen_random_uuid() | 게스트 식별용 토큰 (localStorage 저장) |
| auth_id | UUID | UNIQUE, FK -> auth.users(id) ON DELETE SET NULL | Supabase Auth UID (이메일 연동 시 채워짐) |
| nickname | TEXT | NOT NULL, default '예비슈퍼개미' | 닉네임 |
| email | TEXT | UNIQUE | 이메일 |
| is_guest | BOOLEAN | NOT NULL, default true | 게스트 여부 |
| league_tier | TEXT | NOT NULL, default 'bronze', CHECK in (bronze,silver,gold,platinum,diamond) | 리그 티어 |
| points | INTEGER | NOT NULL, default 0, CHECK >= 0 | 포인트 (서버 RPC만 갱신) |
| quiz_combo | INTEGER | NOT NULL, default 0, CHECK >= 0 | 서버 채점용 연속 정답(콤보) 상태 |
| emoji | TEXT | NOT NULL, default 'orange' | 프로필 이모지 |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | 생성 시각 |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | 수정 시각 (트리거 자동 갱신) |

#### word_progress
용어별 학습 상태. `(user_id, word_id)` 단위로 유일.

| 컬럼 | 타입 | 제약 | 의미 |
|------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | NOT NULL, FK -> profiles(id) ON DELETE CASCADE | 사용자 |
| word_id | INTEGER | NOT NULL | 용어 ID |
| status | TEXT | NOT NULL, CHECK in (known, unknown) | 아는 단어 / 모르는 단어 |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | 수정 시각 (트리거 자동 갱신) |
| | | UNIQUE (user_id, word_id) | |

> **배포됨** SRS(간격반복) 필드 — `ease`·`interval_d`·`reps`·`due_date`·`last_grade`. 라이브 DB에 존재(`src/lib/database.types.ts` 기준). 첫 학습 시 `due_date`는 +1일로 시드하고, 복습 채점(`recordReview`)이 SM-2 lite로 갱신. §8.1 참고.

#### daily_missions
일별 미션 진행도. `(user_id, mission_id, date)` 단위로 유일.

| 컬럼 | 타입 | 제약 | 의미 |
|------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | NOT NULL, FK -> profiles(id) ON DELETE CASCADE | 사용자 |
| mission_id | TEXT | NOT NULL, CHECK in (m1, m2, m3) | 미션 ID (앱은 m1, m3만 사용) |
| date | DATE | NOT NULL, default CURRENT_DATE | 미션 날짜 |
| current | INTEGER | NOT NULL, default 0, CHECK >= 0 | 현재 진행도 |
| is_rewarded | BOOLEAN | NOT NULL, default false | 보상 수령 여부 |
| | | UNIQUE (user_id, mission_id, date) | |

#### attendance
출석 기록. `(user_id, date)` 단위로 유일.

| 컬럼 | 타입 | 제약 | 의미 |
|------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | NOT NULL, FK -> profiles(id) ON DELETE CASCADE | 사용자 |
| date | DATE | NOT NULL, default CURRENT_DATE | 출석 날짜 |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | 생성 시각 |
| | | UNIQUE (user_id, date) | |

### 2.2 콘텐츠 테이블 (공개 읽기 전용)

모두 `public_read` RLS 정책(SELECT USING true)이 적용된다.

> **콘텐츠 시드 확장 (실행 완료, 2026-06)** — 재테크 실전 개념 시드 2종을 적재했다. `words` 총 233개(id 최소 1·최대 2025). id 대역: 기존 한국은행 경제용어 사전(1~170대) + 시드 1탄 절세·ETF·배당·시장·연금·공모주(1001~1038) + 시드 2탄 청년정책금융·통장관리·청약·매매(2001~2025). 시드 파일: `moneytermi_seed_finance_concepts.sql`, `moneytermi_seed_policy_housing.sql`.

#### words
경제 용어 사전.

| 컬럼 | 타입 | 제약 | 의미 |
|------|------|------|------|
| id | INTEGER | PK | 용어 ID |
| word | TEXT | NOT NULL | 용어명 |
| meaning | TEXT | NOT NULL | 한 줄 의미 |
| detailed_meaning | TEXT | NOT NULL | 상세 설명 |
| news_example | TEXT | NOT NULL | 뉴스 예문 |
| hint | TEXT | NOT NULL | 초성 힌트 |
| related_words | TEXT[] | default '{}' | 관련 용어 배열 |

> **related_words 데이터 정합성 (정리 완료, 2026-06)**
> - 기존 사전(id 1~170)의 `related_words` 원소에 literal 큰따옴표(`"용어명"`)가 박혀 있던 문제를 `trim(both '"' ...)`으로 일괄 제거했다.
> - 시드 1·2탄의 dangling 참조 3건(`분리과세`·`퇴직연금`·`우대형`)을 `array_remove`로 정리했다.
> - **잔여 dangling**: 한은 사전이 수록하지 않은 용어(역선택·예금보험제도·공매도 등 약 60종)를 참조하는 행이 남아 있다. 데이터 손상이 아니라 **콘텐츠 커버리지 공백**이다. 대응 방침 = 앱 렌더에서 존재 용어만 필터(아래), DB는 무손상 유지(누락 용어 추가 시 링크 자동 복구).
>   ```ts
>   const validRelated = (word.relatedWords ?? [])
>     .filter(rw => allWords.some(w => w.word === rw));
>   ```

#### courses
학습 코스.

| 컬럼 | 타입 | 제약 / 기본값 | 의미 |
|------|------|--------------|------|
| id | TEXT | PK | 코스 ID (예: bok_1) |
| level | TEXT | NOT NULL | 난이도 레벨 (예: Lv.1) |
| title | TEXT | NOT NULL | 코스 제목 |
| description | TEXT | NOT NULL | 코스 설명 |
| category | TEXT | NOT NULL | 카테고리 (경제일반/거시경제/금융/주식·기업/경제 등) |
| **sort_order** | **INTEGER** | **NOT NULL, default 999** | **코스 목록 표시 순서 (학습 권장 경로). 실행 완료 2026-06** |

> **sort_order (실행 완료, 2026-06)** — 기존엔 코스 표시 순서를 담는 컬럼이 없어 암묵 정렬에 의존했다. `ALTER TABLE courses ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 999` 후, "난이도 밴드(Lv.1→4) + 밴드 내 실전 우선" 원칙으로 1~22 부여했다.
> - 조회 시 `.order('sort_order', { ascending: true })` 적용(§5.1).
> - 학습 경로: 통장관리 기초 → 생활경제/경제기초 → 시장·ETF·매매 → 절세·청년정책·배당·공모주·청약·연금 → 채권·환율·기업·경기·거시 → 자본시장·파생·국민소득·통화정책 → 금융제도.
> - `database.types.ts`의 `courses` Row/Insert/Update에 `sort_order` 동기화 필요.

> **코스 수 (해소됨, 2026-07)**: `courses` 조회 결과는 22행이다(bok_* 12 + 시드 10). `APP_INTRO.md`도 "총 22개 코스"로 맞춰 갱신됨(이전 "34개" 표기 정정). bok_* id에 결번(bok_1,3,6,8,12,16,20,23,26,29,32,34)이 있어 과거 통합/삭제 이력으로 보이나 22행이 현재 정상 상태.

#### course_words
코스-용어 연결(다대다) + 순서.

| 컬럼 | 타입 | 제약 | 의미 |
|------|------|------|------|
| course_id | TEXT | FK -> courses(id) ON DELETE CASCADE | 코스 |
| word_id | INTEGER | FK -> words(id) ON DELETE CASCADE | 용어 |
| position | INTEGER | NOT NULL | 코스 내 순서 |
| | | PK (course_id, word_id) | |

#### league_tiers
리그 티어 마스터. 데이터: 1 알개미, 2 뽀시래기, 3 왕개미, 4 전투개미, 5 슈퍼개미.

| 컬럼 | 타입 | 제약 | 의미 |
|------|------|------|------|
| id | INTEGER | PK | 티어 ID |
| name | TEXT | NOT NULL | 티어명 |

### 2.3 뷰

#### league_rankings
`profiles` 기반 랭킹 뷰. 컬럼: id, nickname, emoji, league_tier, points, `rank_in_tier`(티어 내 순위), `rank_overall`(전체 순위). 현재 앱 코드는 이 뷰 대신 `profiles`를 직접 조회한다.

### 2.4 RLS / 권한 요약

- profiles / word_progress / daily_missions / attendance: RLS 활성. `auth_id = auth.uid()` 또는 `guest_token = request.headers ->> 'x-guest-token'` 으로 본인 행 식별.
- profiles INSERT는 최초 게스트 생성을 위해 `WITH CHECK (true)` 허용.
- 콘텐츠 테이블(words/courses/course_words/league_tiers)도 RLS 활성이며 정책은 `public_read`(SELECT)만 — 쓰기 정책이 없어 anon은 읽기만 가능(정답 키 `words` 변조 차단). **`sort_order` 추가는 컬럼 확장이므로 기존 `courses` RLS/정책에 영향 없음.**

#### 포인트 무결성 — 직접 쓰기 차단 (migration_points_integrity.sql)

포인트가 늘어나는 경로를 RPC로만 한정한다.

- profiles: `points` 직접 UPDATE 차단 — `REVOKE UPDATE ON profiles` 후 컬럼 단위로 `emoji`/`nickname`만 GRANT. SELECT·INSERT는 유지.
- daily_missions / attendance: 클라 직접 INSERT/UPDATE/DELETE 차단(SELECT만 GRANT). 쓰기는 RPC가 소유.
- word_progress: 본인 행 INSERT/UPDATE 유지(포인트와 무관한 학습 상태). **SRS 필드 추가 시에도 이 원칙 유지 — 일정 필드는 포인트 무관이라 클라 직접 쓰기 가능.**

#### SECURITY DEFINER 함수 (RPC)

| 함수 | 역할 |
|------|------|
| `current_profile_id()` | 헤더 `x-guest-token` 또는 `auth.uid()`로 호출자 프로필 id 해석(RLS와 동일 로직). 아래 RPC들이 내부에서 호출. |
| `submit_quiz_answer(p_word_id, p_answer, p_mode, p_used_hint, p_session_start)` | 서버가 `words.word`로 정답 판정 후 콤보·포인트·m3 진행도를 갱신. `mode`='mc'(객관식)/'typed'(주관식)별 점수 공식 적용. `{correct, earned, combo, points, m3_current}` json 반환. |
| `claim_mission_reward(p_mission_id, p_date)` | 서버 소유 진행도로 `current >= target AND is_rewarded = false` 검증 후 보상(m1=10, m3=30) 적립. `{points}` 반환. |
| `checkin(p_date)` | 출석 upsert + m1 진행도(current=1) upsert. 포인트는 미지급(보상은 claim으로 통일). |
| `link_guest_to_auth(guest_token, auth_user_id, email)` | 게스트 프로필을 이메일 계정으로 승격. |

> 한계: `guest_token`은 누구나 발급 가능하므로 RPC는 *계정당* 포인트 부풀림만 막고 다계정 농사는 막지 못한다(계정 게이팅은 별도 작업).

### 2.5 미배포 마이그레이션 (push)

`supabase/migration_push_subscriptions.sql` — 직접 API 푸시 발송용 컬럼. 현재 발송은 토스 콘솔 방식이라 미적용(백업).

- `profiles.toss_user_key` BIGINT UNIQUE
- `profiles.notification_agreed` BOOLEAN NOT NULL default false
- 부분 인덱스 `idx_profiles_push_targets` (notification_agreed AND toss_user_key IS NOT NULL)

> 주의: `toss_user_key`(BIGINT)는 토스 로그인 userKey 전용이다. `getAnonymousKey` hash를 담는
> `toss_anonymous_key`(TEXT, `migration_toss_anonymous_key.sql`)와 이름이 비슷하지만 별개 컬럼이다.

(Edge Function `supabase/functions/toss-register-push`, `daily-term-push`에서 이 컬럼들을 참조한다.)

## 3. TypeScript 도메인 타입

출처: `src/types.ts`

```ts
type AuthUser = { id, nickname, email?, isGuest, leagueTier };
type AuthState = { user: AuthUser | null, accessToken, refreshToken, isAuthenticated };

type Word = {
  id: number; word: string; meaning: string;
  detailedMeaning: string; newsExample: string; hint: string;
  difficulty: 1 | 2 | 3; relatedWords?: string[];
};

type Course = { id, level, title, description, category, words: Word[] };
// 예정: sort_order: number 필드 추가 동기화 필요 (DB 반영 완료, 타입 미반영 시 보강)

type Mission  = { id, title, reward, current, target, isRewarded };
type Missions = { m1: Mission; m3: Mission };
```

### DB 컬럼 <-> 앱 타입 매핑 주의점

- snake_case <-> camelCase: `detailed_meaning -> detailedMeaning`, `news_example -> newsExample`, `related_words -> relatedWords` (매핑은 `AppContext.tsx`의 `loadContent`에서 수행).
- `Word.difficulty`는 앱 타입에만 존재. `words` 테이블에는 컬럼이 없고, 현재 `loadContent`도 값을 채우지 않는다(코스 내 정렬 시 `?? 0`으로 처리).
- `courses.sort_order`는 DB에 추가됨(2026-06). `database.types.ts`·`Course` 타입에 `sort_order: number` 동기화 권장.
- `Missions`는 m1, m3만 정의. `daily_missions.mission_id` CHECK는 m2까지 허용하지만 앱은 m2를 사용하지 않는다.
- 기본 미션값 (`AppContext.tsx`): m1 "앱 출석하기"(target 1, reward 10), m3 "퀴즈 정답 3회 맞히기"(target 3, reward 30).

## 4. 클라이언트 상태 (AppContext)

출처: `src/context/AppContext.tsx`, `src/hooks/useAuth.tsx`, `src/lib/storage.ts`

### 4.1 AppContextValue

| 필드 | 타입 | 의미 |
|------|------|------|
| ready | boolean | 초기 로드 완료 여부 |
| hydrated | boolean | word_progress(known/unknown) 하이드레이션 완료 여부. `ready` 직후 아직 knownWords가 안 채워진 프레임에서 신규 유저로 오판하지 않도록 홈 신규 판정에 사용 |
| points / setPoints | number | 포인트 |
| knownWords / setKnownWords | Word[] | 아는 단어 |
| knownIds | Set<number> | knownWords의 ID 집합 (useMemo 파생) |
| unknownWords / setUnknownWords | Word[] | 모르는 단어 |
| missions / setMissions | Missions | 오늘 미션 상태 |
| claimReward | (id) => Promise<void> | 미션 보상 수령 (claim_mission_reward RPC, 서버 검증 후 적립) |
| submitQuizAnswer | (wordId, answer, mode, usedHint, sessionStart) => Promise<{correct,earned,combo,points,m3Current} \| null> | 퀴즈 답안 서버 채점(submit_quiz_answer RPC). 응답으로 points·m3 갱신 |
| toggleKnown | (word) => void | known/unknown 토글 |
| checkIn | () => Promise<void> | 출석 체크 (앱 진입 시 오늘 미출석이면 자동 1회 호출) |
| attendanceDates | string[] | 출석 날짜 (KST YYYY-MM-DD) |
| otherLeagueUsers | LeagueUser[] | 본인 제외 다른 사용자(최대 49명) |
| courses | Course[] | 코스 목록 (sort_order 오름차순 정렬) |
| allWords | Word[] | 전체 용어 |
| myEmoji / updateMyEmoji | string | 내 프로필 이모지 |

```ts
type LeagueUser = { id: string; name: string; points: number; emoji: string };
```

### 4.2 localStorage 키

`Storage` 추상화(`src/lib/storage.ts`)를 통해 접근. 토스앱 환경(`window.ReactNativeWebView` 존재)에서는 `@apps-in-toss/web-framework`의 Storage, 일반 브라우저에서는 `localStorage`를 사용한다.

| 키 | 값 | 위치 |
|----|----|----|
| moneytermi_auth | StoredProfile (JSON) | `useAuth.tsx` (STORAGE_KEY) |
| setting_notification_agreement | 'agreed' \| 'rejected' | `useNotificationAgreement.ts` (KEY) |
| setting_sound | 'on' \| 'off' | `useSettings.ts` (효과음 설정) |
| setting_vibration | 'on' \| 'off' | `useSettings.ts` (진동 설정) |
| setting_theme | 'system' \| 'light' \| 'dark' | `useTheme.tsx` (다크 모드, 기본 system) |

```ts
// useAuth.tsx
type StoredProfile = {
  profileId: string;
  guestToken: string;
  nickname: string;
  isGuest: boolean;
  leagueTier: string;
};
```

## 5. 동기화 흐름

출처: `src/context/AppContext.tsx`

### 5.1 초기 로드

1. 콘텐츠 로드(독립 effect): `words` + `course_words` + `courses`를 병렬 조회해 `allWords`, `courses` 구성. words는 camelCase로 매핑하고, 코스별 단어는 position -> difficulty 순으로 정렬. **코스 목록은 `.order('sort_order', { ascending: true })`로 학습 권장 순서 정렬(2026-06 반영).**
2. 프로필 로드 effect: `loadStoredProfile()`로 profileId 확보(없으면 0.5s 간격 최대 12회 재시도). guestToken이 있으면 `getGuestClient(token)`을 사용.
   - points: DB값으로 세팅(서버 단일 진실원, 기존 MAX 병합 제거). 프로필이 없으면(PGRST116) `moneytermi_auth` 제거 후 재시도.
   - word_progress: known/unknown ID를 ref에 임시 저장 -> allWords 로드 후 실제 Word로 복원.
   - daily_missions: 오늘 날짜 행으로 current/is_rewarded를 max 병합.
   - attendance: 최근 60일 조회. 오늘 포함 시 m1 자동 완료.
   - emoji: 내 프로필 이모지 로드.
   - 리그: 본인 제외 프로필을 points 내림차순 49명 조회.

### 5.2 디바운스 동기화

`useDebouncedEffect`로 상태 변경 시 지연 저장. `ready`가 true이고 profileId가 있어야 실행.

| 상태 | 대상 | 지연 | 방식 |
|------|------|------|------|
| knownWords | word_progress | 2000ms | upsert (onConflict user_id,word_id), status='known' + 첫 학습 단어 SRS 시드 |
| unknownWords | word_progress | 2000ms | upsert (onConflict user_id,word_id), status='unknown' + 첫 학습 단어 SRS 시드 |

- **첫 학습 SRS 시드**(`seedInitialSrs`): 위 status upsert 후, `wpRows`에 아직 없는 단어만 `{ ease:2.5, interval_d:1, reps:0, due_date: 내일(KST) }`로 별도 upsert하고 `wpRows`에 추가. status-only upsert는 `due_date`를 안 건드리므로 복습 완료 단어의 due는 보존. 미시드 시 DB 기본값 `due_date=오늘`이 적용돼 학습 즉시 복습 큐에 쏟아지는 문제를 방지.
- 포인트·콤보·미션 진행도는 디바운스 동기화하지 않는다(서버 소유). 퀴즈 응답 즉시 `submitQuizAnswer`가 `submit_quiz_answer` RPC를 호출하고, 응답의 `points`/`m3_current`로 클라 상태를 갱신한다.
- `claimReward`: `claim_mission_reward` RPC 호출 후 응답 `points`로 갱신하고 해당 미션 `isRewarded=true` 반영.
- `checkIn`: UI 즉시 반영 후 `checkin` RPC 호출(이전의 attendance/daily_missions 직접 upsert 대체).
- **자동 출석**: `ready && profileId` 확보 후 오늘(KST) 미출석이면 `checkIn()`을 자동 1회 호출하는 effect(`[ready]`). `checkin` RPC가 idempotent(attendance UNIQUE·m1 upsert)라 중복 안전, 포인트 미지급.
- `updateMyEmoji`: 상태 반영 후 profiles.emoji 즉시 update(컬럼 GRANT 유지).
- 자정 미션 리셋: 자정까지 setTimeout 후 날짜가 바뀌면 `missions`를 DEFAULT_MISSIONS로 초기화하고 재예약.
- **날짜 문자열은 KST 기준**: 출석/streak/SRS due 등 모든 `YYYY-MM-DD`는 `src/lib/date.ts`의 `toDateStr`(UTC+9)로 생성한다. `toISOString()`(UTC)을 직접 쓰면 00:00~09:00 KST 구간에서 하루 밀리므로 금지.

## 6. 알림 (DAILY_TERM_PUSH)

출처: `DAILY_TERM_PUSH.md`, `src/hooks/useNotificationAgreement.ts`

- 발송 방식: 토스 콘솔 스마트 발송(직접 API 아님). 발송 코드(templateCode) `moneytermi-DAILY_TERM_PUSH2`, 매일 09:00(KST), 이동 URL `intoss://moneytermi/word-card`.
- `useNotificationAgreement`: 토스 동의 플로우 호출 후 결과를 `setting_notification_agreement`에 'agreed'/'rejected'로 저장(UI 토글 표시용). 실제 발송 대상 관리는 토스 측에서 수행.
- 발송 대상을 직접 관리하는 Edge Function(`toss-register-push`, `daily-term-push`)과 푸시 컬럼은 현재 미배포(2.5 참고).

## 7. 참조 파일

| 영역 | 경로 |
|------|------|
| 도메인 타입 | src/types.ts |
| DB 타입(자동 생성) | src/lib/database.types.ts |
| 스키마(사용자 데이터) | supabase/schema.sql |
| 스키마(콘텐츠) | supabase/migration_content_tables.sql |
| 포인트 무결성(RPC + 권한) | supabase/migration_points_integrity.sql |
| 푸시 마이그레이션(미배포) | supabase/migration_push_subscriptions.sql |
| 콘텐츠 시드 1탄(절세·ETF·배당·시장·연금·공모주) | moneytermi_seed_finance_concepts.sql |
| 콘텐츠 시드 2탄(청년정책·통장·청약·매매) | moneytermi_seed_policy_housing.sql |
| 클라이언트 상태 + 동기화 | src/context/AppContext.tsx |
| 인증 / StoredProfile | src/hooks/useAuth.tsx |
| Storage 추상화 | src/lib/storage.ts |
| Supabase 클라이언트 | src/lib/supabase.ts |
| 알림 동의 | src/hooks/useNotificationAgreement.ts |
| Edge Functions(푸시) | supabase/functions/toss-register-push, supabase/functions/daily-term-push |

---

## 8. 로드맵

> 8.1 SRS·8.2 실천은 **배포 완료**(라이브 DB 반영). 8.3 시장지표만 미실행.

### 8.1 SRS 간격반복 (배포됨) — `word_progress` 확장

틀린 단어는 자주, 아는 단어는 뜸하게 출제. 포인트 경로(§2.4)는 건드리지 않고 일정 필드만 추가.

```sql
-- 예정. service_role
ALTER TABLE word_progress
  ADD COLUMN IF NOT EXISTS ease       NUMERIC NOT NULL DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS interval_d INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reps       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS due_date   DATE    NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS last_grade SMALLINT;
CREATE INDEX IF NOT EXISTS idx_wp_due ON word_progress(user_id, due_date);
```

- 채점 3버튼(again/hard/good) → SM-2 lite로 `interval_d`·`ease`·`due_date` 갱신.
- "오늘 복습 큐": `WHERE due_date <= CURRENT_DATE ORDER BY due_date`.
- RLS: 기존 `word_progress`(본인 행) 정책 그대로 적용. 포인트는 기존 `submit_quiz_answer` RPC 유지.

### 8.2 실천 레이어 (배포됨) — `actions` / `user_actions`

개념을 내 할 일로 전환. 콘텐츠(공개)와 사용자 실천(본인 소유)을 분리.

```sql
-- 예정. 콘텐츠: 액션 템플릿 (public_read)
CREATE TABLE actions (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  word_id     INTEGER,
  course_id   TEXT REFERENCES courses(id)
);
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read ON actions FOR SELECT USING (true);

-- 예정. 사용자 실천 상태 (본인 행만)
CREATE TABLE user_actions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_id    TEXT REFERENCES actions(id),
  custom_title TEXT,
  status       TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, action_id)
);
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_rw ON user_actions FOR ALL
  USING (user_id = current_profile_id())
  WITH CHECK (user_id = current_profile_id());
```

- 단어 카드 "실천하기" → `user_actions` 담기. 실천 탭(todo/doing/done) + 직접 추가(`custom_title`).
- 액션 완료 포인트 지급을 원하면 클라 직접 쓰기 금지, `claim_*` 패턴의 SECURITY DEFINER RPC로 추가.

### 8.3 시장지표 위젯 (예정) — `market_indicators`

"왜 지금 중요한지" 맥락 제공. 실시간 AI 생성 금지, 공식 API만 Edge Function이 1일 1회 캐시.

```sql
-- 예정. service_role
CREATE TABLE market_indicators (
  key        TEXT PRIMARY KEY,        -- 'base_rate' / 'usdkrw' / 'cofix_6m'
  value      NUMERIC,
  as_of      DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE market_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read ON market_indicators FOR SELECT USING (true);
-- 쓰기 정책 없음 → anon/authenticated 차단. Edge Function(service_role)만 upsert.
```

- 콘텐츠 테이블 원칙(§2.4)과 동일: `public_read` SELECT only, 쓰기 정책 없음.
- 소스: 한국은행 ECOS(기준금리), 환율 API, COFIX 6개월. 뉴스는 기존 네이버 뉴스 API 유지.

### 8.4 스코프 제외 (안 함)

| 항목 | 이유 |
|------|------|
| 전체 가계부 | 데이트가계부·뱅크샐러드와 중복, 앱 정체성 희석 |
| 실시간 AI 시세·수급 분석 | 환각 위험 — 공식 API 캐시만 사용 |
| 오픈뱅킹 자산연동 | 보안·인증 부담, 학습앱 범위 초과 |
| 글로벌 리더보드 강화 | 솔로/소수 사용 시 동기부여 역효과 |
