# Apps in Toss 적용 항목 목록

[Apps in Toss 개발자 문서](https://developers-apps-in-toss.toss.im/)를 검토해 moneytermi에
적용해야 할 항목을 우선순위별로 정리한 실행용 체크리스트.

각 항목: 현재 상태 / 권장 조치 / 근거 문서.
"확인 필요"는 코드만으로 단정할 수 없어 콘솔/실기기 점검이 필요한 항목.

---

## A. 필수 (정책 준수 / 출시 차단 요소)

### A-1. 토스 로그인 도입 또는 연동 검토
- **현재 상태**: 순수 게스트 인증만 사용. Supabase `guest_token`(localStorage)으로 식별
  (`src/hooks/useAuth.tsx`). 토스 로그인 미연동.
- **문제**: 정책상 미니앱 로그인은 "토스 로그인만" 허용되며 자체/간편 로그인 단독 사용은
  제한됨. 또한 기능성 푸시/알림/프로모션/토스페이를 쓰려면 토스 로그인 연동이 필수.
  현재 `DAILY_TERM_PUSH` 기능성 푸시를 사용 중이므로 연동 필요성이 큼. 부수적으로 게스트
  토큰은 기기 변경/재설치 시 소실되어 학습 진행도가 유실됨.
- **권장 조치**: 토스 로그인 연동 후 `userKey`로 사용자 식별. 기존 게스트 프로필을
  토스 로그인 계정으로 승격하는 플로우 설계(`profiles.auth_id`/`link_guest_to_auth`
  활용 가능). 콘솔에서 토스 로그인 약관 동의, 동의 scope, 이용약관/개인정보처리방침 등록,
  연결 해제 콜백 처리.
- **근거**: [로그인 소개](https://developers-apps-in-toss.toss.im/login/intro.md),
  [로그인 개발](https://developers-apps-in-toss.toss.im/login/develop.md),
  [사용자 식별키 발급](https://developers-apps-in-toss.toss.im/user-hash-key/develop.md)

### A-2. Supabase 도메인 allowlist 설정
- **현재 상태**: 콘솔 측 도메인 허용 설정 여부 확인 필요. 앱은 `VITE_SUPABASE_URL`/
  `VITE_SUPABASE_ANON_KEY`로 클라이언트 생성(`src/lib/supabase.ts`).
- **권장 조치**: Supabase Authentication > URL Configuration에 운영/QA origin 등록.
  - 운영: `https://moneytermi.apps.tossmini.com`
  - QA: `https://moneytermi.private-apps.tossmini.com`
- **근거**: [Supabase 연동](https://developers-apps-in-toss.toss.im/supabase/intro.md),
  [미니앱 출시](https://developers-apps-in-toss.toss.im/development/deploy.md)

### A-3. 출시 정책 적합성 점검
- **현재 상태**: 경제 용어 학습 앱. 가상자산/투자자문/금융상품 중개/도박/외부 결제·앱
  설치 유도 등 금지 항목에 해당하지 않는 것으로 보임.
- **권장 조치**: 출시 전 금지 항목 재확인. 용어 콘텐츠가 생성형 AI로 만들어진 경우라도
  런타임 생성형 AI는 사용하지 않으므로 "AI 생성 결과물 표기" 의무는 해당 없음으로 판단되나
  콘솔 심사 기준으로 최종 확인.
- **근거**: [서비스 오픈 정책](https://developers-apps-in-toss.toss.im/intro/guide.md),
  [서비스별 주의사항](https://developers-apps-in-toss.toss.im/intro/caution.md)

---

## B. 권장 (안정성 / UX)

### B-1. UX / 디자인 가이드 점검 — 부분 완료
- **점검 결과(코드 확인 완료)**:
  - 탭 5개(홈/코스/리그/퀴즈/MY, `src/components/NavBar.tsx`) -> 2~5개 기준 충족 ✅
  - 해요체 사용, `navigationBar.withBackButton: true` 설정 ✅
  - 진입 즉시 모달/바텀시트 없음 ✅ — App/main/HomeScreen 마운트 시 자동 오픈 없음.
    `DailyAlarmPromptCard`는 결과 화면 인라인 카드(QuizScreen:130, ReviewScreen:98)
  - 로고: `public/logo.png` 600x600 확인 ✅ (둥근모서리/라이트·다크 배경 가독성은 육안 잔여)
- **다크모드 — light-only 명시 선언으로 처리**: `index.html`에 `color-scheme: light` /
  `theme-color: #F97316` 메타, `src/index.css` `:root { color-scheme: light }` 추가 →
  OS/웹뷰 강제 다크 반전·UA 폼 컨트롤 다크 렌더 방지. 전면 다크 테마(하드코딩 색 298개
  토큰화)는 별도 작업/디자인 결정 필요(미대응).
- **남은 확인(콘솔/육안)**: 콘솔 등록 아이콘(brand.icon 원격 URL) 규격, 로고 배경 대비.
- **근거**: [UI/UX 가이드](https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md),
  [UX 라이팅](https://developers-apps-in-toss.toss.im/design/ux-writing.md),
  [해상도 가이드](https://developers-apps-in-toss.toss.im/design/resolution.md)

---

## C. 선택 (성장 / 마케팅 / 수익화)

### C-1. 공유(친구 초대 / 리그 공유) — ⏸ 보류 (패키지 미지원)
- **현재 상태**: 미사용. 구현 시도했으나 설치된 `@apps-in-toss/web-framework` v2.6.1의
  export에 `share`/`getTossShareLink`가 **없음**(RN prebuilt 번들에만 존재, 웹 브리지 미노출).
  현재 패키지로는 구현 불가.
- **권장 조치(차단 해소 후)**: 프레임워크가 웹 공유를 노출하는 버전으로 업그레이드 후
  `getTossShareLink(url, ogImageUrl)` + `share({ message })`로 리그 순위/초대 공유. OG 이미지 준비.
  ```ts
  import { share, getTossShareLink } from '@apps-in-toss/web-framework';
  const link = await getTossShareLink('intoss://moneytermi/league', ogImageUrl);
  await share({ message: link });
  ```
- **근거**: [getTossShareLink](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/공유/getTossShareLink.md),
  [share](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/공유/share.md),
  [OG 이미지](https://developers-apps-in-toss.toss.im/marketing/open-graph.md)

### C-2. Segments + Smart Message 고도화
- **현재 상태**: 콘솔 템플릿(`DAILY_TERM_PUSH`) 발송만 사용.
- **권장 조치**: 세그먼트 기반 타게팅 발송으로 확장(토스 로그인 연동 전제, A-1 의존).
- **근거**: [세그먼트](https://developers-apps-in-toss.toss.im/segment/intro.md),
  [스마트 메시지 개발](https://developers-apps-in-toss.toss.im/smart-message/develop.md)

### C-3. 공유 리워드 / 프로모션
- **현재 상태**: 미사용.
- **권장 조치**: 친구 초대 리워드, 프로모션 캠페인으로 재방문/획득 강화.
- **근거**: [공유 리워드](https://developers-apps-in-toss.toss.im/reward/intro.md),
  [프로모션](https://developers-apps-in-toss.toss.im/promotion/intro.md)

### C-4. 수익화(광고 / IAP / 토스페이)
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

### E-1. 앱 기본 정보 / 에셋 등록
- **앱 이름**(토스 내 노출명): `머니터미`
- **appName(ID)**: `moneytermi` — intoss:// 스킴에 사용, **등록 후 변경 불가**. `granite.config.ts`의 appName과 일치시킬 것
- **앱 유형**: 비게임
- **한 줄 소개(subtitle) / 상세 설명**: 서비스 흐름·핵심 경험 기술 (APP_INTRO.md 내용 활용)
- **연령 등급**: 19세 (현 플랫폼 기준)
- **고객지원**: 이메일 / 전화 / 상담 URL 중 입력
- **앱 로고**: 600x600 PNG, **배경 있음(투명 X)**, 다크모드에서도 식별 가능 — `public/logo.png`(600x600 확인됨) 또는 `brand.icon` URL과 동일 이미지
- **썸네일**: 1932x828 PNG (핵심 기능 노출)
- **스크린샷(선택)**: 세로 636x1048 3장+ 또는 가로 1504x741 1장+
- **카테고리**: 실제 서비스에 맞게(교육/경제 등)
- **브랜드 색상**: `#F97316` (`granite.config.ts` brand.primaryColor와 일치)

### E-2. 토스 로그인 설정 (A-1 연동 시 필수)
- **약관 동의 화면** 구성(최초 로그인 시 노출)
- **요청 사용자 정보 scope** 선택 — 최소 필요만. 가능 항목: `user_email`, `user_name`,
  `user_phone`, `user_birthday`, `user_gender`, `user_nationality`, `user_ci`.
  (학습앱은 식별 위주이므로 최소 scope 권장; 콘솔에서 선택+사용자 동의분만 반환됨)
- **이용약관 / 개인정보처리방침 URL** 등록
- **복호화 키 + AAD**: 콘솔이 이메일로 발급 → 서버에 안전 보관(사용자 정보 복호화용, 클라 노출 금지)
- **연결 해제(unlink) 콜백**: 콜백 URL + Basic Auth 자격증명 등록(GET/POST 지원)
- 참고: 기능성 푸시(`DAILY_TERM_PUSH`) 사용 중 → 정책상 토스 로그인 연동 필요(A-1)

### E-3. 스마트 메시지(기능성 푸시) 템플릿 — DAILY_TERM_PUSH (C-2 관련)
콘솔 > 스마트 메시지에서 발송 템플릿 등록:
- **발송 코드(templateCode)**: `DAILY_TERM_PUSH` (`src/hooks/useNotificationAgreement.ts`의 TEMPLATE_CODE와 일치)
- **제목**: 최대 7자(공백 포함), 명사형, "~하기" 회피 → 예: `오늘의 용어`
- **내용**: 최대 25자(공백 포함), "~요." 종결(변수는 2자 계산) → 예: `오늘의 경제 용어가 도착했어요.`
- **이동 URL**: `intoss://moneytermi/word-card` (제출 전 동작 확인 — 코드 ALLOWED_PATHS에 `/word-card` 반영 완료)
- **알림 동의문**: 스마트 메시지 > 알림 동의 탭에서 등록, 발송 조건/주기(매일 09:00 KST) 설정
- 템플릿 텍스트 심사 2~3영업일 소요

### E-4. 도메인 allowlist (A-2, Supabase 측 — 콘솔 아님)
- Supabase Authentication > URL Configuration에 origin 등록:
  - 운영: `https://moneytermi.apps.tossmini.com`
  - QA: `https://moneytermi.private-apps.tossmini.com`
- 출시 전 필수(콘솔이 아닌 Supabase 대시보드 설정이지만 함께 처리).

### E-5. 출시(검토 요청)
- 모든 필드/에셋 입력 후 콘솔 **"검토 요청하기"** 클릭 → 승인 1~2영업일
  (스마트 메시지 텍스트 심사는 2~3영업일 별도)
- 출시 정책 금지항목(가상자산/투자자문/금융상품 중개/외부결제·앱설치 유도) 미해당 재확인(A-3)
- 배포 Supabase에 마이그레이션 전체 적용 확인(schema/content/league_rls/points_integrity)

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
