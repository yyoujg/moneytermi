# Apps in Toss 적용 항목 목록

[Apps in Toss 개발자 문서](https://developers-apps-in-toss.toss.im/)를 검토해 moneytermi에
적용해야 할 항목을 우선순위별로 정리한 실행용 체크리스트.

각 항목: 현재 상태 / 권장 조치 / 근거 문서.
"확인 필요"는 코드만으로 단정할 수 없어 콘솔/실기기 점검이 필요한 항목.

> 🔒 = **사업자등록 필요** (인앱 광고·인앱 결제·토스페이·프로모션·비즈월렛·토스 로그인). 그 외는 불필요.

---

## A. 필수 (정책 준수 / 출시 차단 요소)

### A-1. 토스 로그인 도입 또는 연동 검토 — 🔒 사업자등록 필요
- **현재 상태**: 순수 게스트 인증만 사용. Supabase `guest_token`(localStorage)으로 식별
  (`src/hooks/useAuth.tsx`). 토스 로그인 미연동.
- **문제**: 정책상 미니앱 로그인은 "토스 로그인만" 허용되며 자체/간편 로그인 단독 사용은
  제한됨. 단 기능성 푸시 자체는 **"토스에게 발송 요청"(서버리스) 방식이면 토스 로그인 불필요**
  (`moneytermi-DAILY_TERM_PUSH2`는 이 방식으로 운영). 토스 로그인이 필수가 되는 경우는 직접 API
  발송(userKey 필요)·프로모션·토스페이 도입 시다. 부수적으로 게스트 토큰은 기기 변경/재설치 시
  소실되어 학습 진행도가 유실됨.
- **권장 조치**: 토스 로그인 연동 후 `userKey`로 사용자 식별. 기존 게스트 프로필을
  토스 로그인 계정으로 승격하는 플로우 설계(`profiles.auth_id`/`link_guest_to_auth`
  활용 가능). 콘솔에서 토스 로그인 약관 동의, 동의 scope, 이용약관/개인정보처리방침 등록,
  연결 해제 콜백 처리.
- **근거**: [로그인 소개](https://developers-apps-in-toss.toss.im/login/intro.md),
  [로그인 개발](https://developers-apps-in-toss.toss.im/login/develop.md),
  [사용자 식별키 발급](https://developers-apps-in-toss.toss.im/user-hash-key/develop.md)

---

## C. 선택 (성장 / 마케팅 / 수익화)

### C-1. Segments + Smart Message 고도화
- **현재 상태**: 콘솔 기능성 캠페인(`moneytermi-DAILY_TERM_PUSH2`) "토스에게 발송 요청"만 사용.
- **권장 조치**: 세그먼트 기반 타게팅 발송으로 확장(토스 로그인 연동 전제, A-1 의존).
- **근거**: [세그먼트](https://developers-apps-in-toss.toss.im/segment/intro.md),
  [스마트 메시지 개발](https://developers-apps-in-toss.toss.im/smart-message/develop.md)

### C-2. 공유 리워드 / 프로모션 — 🔒 프로모션은 사업자등록 필요 (공유 리워드는 불필요)
- **현재 상태**: 미사용.
- **권장 조치**: 친구 초대 리워드, 프로모션 캠페인으로 재방문/획득 강화.
- **근거**: [공유 리워드](https://developers-apps-in-toss.toss.im/reward/intro.md),
  [프로모션](https://developers-apps-in-toss.toss.im/promotion/intro.md)

### C-3. 수익화(광고 / IAP / 토스페이) — 🔒 사업자등록 필요
- **현재 상태**: 미사용.
- **권장 조치**: 무료 학습 앱 특성상 현재 불필요. 향후 도입 시 광고는 AIT 네이티브 포맷,
  디지털 재화는 IAP, 실물/결제는 토스페이만 사용해야 함(정책).
- **근거**: [인앱 광고](https://developers-apps-in-toss.toss.im/ads/intro.md),
  [인앱 결제](https://developers-apps-in-toss.toss.im/iap/intro.md),
  [토스페이](https://developers-apps-in-toss.toss.im/tosspay/intro.md)

---

## E. 앱인토스 콘솔 설정 (배포 전 필요 — 구체)

콘솔: https://apps-in-toss.toss.im/ (토스 비즈니스 계정 필요, 워크스페이스는 사업자당 1개)
아래는 콘솔에서 직접 입력/설정해야 하는 항목. 코드만으로는 처리 불가.

### E-1. 토스 로그인 설정 (A-1 연동 시 필수) — 🔒 사업자등록 필요
- **약관 동의 화면** 구성(최초 로그인 시 노출)
- **요청 사용자 정보 scope** 선택 — 최소 필요만. 가능 항목: `user_email`, `user_name`,
  `user_phone`, `user_birthday`, `user_gender`, `user_nationality`, `user_ci`.
  (학습앱은 식별 위주이므로 최소 scope 권장; 콘솔에서 선택+사용자 동의분만 반환됨)
- **이용약관 / 개인정보처리방침 URL** 등록
- **복호화 키 + AAD**: 콘솔이 이메일로 발급 → 서버에 안전 보관(사용자 정보 복호화용, 클라 노출 금지)
- **연결 해제(unlink) 콜백**: 콜백 URL + Basic Auth 자격증명 등록(GET/POST 지원)
- 참고: 기능성 푸시(스마트 메시지 `moneytermi-DAILY_TERM_PUSH2`)는 "토스에게 발송 요청" 방식이라 **토스 로그인 불필요**(A-1). 배포 완료.

### E-2. 스마트 메시지(기능성 푸시) — DAILY_TERM_PUSH 상세 절차
경로: 콘솔 → 워크스페이스 → 미니앱 → 좌측 **스마트 메시지**.
구조는 2종 템플릿: **알림 동의문**(consent, code) + **기능성 메시지 캠페인**(templateSetCode).
데일리 용어는 매일 09:00 반복·고정 문구이므로 **콘솔 발송("토스에 발송 요청")** 방식 사용(동의문 연결 필수).

> 정정(2026-06): 콘솔엔 별도 "동의문 코드" 없이 기능성 캠페인 발송 코드
> `moneytermi-DAILY_TERM_PUSH2` 하나만 존재한다. 토스 문서가 동의문 코드/캠페인 발송 코드를
> 혼용하나, 앱의 `requestNotificationAgreement({ templateCode })`에는 콘솔에 실재하는 코드
> (`moneytermi-DAILY_TERM_PUSH2`)를 넣어야 동의 UI가 뜬다. 발송은 "토스에게 발송 요청"이라
> 앱이 발송 API를 직접 호출하지 않는다(서버/userKey/mTLS 불필요).

**1) 알림 동의문 등록** (스마트 메시지 → 알림 동의 탭 → 등록)
- 동의문 제목(~하기 형): `오늘의 용어 학습 알림 받기`
- 안내 문구: `매일 오전 9시, 그날의 새로운 경제 용어를 학습할 수 있도록 '오늘의 용어' 알림을 보내드려요.`
  (발송 시점 + 상황·목적을 함께 적어야 검수 통과. 불명확 단어 금지)
- 발송 시점/방식: 정해진 시간(매일 09:00 KST)
- **코드: `moneytermi-DAILY_TERM_PUSH2`** — `src/hooks/useNotificationAgreement.ts`의 TEMPLATE_CODE와 반드시 일치
- 서비스명/수신거부/고객센터 문구는 자동 포함
- 반려 이력: 캠페인 34372 1차 반려(발송 시점·목적 누락 + 불명확 단어 "치치카") → 위 문구로 보강

**2) 기능성 메시지 캠페인 생성** (스마트 메시지 → 기능성 캠페인 → 생성 → "토스에 발송 요청")
- 캠페인 제목: 예) `오늘의 용어 데일리 푸시`
- 제목(≤7자, 명사형): `오늘의 용어`
- 내용(≤25자, "~요." 종결, 변수 2자 계산): `오늘의 경제 용어가 도착했어요.`
- 이동 URL: `intoss://moneytermi/word-card` (코드 ALLOWED_PATHS 반영 완료)
- 알림 동의문 연결: 1)의 `오늘의 용어 학습 알림 받기` 동의문 선택(콘솔 발송은 동의 필수)
- 발송: 반복(매일 09:00), 캠페인 기간은 넉넉히

**3) 검수 요청** → 텍스트 심사 2~3영업일(+ 최적화 테스트 최대 7일)

**콘텐츠 규칙**: 비게임은 "토스에서" 포함, 문장형·마침표·맞춤법. 금지: 은어/밈, 개인명,
과장(단독/긴급), 정치·범죄·불안 유발.
**제약**: 캠페인당 최대 10만건, 활성 중 기간 변경 불가(최적화 리셋), 이동 URL이 다르면 별도 캠페인.
(콘솔 UI 라벨은 버전에 따라 다를 수 있음)

---

## F. 콘솔 작업 순서 (사업자등록 기준)

원칙(공식 [사업자 등록](https://developers-apps-in-toss.toss.im/prepare/register-business.md)):
**사업자등록은 필수 아님.** 단 **인앱 광고 / 인앱 결제 / 토스페이 / 프로모션 / 비즈월렛 /
토스 로그인** 사용 시에만 필수. 사업자등록 없이 가능: 워크스페이스 생성, 앱 등록·개발,
세그먼트, 푸시 알림, 게임 프로필, 리더보드, 공유 리워드, 테스트.

### 1단계 — 사업자등록 불필요 (✅ 앱 출시 완료)
워크스페이스/앱 등록/테스트/검수/출시 완료. 남은 콘솔 작업:
- **스마트 메시지(푸시) 템플릿** (E-2) — ✅ 등록·운영 중 (`moneytermi-DAILY_TERM_PUSH2`)
- (선택) **세그먼트** (C-1)

### 2단계 — 사업자등록 필요 (등록 후)
- **토스 로그인** (A-1 / E-2) — oauth2ClientId, scope, 약관·개인정보 URL, 복호화 키, unlink 콜백
- **프로모션**(C-2 일부), **수익화** 광고/IAP/토스페이(C-3)
- 정책 주의: "미니앱 로그인은 토스 로그인만 허용" → 로그인 도입 시 사업자등록 필수.
  현재 게스트라 미적용으로 1단계 출시 가능. 기능성 푸시(스마트 메시지)는 토스 로그인 없이 운영 중이며, 계정 동기화·정밀 타게팅이 필요할 때만 로그인 검토.

---

## D. 이미 적용됨 (참고)

- Storage 추상화(AIT Storage + localStorage 폴백) — `src/lib/storage.ts`
- 햅틱 피드백 `generateHapticFeedback` — `src/lib/feedback.ts`
- `closeView`, `graniteEvent` backEvent 처리 — `src/App.tsx`, `src/hooks/useAuth.tsx`
- 딥링크 파싱 `getSchemeUri` + `parseLandingPath` — `src/App.tsx`, `src/lib/landing.ts`
- `navigationBar.withBackButton`, brand(displayName/primaryColor/icon) — `granite.config.ts`
- TDS + `TDSMobileAITProvider` — `src/main.tsx`
- 푸시 동의 `requestNotificationAgreement` — `src/hooks/useNotificationAgreement.ts`
- Sentry 에러 모니터링, Supabase RLS
