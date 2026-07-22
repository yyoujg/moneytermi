# 머니터미 (moneytermi)

토스 미니앱으로 제공되는 금융 경제 용어 학습 앱이에요.
카드 스와이프, 퀴즈, 리그 시스템을 통해 경제 용어를 재미있게 익힐 수 있어요.

## 주요 기능

- **홈**: 오늘의 학습 현황 및 추천 코스 (신규 유저는 첫 학습 CTA, 앱 진입 시 출석 자동 체크)
- **코스**: 주제별 경제 용어 학습 (경제, 금융)
- **단어 카드**: 단어별 상세 설명 + 실시간 뉴스 연동 + 관련 용어 링크
- **스와이프**: 카드 넘기기 방식의 단어 학습
- **퀴즈**: 객관식 퀴즈로 복습
- **리그**: 티어 기반 경쟁 시스템 (알개미 → 슈퍼개미)
- **복습**: SM-2 lite 간격반복(SRS)으로 "오늘 복습할 단어"만 출제
- **실천**: 단어 카드에서 담은 실천 항목을 체크리스트로 관리
- **마이페이지**: 학습 기록 및 설정 (효과음/진동, 다크모드, 학습 알림 동의)

## 문서

- [앱 소개 (APP_INTRO.md)](./docs/APP_INTRO.md)
- [데이터 구조 (DATA_STRUCTURE.md)](./docs/DATA_STRUCTURE.md)
- [데일리 용어 푸시 (DAILY_TERM_PUSH.md)](./docs/DAILY_TERM_PUSH.md)
- [Apps in Toss 적용 항목 (APPS_IN_TOSS_TODO.md)](./docs/APPS_IN_TOSS_TODO.md)
- [출시 노트 (RELEASE_NOTES.md)](./docs/RELEASE_NOTES.md)

## 기술 스택

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- React Router DOM v7
- Supabase (인증, DB, Edge Functions)
- Sentry (에러 모니터링)
- Apps in Toss (앱인토스) Web Framework

## 개발 환경 설정

```bash
npm install
npm run dev
```

## 빌드 및 배포

```bash
# 빌드
npm run build

# 배포 (API 키 직접 입력)
npx ait deploy --api-key {API_KEY}

# 또는 토큰 등록 후 배포
npx ait token add
npx ait deploy
```

CI/CD는 GitHub Actions로 자동화되어 있어요.
`main` 브랜치에 push하면 자동으로 빌드 후 배포가 실행돼요.

## 출시 전 테스트

빌드 후 생성된 테스트 스킴(QR 코드)으로 토스앱 내에서 테스트할 수 있어요.

```
intoss-private://appsintoss?_deploymentId={deploymentId}
```

## 환경 변수

`.env.example`을 `.env`로 복사한 뒤 값을 채워주세요.

| 변수명 | 설명 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon 키 |
| `VITE_SENTRY_DSN` | Sentry DSN (선택) |
| `AIT_DEV_HOST` | 실기기 QR 테스트용 개발 서버 LAN IP (선택, 기본 `0.0.0.0`) |

Edge Function에서 쓰는 아래 키는 `.env`가 아니라 Supabase 대시보드
(Edge Functions > Secrets)에서 설정해요.

| 변수명 | 사용처 |
|--------|--------|
| `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | `naver-news` |
| `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` | `daily-term-push` |

## GitHub Secrets

| 시크릿명 | 설명 |
|----------|------|
| `AIT_API_KEY` | 앱인토스 콘솔 API 키 |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon 키 |
