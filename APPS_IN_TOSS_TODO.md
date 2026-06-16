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

### A-4. RLS 적용 유지 확인
- **현재 상태**: 적용됨. profiles/word_progress/daily_missions/attendance RLS 활성
  (`supabase/schema.sql`), 콘텐츠 테이블은 public read.
- **권장 조치**: 배포 전 모든 테이블 RLS 활성 상태 재확인(필수 정책).
- **근거**: [Supabase 연동](https://developers-apps-in-toss.toss.im/supabase/intro.md)

---

## B. 권장 (안정성 / UX)

### B-1. 푸시 딥링크 경로 버그 수정 — ✅ 완료
- **조치 내역**:
  - `src/lib/landing.ts` `ALLOWED_PATHS`에 `/word-card` 추가.
  - `src/App.test.ts` 테스트 분리(word-card 허용 / course-words null).
  - `src/pages/WordCardScreen.tsx` — state 없는 콜드 딥링크 진입 시 미완료 코스 우선으로
    기본 단어 로드(HomeScreen `nextCourse` 패턴 재사용), 콘텐츠 로딩 중에는 리다이렉트 보류.
- **남은 확인(실기기)**: word-card 딥링크 진입 시 단어 정상 표시.
- **근거**: [인앱 기능/딥링크 테스트](https://developers-apps-in-toss.toss.im/development/test/function.md)

### B-2. SafeAreaInsets 적용 — ✅ 완료
- **조치 내역**:
  - 신규 `src/hooks/useSafeAreaInsets.ts` — `SafeAreaInsets.get()` 초기값 +
    `SafeAreaInsets.subscribe()` 구독, 웹/미지원 환경은 0 폴백(try/catch).
  - `src/App.tsx` 루트 컨테이너에 `paddingTop: insets.top`(상태바/노치 회피).
  - `src/components/NavBar.tsx` 하단 패딩 `pb-6` → `paddingBottom: 24 + insets.bottom`(홈 인디케이터 회피).
- **남은 확인(실기기)**: 노치/홈 인디케이터 영역 침범 없음.
- **근거**: [Safe Area](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/화면%20제어/safe-area.md)

### B-3. requestReview(앱 리뷰 요청) 도입 — ✅ 완료
- **조치 내역**:
  - 신규 `src/lib/review.ts` `requestAppReview()` — `requestReview.isSupported()` 가드 + try/catch.
  - 호출 지점: `claimReward` 성공 직후(`AppContext.tsx`), 퀴즈 완료 시(`QuizScreen.tsx`,
    `ReviewScreen.tsx`, 빈 큐 가드). 노출은 플랫폼이 제어하므로 게이팅 없음.
- **남은 확인(실기기)**: 노출 조건 충족 시 리뷰 프롬프트 표시.
- **근거**: [requestReview](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/인터렉션/requestReview.md)

### B-4. UX / 디자인 가이드 점검
- **현재 상태**: 탭 5개(홈/코스/리그/퀴즈/MY, `src/components/NavBar.tsx`)로 2~5개 기준 충족,
  해요체 사용, `navigationBar.withBackButton: true` 설정됨. 다크모드 대응·로고 규격은 확인 필요.
- **권장 조치(확인 필요)**:
  - 로고 600x600 직각(둥근 모서리 X), 라이트/다크 배경 모두 식별 가능 여부
  - 앱 진입 즉시 모달/바텀시트 노출 금지(현재 동의는 결과 화면 카드로 보여 OK로 판단)
  - 다이얼로그 항상 닫기 가능, 뒤로가기 차단 금지
  - 다크모드 대응 여부(현재 라이트 톤 위주로 보임)
- **근거**: [UI/UX 가이드](https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md),
  [UX 라이팅](https://developers-apps-in-toss.toss.im/design/ux-writing.md),
  [해상도 가이드](https://developers-apps-in-toss.toss.im/design/resolution.md)

### B-5. 번들 크기 / 리소스 확인
- **현재 상태**: 확인 필요.
- **권장 조치**: 빌드 번들 100MB(비압축) 이하 유지, 큰 리소스는 CDN/지연 로딩으로 분리.
- **근거**: [미니앱 출시](https://developers-apps-in-toss.toss.im/development/deploy.md)

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

### C-4. Analytics 이벤트 로깅
- **현재 상태**: Sentry(에러 모니터링)만 사용. 행동 분석 없음.
- **권장 조치(확인 필요)**: 핵심 퍼널(코스 시작/단어 학습/퀴즈 완료/보상 수령) 이벤트 로깅.
  단, AIT Analytics 컴포넌트 예제는 React Native 기준이므로 웹 프레임워크 적용 방식
  (콘솔 이벤트 로깅 포함)을 먼저 확인.
- **근거**: [이벤트 로깅](https://developers-apps-in-toss.toss.im/analytics/logging.md),
  [Analytics](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/분석/Analytics.md)

### C-5. 수익화(광고 / IAP / 토스페이)
- **현재 상태**: 미사용.
- **권장 조치**: 무료 학습 앱 특성상 현재 불필요. 향후 도입 시 광고는 AIT 네이티브 포맷,
  디지털 재화는 IAP, 실물/결제는 토스페이만 사용해야 함(정책).
- **근거**: [인앱 광고](https://developers-apps-in-toss.toss.im/ads/intro.md),
  [인앱 결제](https://developers-apps-in-toss.toss.im/iap/intro.md),
  [토스페이](https://developers-apps-in-toss.toss.im/tosspay/intro.md)

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
