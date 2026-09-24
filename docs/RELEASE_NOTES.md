## 릴리즈 날짜 대장 (코호트 분석 기준 — 커밋일/생성일 아님)

> 코호트·리텐션 분석은 반드시 이 표의 **기능 도달일**을 D0 기준으로 쓴다.
> 콘솔 '생성일시'(커밋 근처)나 개별 노트 날짜(커밋일)를 기준으로 쓰지 말 것.
> 07-15 "0% D1" 오류의 원인이 이 혼동이었다.

| 번들 | 콘솔 출시일시 (KST) | 기능 도달일(D0 기준) | 주요 기능 |
|------|--------------------|--------------------|-----------|
| 20260923-129 (콘솔 확인 후 기입) | 출시 대기 | — | 데일리 푸시 발송 코드 PUSH2 → PUSH3 (알림 클릭 시 딥링크 동작) |
| 2026092x-1xx (콘솔 확인 후 기입, deploymentId `01a0d5c2`) | 배포됨 08:32 KST · 검수 요청 전 (2026-09-25 머지, PR #41~#43) | — | 앱 전면 개편: 학습 코스 → 세로 패스(주제별 37코스, 코스 간 잠금), 리그(주간 XP 랭킹), XP/포인트 분리 + **포인트 경제(레슨 10P · XP 50마다 +50P · 부족 시 광고)**, 미션 5종·8시간 리셋, 배지, 랜덤 닉네임, 전역 상단바, 800선 716단어 교체, 전역 모션 |
| 20260923-128 | 2026-09-23 16:05 | 2026-09-23 | 계측 보정, 뉴스 링크 Device.openURL 전환, **CI env 주입 — 리워드 광고·친구 초대 실제 도달일**, NavBar 가림 해소, 자체 뒤로가기 4곳 제거, MY→마이 (124·125 반려 후 재등록) |
| 20260910-122 | 2026-09-10 11:05 | 2026-09-10 | SDK 3.4.0 마이그레이션, 프로모션 SDK 연동 |
| 20260831-121 | 2026-08-31 18:45 | 2026-08-31 | 실천 기능 제거, 캐릭터 키우기 전환, profiles RLS 강화, TDS CSS 리셋 버그 수정 |
| 20260830-118 | 2026-08-31 09:43 | 2026-08-31 | 리워드 광고 연동 — ⚠️ **CI env 누락으로 광고 버튼이 라이브에 노출되지 않았음**(실제 도달일은 20260923-128). 코드 배포일일 뿐 기능 도달일 아님 |
| 20260829-117 | 2026-08-29 16:15 | 2026-08-29 | 신규 게스트 진입 차단 버그 수정, 친구 초대 공유 리워드 — ⚠️ **초대 버튼 노출 여부 불확실**(CI 빌드였다면 env 누락으로 미노출. 대조 가능한 CI 런 없음 → 로컬 빌드 추정, 추측). 확실한 도달일은 20260923-128 |
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
| `20260830-118` | 08-30 20:32 | 08-31 09:43 | 13시간 11분 |
| `20260831-121` | 08-31 15:44 | 08-31 18:45 | 3시간 1분 |
| `20260910-122` | 09-10 10:26 | 09-10 11:05 | 39분 |
| `20260923-128` | 09-23 15:43 | 09-23 16:05 | **22분** (최단. 단 124·125가 같은 사유로 2회 반려된 뒤의 3회차) |

> **운영 규칙**: 검수 2~3일 지연이 구조적이다. 유입 스파이크가 예상되면 **역산해 최소 3영업일
> 전에 배포를 제출**한다. 07-15(최대 코호트)가 개선 전 빌드를 받은 것이 이 규칙이 없어서였다.

> **TODO**: 06-20 / 06-17 / 06-16 항목의 실제 출시일은 미확인이다.
> 앱인토스 콘솔 → 버전 내역 2~8페이지에서 확인해 채울 것.

---

## 2026-09-25 머지 / 출시 대기 (PR #41, 검수 요청 전) — 앱 전면 개편

당초 9/30 전수 점검 뒤 머지하기로 했으나 9/25에 머지·배포로 앞당김(콘솔 검수 요청 시점은 별도 판단).
CI 배포 3회: run 36031409503(02:02, `01a0d45d`) → 상단 여백 → PR #42 run 36070758261(08:03, `01a0d5a9`) → 실기기 깜박임·멈춤 → PR #43 run 36073169670(08:32).
**검수용 최신 deploymentId `01a0d5c2-f3da-7ea8-b593-6ca81edf0ad6`**,
실기기 테스트 링크 `intoss-private://moneytermi?_deploymentId=01a0d5c2-f3da-7ea8-b593-6ca81edf0ad6&host=appsInTossHost`.
화면 구조·보상 체계·데이터 모델이 함께 바뀌어 항목이 많다. **서버 마이그레이션 6개 + 단어 교체 SQL 12개가 선행돼야 한다**(아래 표).

### 🗺 학습 코스 → 세로 패스 화면

코스 카드 목록 + 단어 목록 2단계를 하나의 구불구불한 패스로 교체. 노드 1개 = 단어 3~5개 묶음,
레슨 3개마다 퀴즈 노드, 코스 끝에 **누적 복습 노드**(앞 코스들 단어까지 전부 포함).
코스 섹션마다 색이 다르고 배너는 스크롤 시 상단에 고정된다.

- 커넥터는 노드마다 그린다 — 배너 높이가 한글 줄바꿈으로 달라져 섹션 전체를 한 장의 SVG로
  그리면 어긋난다. 양 끝 접선이 수직인 큐빅이라 이음새가 안 보인다(테스트로 고정).
- 장식("시작" 말풍선)은 패스 순서상 첫 current 노드에만. 코스 간 잠금이 없어 current가
  코스마다 생기기 때문.
- 진도·잠금은 기존 `word_progress` 규칙 그대로. 새 테이블 없음.
  단, 단어 교체(`supabase/words_bok/01_delete.sql`)가 `word_progress`를 비우므로 **전 유저 진도가 0에서 시작**한다(이미 적용됨).
- `CourseWordListScreen` + `/course/words` 라우트 삭제(딥링크 allowlist에 없어 안전).

### 🧭 정보구조 개편

- 탭: **홈(패스) / 퀘스트 / 리그 / 마이**. 라벨 없이 아이콘만. 퀴즈 탭 제거(`/review`는
  퀘스트의 복습 카드와 푸시 딥링크로 유지).
- 앱 진입 기본 랜딩과 토스 뒤로가기 루트를 `/course`로. `/home` 경로는 딥링크 allowlist가
  쓰고 있어 그대로 두고 라벨만 '퀘스트'로 바꿨다.
- **전역 상단바** 신설 — `머니터미 🔥N ✨N ⚡N 📖N`(연속·XP·포인트·단어 수). 포인트를 누르면 상점 시트
  (광고 충전 / XP 2배 부스트).
- 개미 컨셉 제거(알개미~슈퍼개미 → 브론즈~다이아), 캐릭터 키우기 삭제.

### 🏆 리그 — 주간 XP 랭킹

- **XP = 순위·티어(소모 불가) / 포인트 = 소모 재화**로 역할을 갈랐다. 포인트가 순위를
  결정하면 쓸수록 순위가 내려가기 때문.
- XP 획득: 새 단어 1 · 퀴즈 정답 2 · 출석 3 · 미션 보상 5. **광고·초대·프로모션은 XP를 주지
  않는다** — 돈이나 초대로 순위를 사는 길을 막았다.
- KST 월요일 00:00 주간 초기화, 남은 일수 표시. TOP 10만 노출하고 내가 10위 밖이면 맨 아래
  따로 붙인다.
- 티어 기준선을 포인트 시절의 1/5로 조정(0/20/100/300/800). 4000XP는 퀴즈 2000문제라
  도달 불가였다.
- 부스트: 300P로 30분간 XP 2배. 배수는 서버 `add_xp()`가 적용한다.

### ✅ 미션 · 배지 · 닉네임

- 미션을 `mission_defs` 테이블 기반으로 바꿔 추가가 INSERT 한 줄이 됐다(기존엔 RPC의 CASE
  하드코딩). 5종으로 확장, **8시간(KST 0/8/16시)마다 리셋**.
- 배지 10종 — 포인트·연속일·학습 단어 수에서 파생하므로 저장이 필요 없다.
- 기본 닉네임 `예비슈퍼개미` → **랜덤 배정**(`똑똑한수달742` 형태). 리그에 같은 이름이 줄줄이
  뜨던 문제 해결. 기존 기본 닉네임 사용자는 앱 진입 시 직접 설정하게 된다.
- 마이페이지: 출석 달력·수동 출석 버튼 제거(자동 출석만), 요약 4칸 + 배지 그리드.

### ⚠️ 선행 마이그레이션 (수동 적용)

| 파일 | 상태 |
|---|---|
| `migration_missions_slots.sql` | ✅ 적용 |
| `migration_leaderboard.sql` | ✅ 적용 |
| `migration_leaderboard_fix.sql` | ✅ 적용 |
| `migration_weekly_league.sql` | ✅ 적용 |
| `migration_random_nickname.sql` | ✅ 적용 |
| `migration_xp.sql` | ✅ 적용 — 9/24 점검에서 STEP 4~8(`add_xp`·XP 지급 RPC)이 빠진 것을 확인하고 재적용. 그전까지 XP가 0으로 고정돼 있었다 |
| `migration_revoke_helpers.sql` | ✅ 적용 (2026-09-24) — `bump_mission`/`add_xp` anon 노출 차단, `word_progress` DELETE 회수 |
| `words_bok/00~11` | ✅ 적용 (2026-09-24) — 경제금융용어 800선 716단어 / 29코스. 이전 데이터는 `*_backup_20260924` |
| `words_bok/15_words_fix_1~2.sql` | ✅ 적용 (2026-09-25) — 본문에 남아 있던 PDF 여백 색인 글자(`…평균 ㄱ 생산비용도`) 제거, 86행 |
| `migration_xp.sql` STEP 10 | ✅ 재적용 (2026-09-25) — 리그 순위 함수가 포인트 버전(`point_events`)으로 남아 있던 것을 발견(99명이 200XP로 표시). XP 버전으로 교체 |
| `migration_points_economy.sql` | ✅ 적용 (2026-09-25) — 시작 잔고 100P(기존 유저 1회 +100P), `spend_points` RPC, `add_xp`에 XP 50마다 +50P. STEP 1의 +100이 두 번 실행돼(357명 전원 +200) `points - 100`으로 보정함 |
| `words_bok/14_words_fix_1~5.sql` | ✅ 적용 (2026-09-24) — **800선 본문 재추출**. 첫 추출이 페이지 러닝헤더(인접 용어명)를 본문에 끼워 넣어 103개 오염·8개 이상 본문 뒤바뀜(예: DTI 뜻이 청산소 본문). `parse800.py`로 재추출, 338행 UPDATE. 진도·코스 무관 |
| `words_bok/13_recategorize.sql` | ✅ 적용 (2026-09-24) — 코스를 가나다순 29개에서 **17주제 37개**로 재분류(경제 기초 → 가계 → 물가 → 경기 → 고용 → 금리 → 은행 → 주식·채권 → 파생 → 외환 → 무역 → 국제기구 → 재정 → 규제 → 지급결제 → 핀테크 → 기업). 분류 원본 `categories.py`. 진도 보존 |

`point_events`/`xp_events`는 적용 시점부터 이력이 쌓이므로 **첫 주 랭킹은 모두 0에서 시작**한다.

### 2026-09-24 전체 점검 보정

- 패스: 앞 코스를 끝내야 다음 코스가 열린다(코스 간 잠금). 노드 좌우 교대·폭 불균등, 간격 160, S자 점선. 코스는 주제별로 재분류(위 표 `13_recategorize.sql`).

- 서버: `bump_mission(uuid,text,int)`가 anon 키로 호출 가능했다(미션 진행도 임의 조작 → 보상 무한 수령).
  `migration_revoke_helpers.sql`로 회수. `word_progress` DELETE 권한도 회수(지우고 다시 넣어 XP 파밍 차단).
- 리그: `LeagueScreen`이 게스트 토큰 없는 클라이언트로 RPC를 불러 "내 순위"가 항상 비어 있었다 → 게스트 클라이언트 사용.
- 출석 미션(m1): 하루 첫 진입에만 `checkin`을 불러 08:00/16:00 슬롯에선 서버 진행도가 안 올라가는데
  클라이언트는 완료로 표시해 "받기"가 `reward not eligible`로 실패했다 → 진입·슬롯 리셋마다 호출(서버 멱등).
- 미션 정의 로드와 진행도 로드가 경쟁해 서버 미션 5종이 폴백 2종으로 덮이는 경우가 있었다 → 병합.
- 푸시 딥링크(`/word-card` state 없음)에서 마지막 미학습 단어를 체크하면 코스가 바뀌어 크래시 → 코스 1회 고정.
- `/quiz` 딥링크가 렌더마다 문제를 다시 섞던 것 고정. 렌더 중 `navigate` 제거.
- 닉네임: 레거시 기본값을 다시 저장하면 게이트가 안 닫히던 것 차단, 저장 실패 시 버튼 잠김 해제.
- 배지 `100P/1,000P/5,000P`가 실제로는 XP로 채점되고 있었다 → `100/500/1,000 XP`.
- **포인트 경제** — 레슨 시작에 10P(퀴즈·복습 무료). 부족하면 "포인트가 부족해요" 시트(광고 보고 받기 / 학습으로 모으기 안내). 포인트는 퀴즈 정답·미션·광고에 더해 **누적 XP 50마다 +50P** 자동 지급(XP는 소모하지 않아 티어·리그 무관). 신규·기존 유저 시작 잔고 100P. 서버 `spend_points`가 잔고를 검증.
- 코스: "시작" 말풍선 제거, 진행할 노드 제자리 점프 애니메이션. 퀘스트: 상단바와 중복되던 통계 3칸 제거, 미션 보상에 XP 표기. 리그 안내 시트를 앱 사용법과 같은 카드 스타일로. 관련 용어 클릭 시 다른 단어가 나오던 버그(같은 라우트 재진입에 index 미갱신) 수정.
- 퀴즈: 뜻 문장에 용어가 들어 있어(716개 중 403개) 보기/문제에 답이 노출되던 것을 `maskTerm`으로 가림. 장문 보조 박스 제거, 빈 상태·스크롤 추가. 노드 탭·정답 햅틱.
- `database.types.ts`가 xp/boost/mission_defs/slot/신규 RPC를 몰라 `tsc -p tsconfig.app.json`이 20건 실패하던 것 해소.
  루트 `tsc --noEmit`은 `files: []`라 아무것도 검사하지 않는다 — 검증은 `tsc -p tsconfig.app.json`으로.

### 2026-09-25 추가분 — 포인트 경제 · UI 점검 라운드 · 모션

- **포인트 경제**: 레슨 시작 10P(퀴즈·복습 무료), 부족하면 "포인트가 부족해요" 시트(광고 주행동 + 모으는 법).
  누적 XP 50마다 +50P 자동 지급(XP 미소모), 시작 잔고 100P. 서버 `spend_points`·`add_xp` 교체 적용 완료.
- **연속 학습 마일스톤**(7·14·30·50·100일): 그라데이션 배경 + 색종이 + 헤드라인 + 축하 햅틱.
- **전역 모션**: 화면 전환 슬라이드, 상단바 숫자 카운트업, 카드·행·배지·보기 순차 등장, 버튼 눌림, 받기 버튼 파동, 노드 점프. `prefers-reduced-motion` 대응.
- **패스**: 좌우 교대 불균등 배치, 간격 160, S자 점선, 배너 간격, 아바타 제거, 퀴즈·복습 노드 완료 표시(기기 저장).
- **퀘스트 상단**: 브랜드 히어로(인사·티어·7일 출석 스트립, 신규는 첫 학습 CTA). 가짜 높이 막대 차트 삭제. 통계 3칸 제거. 미션 보상에 `+5 XP`, 수령 성공/실패 토스트 + 햅틱.
- **퀴즈/복습**: 뜻 문장 속 정답 용어 마스킹, 보기 1열, 완료 카드에 획득 XP, 오프라인 로컬 콤보, 작은 기기 스크롤, 빈 상태.
- **단어카드**: 진행 점·토글 원형 복구, 상세 설명의 요약 중복 제거, 관련 용어 클릭 오동작 수정, 완료 토스트 1회.
- **시트 6종 점검**: 설정(진동 아이콘), 알림 프롬프트, 상점(광고 주행동·부스트 잔여/부족 표시), 닉네임(포커스·리셋·미변경 비활성), 이모지(🍊 복귀·의미 아이콘 제외), 앱 사용법·리그 안내(문구·순서·카드 스타일), 공유(내 카드 미리보기·성과 문구).
- **마이페이지**: 아바타 원형 복구, 도달 불가한 게스트/로그아웃 UI·가짜 버전 제거.
- **데이터**: 800선 본문 재추출(러닝헤더 오염 338행 + 여백 색인 글자 86행), 리그 순위 함수 XP 버전 재적용, 포인트 +100 이중 적용 보정.

- **효과음·진동 어휘집**(9/25, `lib/feedback.ts`): 이벤트마다 다른 합성음 + 햅틱 — 노드 탭(팝·basicMedium), 레슨 시작 포인트 소모(쓱·tap), 정답(2음, 콤보 3↑ 3음·5↑ 4음+축포), 오답(버저·error), 단어 완료(딩·softMedium), 레슨 완료(팡파르·success→confetti), 퀴즈/복습 완료(상승 3음, 100%면 4음+축포 연타), 티어 승급(웅장), 보상 수령(동전·success→tap), 부스트(파워업 스윕·wiggle), 연속 학습(차임), 마일스톤(팡파르+축포 3연), 실패(낮은 버저·error). 설정의 효과음/진동 토글이 즉시 전역 반영.
- **실기기 깜박임·멈춤 수정**(9/25): 홈(코스) 진입 시 노드 행 295개 + 배너에 걸린 등장 애니메이션(동시 339개)과 transform 라우트 전환이 iOS 웹뷰에서 화면을 멈추게 함 → 패스의 행/배너 등장 애니메이션 제거(노드 점프만 유지), 화면 전환은 opacity 페이드로. 진입 시 애니메이션 339 → 7.
- **상단 여백 제거**(9/25 실기기 확인): 루트의 `paddingTop: insets.top`이 네이티브 내비게이션 바 아래에서 상태바 높이만큼 회색 띠를 만들던 것 제거. 128까지는 화면 헤더가 캔버스색이라 안 보였고 카드색 상단바가 생기며 드러남.

### 토스 콘솔 출시노트 (사용자 노출용)

```
머니터미가 새로워졌어요
- 학습 코스가 한 줄 패스로 바뀌었어요. 다음에 누를 곳이 한눈에 보여요
- 한국은행 경제금융용어 800선으로 단어를 전면 교체하고 17개 주제로 나눴어요
- 매주 초기화되는 XP 리그와 티어(브론즈~다이아), 배지가 생겼어요
- 미션은 8시간마다 새로 열리고, 7일 연속 학습하면 특별한 축하가 기다려요
- 레슨 시작에 포인트가 들어요. 퀴즈·미션·광고로 모으고, XP 50마다 50P를 드려요
```

### 미해결

- 친구 추가 기능 — 친구 테이블·RPC 설계부터 필요해 착수 안 함.

---

## 2026-09-23 커밋 / 출시 대기 (번들 129) — 데일리 푸시 발송 코드 PUSH2 → PUSH3

### 🔔 알림 클릭이 동작하지 않던 캠페인 교체

기존 캠페인 **39540**(`moneytermi-DAILY_TERM_PUSH2`)은 이동 URL이 잘못 입력돼 알림을 눌러도 이동하지
않았다. "발송됨" 상태라 콘솔에서 수정이 막혀 있었다.

⚠️ **발송 코드는 중복 등록이 불가능하다 — 실측.** 같은 발송 코드로 캠페인을 복사·재등록하면 서버가
**HTTP 200을 반환하면서 실제로는 생성하지 않는다**(에러 메시지 없음). 발송 코드를 `DAILY_TERM_PUSH3`으로
바꾸자 즉시 등록됐다. 새 캠페인 **123696** = `moneytermi-DAILY_TERM_PUSH3`.

앱 수정: `src/hooks/useNotificationAgreement.ts`의 `TEMPLATE_CODE`를
`'moneytermi-DAILY_TERM_PUSH2'` → `'moneytermi-DAILY_TERM_PUSH3'`. 접두사 `moneytermi-`는 콘솔이 자동
부여하지만 **앱 상수에는 접두사를 포함한 전체 문자열**을 넣는다(`7e7d0e3` 이력: 접두사를 빼면 콘솔 코드와
불일치해 동의 UI 자체가 뜨지 않는다). 콘솔 표기와 문자 단위로 일치시켰다.

**⚠️ 39540 예약 취소 순서 — 반드시 이 순서로**
1. 번들 129 출시
2. 실기기에서 알림 동의 → 다음 09:00 발송분 수신 → **알림 클릭 시 단어 카드로 이동하는지 확인**
3. 확인된 뒤에 39540 예약 취소

먼저 39540을 끄면 129가 검수·출시되는 사이 푸시가 끊긴다. 또한 기존 동의자는 PUSH2 기준으로 동의한
모수라, PUSH3 캠페인의 발송 모수가 정상적으로 잡히는지도 2단계에서 함께 봐야 한다(추측: 동의는 미니앱
단위이므로 승계될 가능성이 높으나 미확인).

### 토스 콘솔 출시노트 (사용자 노출용)

```
이번 업데이트 주요 내용

[알림이 제대로 열려요]
매일 받는 오늘의 용어 알림을 누르면 단어 카드로 바로 이동해요.
```

변경 파일: `src/hooks/useNotificationAgreement.ts`, `docs/DAILY_TERM_PUSH.md`

---

## 2026-09-22 커밋 / 2026-09-23 16:05 출시 (번들 20260923-128, PR #34·#36·#37) — 하단 NavBar 가림 해소 + 자체 뒤로가기 제거 + 검수 문구 대응

아래 PR #33 항목과 **같은 번들**로 출시. 9/22 CI 배포 4회(13:57 #33 → 14:46 #34 → 14:52 #36 → 15:10 #37) 중
15:10 번들을 등록 → **반려(124)**. 9/23 15:18 번들(#38 원복) → **반려(125)**. 9/23 15:43 번들(#39 openURL,
커밋 `4a940e9`) = **`20260923-128`이 16:05 출시**. 앞선 CI 번들들은 콘솔에서 미출시로 둔다.

### 🐛 하단 NavBar가 화면 내용을 가리던 문제 — NavBar 높이를 단일 소스로

실기기에서 하단 알약 NavBar가 콘텐츠를 덮는 것이 확인됐다. 원인은 화면별 매직넘버:
NavBar 점유 높이는 알약 89px + 하단 여백 24px + safe area bottom = **113px + inset**인데,
코스/마이/성장은 `pb-24`(96px)라 인셋 0 기기(안드로이드 대다수)에서도 17px 가려졌고,
홈/퀴즈의 `pb-32`(128px)도 인셋 34px(아이폰)에서는 19px 부족했다.

수정: `NavBar`가 `useLayoutEffect`로 자기 래퍼 `offsetHeight`를 실측해 `document.documentElement`에
`--nav-height`로 주입(`insets.bottom` 변화 시 재측정). `index.css`에 `@utility pb-nav
{ padding-bottom: calc(var(--nav-height, 113px) + 15px) }` 하나를 정의하고 5개 탭 화면의 최하단
컨테이너가 이 클래스만 쓴다. `+15px`는 기존 홈 기준선(128 = 113 + 15)을 그대로 유지하기 위한 값.

before/after(인셋 0): 홈·퀴즈 128 → 128(변화 없음), 코스·마이·성장 96 → 128. 인셋 34에서는 5화면 모두 162.
브라우저 실측(768px / 375×520 두 뷰포트, 스크롤 최하단 leaf bottom − 알약 top): 홈 −63, 코스 −15,
성장 −8.5, 퀴즈 −65~−189, 마이 −23.1 (음수 = 겹침 없음). 인셋 > 0 상태는 브라우저에서 재현 불가 — 실기기 확인 항목.

후속(PR #36): 퀴즈 탭(`/review`) 문제 화면은 루트가 `h-full` flex column인데 스크롤이 없어, 문제 카드·입력·제출·힌트가
가용 높이(뷰포트 − 128px)를 넘으면 `pb-nav` 영역을 뚫고 NavBar 아래로 밀렸다(실기기 보고). 루트에
`overflow-y-auto` 추가. 브라우저 재현(동일 클래스 + 900px 콘텐츠): 제출 버튼 bottom − 알약 top = **+333 → −31**.

후속(PR #37): #36 번들 실기기에서 "스크롤은 되는데(헤더가 함께 움직임) 끝까지 내려도 버튼이 NavBar 아래" 보고.
스크롤 컨테이너의 `padding-bottom`이 스크롤 범위에 포함되지 않는 증상과 일치 — Chromium·WebKit(iPhone SE
시뮬레이터)에서는 재현되지 않아 토스 RN WebView 고유로 추정(추론, 직접 측정 못 함). `pb-nav`를 패딩 대신
`::after { display:block; flex:none; height: calc(var(--nav-height,113px) + 15px) }` 스페이서로 변경(명시적 높이의
마지막 자식은 어떤 엔진에서도 스크롤 범위에 포함). 화면 파일 변경 없음, Chromium 실측 overlap 동일(홈 −63,
코스 −15, 마이 −23.1), WebKit 시뮬레이터 퀴즈 3버튼 알약 위 확인.

별도 이슈: `LeagueScreen` 루트가 뷰포트보다 6.5px 크게 렌더됨(헤더 높이, 이 변경과 무관, 수정 전부터 존재).
겹침은 아니라 이번엔 미수정 — GitHub 이슈로 기록.

변경 파일: `src/components/NavBar.tsx`, `src/index.css`,
`src/pages/{HomeScreen,CourseScreen,LeagueScreen,ReviewScreen,MyPageScreen}.tsx`

### 🔙 자체 뒤로가기 버튼 4곳 제거 — 토스 네비바 뒤로가기와 중복 노출 해소

콘솔 공지 가이드 위반 대표 사례 "토스 네비게이션 바의 뒤로가기 버튼과 미니앱 자체 구현 뒤로가기 버튼의 중복
노출" 대응. `apps-in-toss.config.ts` `withBackButton: true`인데 `/course/words`, `/word-card`, `/league/rules`,
`/quiz` 헤더가 각자 `ChevronLeft` 버튼을 렌더하고 있었다.

실기기 확인(9/22): 토스 네비바 뒤로가기가 `/home`(history idx 0)에서 미니앱을 정상 종료하고, 바텀시트가 열려
있으면 시트만 닫는다 → 자체 버튼을 없애도 사용자가 갇히지 않음. 4곳 제거, 뒤로가기는 `App.tsx`
`BackEventHandler`(`backEvent` → idx>0이면 `navigate(-1)`, 아니면 `/home`, `/home`이면 `closeView`)가 담당.
완료 화면 "코스로 돌아가기"·전진 CTA·바텀시트는 유지.

부수 효과: 기존 자체 버튼이 절대 경로를 push해 `/home → 카드 → [자체 뒤로] /home(idx 2) → [토스 뒤로] 카드`로
되돌아가던 스택 증식도 함께 사라짐.

변경 파일: `src/pages/{CourseWordListScreen,WordCardScreen,LeagueRulesScreen,QuizScreen}.tsx`

### 🗞 뉴스 목록 — 탭 불가임을 시각적으로 명확히 (A′ 후속)

PR #33에서 `<a>` → `<div>`로 바꾼 뒤 실기기 피드백 "뉴스 클릭이 안 된다". 카드 안 굵은 제목 목록이라 탭
가능해 보인 것. `active`/`hover`/`cursor` 클래스와 아이콘은 이미 없었음(실측 0건). 항목 간 `gap-3.5` 대신
`divide-y divide-[var(--color-line)]` + `py-3`로 읽기용 리스트임을 드러냄. 제목/요약/날짜/하이라이트 불변.

변경 파일: `src/pages/WordCardScreen.tsx`

### ✏️ 검수 체크리스트 "영어 텍스트" 대응

- 하단 탭 `MY` → `마이` (`src/components/NavBar.tsx`)
- 리워드 토스트 `+${credited}${unit}` → `+${credited}P` (`src/pages/LeagueScreen.tsx`). `credited`는 서버가 적립한
  앱 포인트라 SDK가 준 `rewardUnit`/`unitType` 원문(값 미확인, 영문 가능)을 붙이는 게 부정확했다. 앱 관용 표기
  `P`(`+5P 보너스`, `누적 포인트 N P`)로 통일. SDK unit은 RPC 저장용으로는 그대로 전달.
- `FAQ`, `x2 보너스`, `+5P`는 관용 표기로 미변경.

---

## 2026-09-22 커밋 / 2026-09-23 16:05 출시 (번들 20260923-128, PR #33) — 계측 보정 + 뉴스 외부 링크 제거 + CI env 주입

위 PR #34·#36·#37 항목과 같은 번들. 최종 CI 배포 2026-09-22 15:10 (SDK 3.4.0, 워크플로 런 35693666431,
커밋 `0b41b6d`). 콘솔 생성일시·번들 ID·출시일시는 콘솔 확인 후 기입. 앱인토스 비게임 전수 점검(9/30~) 대비
사전 검수 요청용 번들.

### 토스 콘솔 출시노트 (사용자 노출용 — 15:10 번들 QR 테스트로 성장 탭 초대 버튼 노출 확인 후 아래 평문 그대로 등록)

```
이번 업데이트 주요 내용

[친구와 함께 배워요]
친구를 초대하면 포인트를 받아요. 성장 탭에서 초대할 수 있어요.

[더 편해진 화면]
하단 메뉴에 가려지던 내용이 끝까지 보이도록 고쳤어요.
뒤로가기는 화면 위 토스 버튼 하나로 정리했어요.
```

초대 버튼은 마이페이지가 아니라 **성장 탭(LeagueScreen)** 에 있다(`LeagueScreen.tsx:123`). 피초대자 보상 여부는
코드에서 알 수 없어(콘솔 공유 리워드 모듈 설정) "둘 다 받아요" 표현은 쓰지 않았다. 리워드 광고는 기능은 두되
출시노트에서 앞세우지 않는다(리워드성 서비스 분류 리스크, 추측). QR 테스트에서 초대 버튼이 안 보이면 첫 문단 삭제.
계측 보정·CI env는 사용자 대면 변화가 아니라 출시노트에 쓰지 않는다.

### 📊 알림 동의 · 리뷰 요청 · 복습 카드 계측 보정

콘솔 실측에서 `notification_agree` 1건 vs 실제 푸시 발송 대상 6~8명, 리뷰 요청 13회 호출 vs 실제 리뷰
2개, `review_start` 14일간 0건 — 세 지표 모두 원인을 가릴 이벤트가 없었다.

- **알림 동의**: `notification_agree`가 버튼 탭 시점에 찍히던 것을 토스 동의 시트 결과 시점으로 이동.
  `useNotificationAgreement.requestAgreement(source)`가 `Promise<'agreed'|'rejected'|'error'>`를 반환하고
  resolve 직전에 `notification_agree / notification_reject / notification_agree_error`를 `source`
  (`prompt_card` | `settings`)와 함께 기록. 마이페이지 토글 경로(`SettingsSheet`)는 이전까지 무계측이었다 —
  prompt 카드는 디바이스당 1회만 뜨므로 실제 동의 대다수가 settings 경로일 가능성이 있어 분리 필수.
  카드에는 `notification_prompt_tap`(탭 시점)·`notification_prompt_later`(나중에) 추가.
  → `prompt_tap - (agree+reject+error)` = 시트를 응답 없이 닫은 수, `prompt_view - prompt_tap - prompt_later` = 무반응.
- **리뷰 요청**: `requestAppReview` 3경로 로깅 `review_request_unsupported / called / error`.
  `called`는 SDK가 resolve했다는 뜻일 뿐 실제 리뷰 시트 노출 여부는 플랫폼이 제어하므로 알 수 없다.
  호출부(QuizScreen, ReviewScreen, AppContext.claimReward)는 미수정.
- **복습 카드**: 홈 "오늘 복습할 단어 N개" 카드 렌더 시 `review_prompt_view { count }`. 세션 1회 `useRef`
  래치 + `hydrated` 가드(hydration 전 프레임 오발화 방지). 이제 "카드가 안 뜬다"와 "떠도 안 누른다"가 갈린다.

⚠️ 지표 해석: 이 번들 출시 전 `notification_agree`는 "탭 수"이고 출시 후는 "동의 수"다. 전/후를 이어 붙이지 말 것.

순수 로직(`toAgreementOutcome`, `agreementLogName`) vitest 추가. 포인트/미션/RPC 경로 미접촉.

변경 파일: `src/hooks/useNotificationAgreement.ts`(+`.test.ts`), `src/components/DailyAlarmPromptCard.tsx`,
`src/components/mypage/SettingsSheet.tsx`, `src/lib/review.ts`, `src/pages/HomeScreen.tsx`

### 🗞 단어카드 뉴스 외부 링크 — A′ 적용 후 **검수 반려로 원복** ⚠️

경위:
1. "🗞 실시간 뉴스"가 `<a target="_blank">`로 네이버 뉴스 원문을 열어 웹뷰가 미니앱을 떠나고 있었다(콘솔
   이벤트에 `/news/articleView.html::screen` 등 외부 언론사 URL 기록). 토스 UX 원칙 "아웃랜딩 유도" 위반
   소지로 판단해 **A′**(링크 제거, `<a>` → `<div>`, `ExternalLink` 제거, 헤더에 출처 표기 추가)를 적용.
2. 후속으로 "눌러도 반응 없는데 눌릴 것처럼 보인다"는 피드백에 `gap` → `divide-y` 구분선 리스트로 변경.
3. **9/22 검수 반려**: "서비스 이용을 위한 외부 링크가 정상적으로 열리지 않아요. 서비스 이용에 필요한 외부
   링크가 정상적으로 열리도록 수정해 주세요."
4. 번들 125에서 1·2를 원복 — `<a href target="_blank" rel="noopener noreferrer">` + `ExternalLink` +
   `active:opacity-60` + `gap-3.5`(번들 111~122에서 검수를 통과한 구조)로 되돌리고 `news_link_click` 로깅 추가.
5. **9/23 동일 사유로 2회차 반려.** 원복 커밋은 125에 정상 포함됐음을 확인(`84e2676`의 `WordCardScreen.tsx`에
   `<a target="_blank">` 존재). 즉 **원복으로도 링크가 열리지 않았다.**
6. 원인 가설: **SDK 3.x 웹뷰에서 `<a target="_blank">`가 동작하지 않는다.** 과거 통과 이력(111~121)은 모두
   SDK 2.6.1 시절이고, 3.4.0으로 올린 뒤 첫 검수가 이번이었다. 앱인토스 공식 문서
   (`documentation/common/screen/open-url`)는 외부 링크를 `openURL`로 여는 것만 안내한다 —
   "WebView 환경에서는 브라우저 탭이 새로 열리며, 기본 앱에서는 외부 앱 또는 브라우저로 전환돼요."
   ⚠️ SDK 패키지(`index.d.ts`, `CHANGELOG.md`)에는 `target="_blank"`에 대한 언급이 **없다**. 미동작은
   문서화된 사실이 아니라 반려 2회 + 문서상 권장 경로로부터의 추론이다.
7. **번들 20260923-128에서 `Device.openURL`로 전환**(아래 항목) → 3회차 등록에서 통과, 16:05 출시.

**판단 교훈 2가지**
- 뉴스 원문 링크는 토스 기준에서 아웃랜딩 위반이 아니라 "서비스 이용에 필요한 외부 링크"다. 공지의 "아웃랜딩
  유도" 사례를 넓게 해석해 선제 제거한 것이 1회차 반려 사유가 됐다.
- **SDK 메이저 업그레이드 후에는 "예전에 검수를 통과한 구조"가 근거가 되지 못한다.** 2회차 반려는 검증된
  구조로 되돌렸기 때문에 오히려 늦어졌다. 3.x 전환 시점에 웹 표준 API(`<a target="_blank">`, `window.open`)를
  쓰는 지점을 SDK 문서와 대조했어야 했다.

변경 파일: `src/pages/WordCardScreen.tsx`

### 🔗 외부 링크를 `Device.openURL`로 전환 (번들 20260923-128, 반려 2회 대응)

`src/lib/external.ts` 신설 — `openExternalUrl(url)`이 `Device.openURL(url)`을 먼저 호출하고, reject되면
`window.open(url, '_blank', 'noopener')`로 폴백한다(`review.ts` 패턴의 try/catch + 조용한 실패).
**환경 판정은 하지 않는다**: `ReactNativeWebView` 유무 같은 스니핑 대신 `Device.openURL`을 항상 먼저 await하고
실패했을 때만 폴백하므로, 토스 앱 안에서는 브리지가 응답하는 한 반드시 `openURL`이 쓰인다. 폴백이 도는 경로에
`external_open_fallback` 로깅을 붙여 실기기에서 폴백이 돌고 있는지(= openURL이 실패하는지) 확인할 수 있게 했다.

뉴스 항목은 `<a href target="_blank">` → `<button type="button" onClick>`. `ExternalLink` 아이콘,
`active:opacity-60`, `flex items-start gap-2`, 리스트 `gap-3.5`, 헤더 "(출처: 네이버 뉴스)" 전부 유지
(외부로 나간다는 어포던스는 남겨야 한다). 브라우저 실측: 항목 클릭 → `Device.openURL` reject →
`window.open('https://n.news.naver.com/...', '_blank', 'noopener')` 호출 확인.

✅ **실기기 확인 완료(9/23, 커밋 `4a940e9`)**: 토스 앱에서 뉴스 항목 탭 → 원문이 외부 브라우저로 열림.
✅ **검수 통과**: 번들 `20260923-128`(콘솔 생성 15:43 → 출시 16:05, 22분). `Device.openURL` 전환이 반려 사유를
해소한다는 것이 검수 결과로 확정됐다 — "SDK 3.x에서 `<a target="_blank">` 미동작"은 여전히 직접 측정한
사실은 아니지만, 링크 제거(124) → `<a>` 원복(125) → `openURL`(128) 세 번의 결과로 사실상 확정.

변경 파일: `src/lib/external.ts`(신규), `src/pages/WordCardScreen.tsx`

### 🔧 CI 배포 빌드에 광고·초대·Sentry env 주입 — 리워드 광고·친구 초대는 이 번들에서 처음 실제 도달

`.github/workflows/deploy.yml`이 `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`만 주입하고 있었고, GitHub
secrets에 `VITE_REWARDED_AD_GROUP_ID`/`VITE_SHARE_REWARD_MODULE_ID`가 등록돼 있지 않았다. 코드는 이 env가
없으면 기능을 숨기므로(`isRewardedAdEnabled()` / `isReferralEnabled()`), CI가 만든 번들은 리워드 광고·친구
초대 버튼이 없는 상태로 배포됐다.

CI 런 시각과 콘솔 생성시각 대조로 CI 빌드였음이 확정된 번들: **118**(8/30 20:31 런 = 20:32 생성),
**121**(8/31 15:43 런 = 15:44 생성), **122**(9/10 10:26 런 = 10:26 생성). 즉 위 대장의
"20260830-118 리워드 광고 연동", 그리고 121·122에서도 광고·초대 버튼은 라이브에 없었다.
117(친구 초대, 8/29 15:44 생성)은 대조 가능한 CI 런이 없어 로컬 빌드로 추정(추측).

조치: secrets 2개 등록(로컬 `.env` 값 그대로), workflow에 `VITE_SENTRY_DSN`(secret은 있었으나 미주입)
포함 3개 주입 추가. **이 번들부터 광고·초대·Sentry가 켜진 채 빌드된다.**

🔴 Sentry: `deploy.yml` 이력(`97f40ce` → `0fdb900` → `8e43ef2`) 어디에도 `VITE_SENTRY_DSN` 주입이 없었다.
즉 **CI로 만든 모든 번들은 Sentry가 꺼진 상태**(`dsn: undefined`)였고, 프로덕션 에러가 한 건도 수집되지
않았다. 단 `resolve_profile_by_toss_key` 실패는 `console.warn` 후 게스트 폴백이라 Sentry가 켜져도 잡히지
않는다 — SQL 직접 확인이 여전히 필요.

⚠️ 코호트 주의: 리워드 광고·친구 초대의 실제 기능 도달일은 118/117이 아니라 **이 번들의 출시일**이다.
`ad_reward_*`, `referral_*` 계열 지표를 8/29~9/22 구간에서 0으로 읽었다면 기능이 꺼져 있었기 때문이다.
출시 후 대장 표의 118·117 행에 주석을 달 것.

변경 파일: `.github/workflows/deploy.yml`

### 📋 전수 점검 사전 감사 결과 (코드 변경 없음, 기록용)

- 테스트 광고/프로모션 키: 잔존 없음. 광고 ID `ait.v2.live.*`(env 단일), `VITE_PROMOTION_CODE`는 `.env`에
  키 자체가 없어 프로모션 비활성(산출물에서 dead-code 제거 확인).
- Origin 복귀(8/25 공지): 2.6.1 → 3.4.0 직행이라 임시 Origin 이력 없음. 토스 앱 내부는 SDK 네이티브
  `Storage`만 사용(raw localStorage 0건) → `Migration.getOriginStorage()` 적용 불필요. CORS는 `naver-news`
  Edge Function `*` 허용 확인, 코드 변경 없음.
- 뒤로가기 중복: `withBackButton: true` 전역 + 자체 `ChevronLeft` 버튼 4곳(`/course/words`, `/word-card`,
  `/league/rules`, `/quiz`) 동시 노출 = 대표 사례 해당. 4곳 모두 절대 경로 push라 `/home → 카드 → [자체 뒤로]
  → [토스 뒤로]` 시 카드로 되돌아가는 스택 증식 있음. **미수정 — 실기기 확인 후 별도 PR.**
- 발견: 클라이언트는 `resolve_profile_by_toss_key`에 `p_referrer`(3번째 인자)를 보내지만 repo SQL은
  2-인자 버전뿐(`acquisition_channel` 마이그레이션도 repo에 없음). 번들 116에서 기능이 출시됐으므로 DB에는
  대시보드로 직접 적용된 것으로 추정(추측). 대시보드에서 3-인자 오버로드 존재 확인 필요 — 없으면 콜드스타트
  RPC가 매번 실패해 게스트 폴백 → Storage 유실 시 새 프로필 생성.
- `App.tsx` Sentry 딥링크 진단 코드는 `731dccf`(7/30)에서 이미 제거돼 있음. 현재는 `logClick('entry',
  { referrer, target })`으로 대체.

---

## 2026-09-10 커밋 / 2026-09-10 11:05 출시 (번들 20260910-122, PR #32) — 프로모션 SDK 연동

콘솔 생성일시 2026-09-10 10:26 (SDK 3.4.0) → 11:05 출시. 생성~출시 39분.

### 🎁 프로모션 SDK 연동 (첫 카드 완료 시 1회 지급)

`grantPromotionReward` 연동. 콘솔 "혜택 탭"에서 발급받은 promotionCode를 env로 주입하며,
미설정 시 기능 자체가 숨겨진다(`VITE_PROMOTION_CODE`). 검토 단계에서는 `TEST_{promotionCode}`를
그대로 넣어 쓸 수 있고, 코드 쪽에서 별도 분기가 필요 없다(콘솔이 검증만 다르게 할 뿐 SDK 호출은
동일).

리워드 지급은 친구 초대/광고 리워드와 동일한 서버 권위 패턴 — 서버 RPC `claim_promotion_reward`가
1회만 지급되도록 테이블 PK로 중복 방지하고 지급액을 0~100P로 클램프한 뒤 적립한다.

변경 파일: `src/lib/promotion.ts`(신규), `src/context/AppContext.tsx`(`claimPromotionReward`),
`src/pages/WordCardScreen.tsx`, `src/lib/database.types.ts`, `.env.example`,
`supabase/migration_promotion.sql`(신규, 운영 DB 실행 필요)

⚠️ 9/10 앱인토스 공지: 9/30부터 시작하는 비게임 미니앱 전체 점검에서 "테스트 프로모션 키를
그대로 사용하는 경우"가 반복 위반 사례로 명시됐다. 콘솔에서 실제 promotionCode 발급받아
`VITE_PROMOTION_CODE`에 반영하기 전엔 배포하지 말 것.

---

## 2026-09-10 커밋 / 2026-09-10 11:05 출시 (번들 20260910-122, PR #32) — apps-in-toss SDK 3.x 마이그레이션

번들 122로 위 프로모션 SDK 연동 항목과 함께 출시.

### 🔧 SDK 2.6.1 → 3.4.0 업그레이드

앱인토스 공지(2026-10-05부터 SDK 3.x 미만 미니앱 신규 등록 제한) 대응. **3.x 전환 후 2.x로
롤백 불가**라 공식 마이그레이션 가이드 + 패키지 타입 선언을 직접 확인해 리스크를 서면으로
확정한 뒤 진행(`requestReview`/`share`/`contactsViral`/`loadFullScreenAd` 등 기존 플랫 함수
호출 12개는 3.4.0에서도 deprecated 표시만 붙고 그대로 동작 확인, 코드 변경 없음).

- `granite.config.ts` → `apps-in-toss.config.ts`로 파일명·필드 변경(`webView`/`webBundleDir`로
  개명, `web` 블록 삭제 — `package.json` `build` 스크립트가 `vite build && ait build`로 직접
  체이닝하도록 변경).
- `@toss/tds-mobile`/`@toss/tds-mobile-ait` 2.4.1로 동반 업그레이드(공식 가이드 요구사항).
- `generateHapticFeedback` import 출처를 `@apps-in-toss/web-bridge`(3.x 안정 버전 없음) →
  `@apps-in-toss/web-framework`로 변경. 함수 자체는 그대로 export됨(3.4.0 타입 선언 확인).

검증: `tsc --noEmit`·`vitest`(41/41)·`npm run dev` 브라우저 렌더링·`npm run build`
(`vite build && ait build`, `.ait` 산출물 확인) 전부 통과.

변경 파일: `package.json`, `package-lock.json`, `apps-in-toss.config.ts`(신규,
`granite.config.ts` 삭제), `src/lib/feedback.ts`

### 📌 8/25 Origin 복귀 공지 대응 확인

앱인토스가 8/25부터 미니앱 Origin을 3.x 임시 Origin에서 2.x 때 Origin으로 되돌리면서 안내한
두 조치를 확인:

- **localStorage 병합**: 머니터미는 2.6.1 → 3.4.0으로 바로 이동했고 중간에 문제였던
  3.0.0~3.1.0 임시 Origin으로 출시한 적이 없어 해당 없음(병합할 구 데이터 자체가 없음).
- **CORS 허용 Origin**: `supabase/functions/{naver-news,toss-register-push}`의 Edge Function
  둘 다 `Access-Control-Allow-Origin: '*'`(전체 허용)이라 코드 변경 불필요. 다만 Supabase
  **Auth URL Configuration**(대시보드 설정, 코드로 확인 불가)에
  `https://moneytermi.apps.tossmini.com`/`https://moneytermi.private-apps.tossmini.com`가
  등록돼 있는지는 아래 체크리스트 항목대로 직접 확인 필요.

---

## 2026-08-31 커밋 / 2026-08-31 18:45 출시 (번들 20260831-121, PR #31) — TDS 전역 CSS 리셋 버그 수정

번들 121이 PR #29(실천 기능 제거)·#30(캐릭터 키우기+RLS)·#31(이 항목)을 한꺼번에 묶어 출시.
콘솔 생성일시 2026-08-31 15:44 (SDK 2.6.1) → 18:45 출시. 생성~출시 3시간 1분.

### 토스 콘솔 출시노트 (사용자 노출용 — 아래 평문 그대로 등록)

```
이번 업데이트 주요 내용

[더 깔끔해진 화면]
버튼 모양과 화면 간격을 다듬어서 더 보기 편하게 만들었어요.
```

### 🐛 TDS 전역 CSS 리셋에 씹히던 margin/radius/font-size 수정

`@toss/tds-mobile`이 주입하는 unlayered 리셋(부트스트랩 리부트 스타일)이 Tailwind 유틸리티보다
항상 이겨서, `p`/`h1-h6`의 margin, `button`의 border-radius, `button`/`input`의
font-size·line-height가 화면 곳곳에서 조용히 무시되고 있었다. 예: CTA 버튼이 `text-sm`(14px)
지정에도 실제로는 16px로, `rounded-button` 지정에도 각진 모서리로 렌더링되던 문제.

정리 범위: `p`/`h1-h6` margin 유틸리티 22곳에 Tailwind v4 `!important` 문법(`mb-3!` 등) 적용
(10개 파일), `index.css`에 `button.rounded-*`/`button·input.text-*` 전역 오버라이드 추가,
`--radius-button`을 9999px(완전 pill)에서 16px로 변경(카드/칩과 통일), LeagueScreen 리워드
버튼 2개는 margin 대신 flex `gap`으로 간격 처리.

변경 파일: `src/index.css`, `src/pages/{ReviewScreen,QuizScreen,LeagueScreen,MyPageScreen,
CourseScreen,CourseWordListScreen,HomeScreen,WordCardScreen}.tsx`,
`src/components/mypage/{GuideSheet,AttendanceCalendar,SettingsSheet}.tsx`

---

## 2026-08-31 커밋 / 2026-08-31 18:45 출시 (번들 20260831-121, PR #30) — 랭크 → 캐릭터 키우기 전환 + profiles RLS 보안 강화

번들 121로 PR #29·#30(이 항목)·#31과 함께 출시. 상세는 위 PR #31 항목 참고.

### 토스 콘솔 출시노트 (사용자 노출용 — 아래 평문 그대로 등록)

```
이번 업데이트 주요 내용

[캐릭터 키우기로 새단장]
다른 사람과 순위를 겨루던 리그 대신, 내 캐릭터를 알개미부터 슈퍼개미까지
직접 키우는 방식으로 바꿨어요. 학습할수록 캐릭터가 자라나요.
```

### 🎮 랭크 시스템 제거, 솔로 캐릭터 성장으로 전환

다른 유저와 순위를 비교하던 리더보드를 없애고, 기존 5단계 이름(알개미~슈퍼개미)을 재활용한
솔로 성장 시스템으로 교체. 성장 단계는 `getGrowthStage(points)`로 클라이언트가 직접 계산
(새 RPC 불필요, `points`는 이미 서버 권위). 친구초대/광고 리워드 버튼은 그대로 유지, 위치만
이동. 하드코딩돼 있던 `CURRENT_LEAGUE_ID=1` 버그도 함께 해소(지금까지 모든 유저가 항상
"알개미"로만 보였음).

변경 파일: `src/constants.ts`, `src/pages/LeagueScreen.tsx`, `src/pages/LeagueRulesScreen.tsx`,
`src/context/AppContext.tsx`, `src/pages/HomeScreen.tsx`, `src/pages/QuizScreen.tsx`,
`src/pages/MyPageScreen.tsx`, `src/components/NavBar.tsx`, `src/utils/league.ts`(삭제)

### 🔒 profiles SELECT를 본인 행만 허용하도록 강화

캐릭터 키우기 전환으로 다른 유저 프로필을 읽던 마지막 코드(리그 리더보드)가 사라지면서
`profiles_select_public(USING (true))`이 근거 없는 과다 노출 상태가 됐던 것을 본인 행만
허용하도록 좁힘. 남아있던 유일한 타 유저 조회(닉네임 중복 체크)는 `is_nickname_taken`
SECURITY DEFINER RPC로 이전. 게스트 최초 생성 시 `getGuestClient`로 x-guest-token 헤더를
실어야 하는 부작용도 함께 수정(안 그러면 신규 가입이 깨짐).

변경 파일: `src/hooks/useAuth.tsx`, `src/lib/database.types.ts`,
`supabase/migration_profiles_select_own.sql`(신규, 운영 DB 실행 완료)

---

## 2026-08-31 커밋 / 2026-08-31 18:45 출시 (번들 20260831-121, PR #29) — 실천 기능 제거

번들 121로 PR #30·#31과 함께 출시. 상세는 위 PR #31 항목 참고.

### 토스 콘솔 출시노트 (사용자 노출용 — 아래 평문 그대로 등록)

```
이번 업데이트 주요 내용

[더 간단해진 화면]
자주 쓰이지 않던 메뉴를 정리해서 화면 구성을 더 간단하게 만들었어요.
```

### 🗑 실천(Actions) 기능 제거

제품 개념이 애매하다는 판단으로 전체 제거. 하단 탭이 6개(홈/코스/리그/퀴즈/실천/MY)에서
5개(홈/코스/리그/퀴즈/MY)로 줄었다.

정리 범위: 네비게이션 탭, `/actions` 라우트, `WordCardScreen`의 "🎯 실천하기" CTA,
`AppContext`의 관련 상태/함수 7개(`allActions`/`myActions`/`actionsByWord`/`addAction`/
`addCustomAction`/`toggleAction`/`removeAction`), `types.ts`의 `ActionTemplate`/`ActionStatus`/
`UserAction`, `database.types.ts`의 테이블 타입, MyPage FAQ 2건, 문서 3곳
(`README.md`/`docs/APP_INTRO.md`/`docs/DATA_STRUCTURE.md`).

`actions`/`user_actions` 테이블 자체는 DB에 그대로 둠 — 미사용 상태로 보존, 드롭은 별도 요청 시.

변경 파일: `src/pages/ActionsScreen.tsx`(삭제), `src/components/ActionPickerSheet.tsx`(삭제),
`src/App.tsx`, `src/components/NavBar.tsx`, `src/pages/WordCardScreen.tsx`,
`src/context/AppContext.tsx`, `src/types.ts`, `src/lib/database.types.ts`,
`src/components/mypage/GuideSheet.tsx`

---

## 2026-08-30 커밋 / 2026-08-31 09:43 출시 (번들 20260830-118, PR #28) — 리워드 광고 연동

콘솔 생성일시 2026-08-30 20:32 (SDK 2.6.1) → 09:43 출시. 생성~출시 13시간 11분.

### 토스 콘솔 출시노트 (사용자 노출용 — 아래 평문 그대로 등록)

```
이번 업데이트 주요 내용

[광고 보고 포인트 받기]
광고를 끝까지 보면 포인트를 받을 수 있어요. 리그 화면에서 확인해보세요.
```

### 🎬 리워드 광고 (Google AdMob)

`loadFullScreenAd`/`showFullScreenAd` 연동. 콘솔 "인앱 광고" 메뉴에서 발급한 adGroupId를 env로
주입하며, 미설정 시 기능 자체가 숨겨진다(`VITE_REWARDED_AD_GROUP_ID`).

리워드 지급 방어 방식은 친구 초대 리워드와 동일 — `userEarnedReward` 이벤트에 중복/위조 방지 키가
없어서, 서버 RPC `claim_ad_reward`가 1회 최대 50P·일일 합계 최대 200P로 클램프한 뒤 적립한다.
광고 시청은 반복이 정상 패턴이라(친구초대와 달리 "이미 보냄" 같은 자연스러운 상한이 없음) 별도
`ad_rewards` 테이블로 일일 상한을 관리한다.

### 🐛 버그 수정 — 리워드 광고 버튼 클릭 시 크래시

`loadFullScreenAd.isSupported()` 호출 자체가 토스 앱 밖(브라우저/미지원 환경)에서 예외를 던지는데,
`try/catch` 바깥에 있어 클릭하는 즉시 uncaught error로 앱이 죽었다. `requestAppReview` 등 기존
"미지원 시 무시" 함수들처럼 검사 자체를 `try` 블록 안으로 옮겨서 해결.

변경 파일: `src/lib/ads.ts`(신규), `src/context/AppContext.tsx`(`claimAdReward`),
`src/pages/LeagueScreen.tsx`(광고 시청 버튼), `supabase/migration_ad_reward.sql`(신규, 운영 DB 실행 완료)

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
- [x] Supabase Auth URL Configuration에 origin 등록:
      `https://moneytermi.apps.tossmini.com`, `https://moneytermi.private-apps.tossmini.com`.
      (2026-09-10 대시보드에서 직접 확인 — 둘 다 Redirect URLs에 이미 등록됨)
- [ ] 모든 테이블 RLS 활성 상태 재확인.
- [ ] (실기기 확인) `intoss://moneytermi/word-card` 딥링크 진입 시 단어 정상 표시.
- [ ] (실기기 확인) 노치/홈 인디케이터 영역 침범 없음(SafeAreaInsets).
- [ ] (실기기 확인) 리뷰 프롬프트 노출 조건 동작.
- [ ] (출시 후) 콘솔 분석 대시보드에서 이벤트 수집 확인(+1일, 프로덕션만 집계).
- [ ] 남은 출시 항목은 `APPS_IN_TOSS_TODO.md` 참고(특히 A-1 토스 로그인 연동).

> 참고: `package.json` 버전은 현재 `0.0.0`. 출시 시 버전 정책 확정 필요.
