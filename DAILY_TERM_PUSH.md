# DAILY_TERM_PUSH - 오늘의 단어 푸시

매일 09:00 알림 동의 사용자에게 "오늘의 경제 용어" 푸시를 보낸다.

## 발송 방식: "토스에게 발송 요청" (서버리스 정기발송, 현재 채택)

발송은 **토스 콘솔의 스마트 발송 캠페인**이 담당한다("토스에게 발송 요청" 방식). 앱은 **알림 동의문 동의만**
받으면 되고, 발송 대상(동의자) 타게팅과 스케줄은 토스가 한다. 따라서 토스 로그인/`userKey`/mTLS/직접 API/사업자등록이 필요 없다.
**단, "토스에게 발송 요청"은 알림 동의문 연결이 필수다.**

> 직접 API 발송(대안)은 사용자별 정수 `userKey`(토스 로그인 `appLogin`으로만 획득) + 서버 간 mTLS
> 클라이언트 인증서 + 사업자등록이 모두 필요하다. 게스트 기반 앱에 그 마찰을 더하지 않으려고
> 서버리스 "토스에게 발송 요청"을 택했다.

### 콘솔 캠페인 설정 (STEP 1)

- 발송 방법: 토스에게 발송 요청하기
- 발송 코드(기능성 캠페인 templateSetCode): `moneytermi-DAILY_TERM_PUSH` (`moneytermi-` 접두사는 콘솔이 자동 부여)
- 제목: 오늘의 용어 / 내용: 오늘의 경제 용어가 도착했어요.
- 이동 URL: `intoss://moneytermi/word-card`
- 발송 계획: 정기발송 / 매일 / 09:00 / 종료일 없음
- 알림 동의문: "오늘의 용어 일일 학습 알림 동의문" 연결
- 저장 -> 소재 검수 요청 (2~3 영업일)

## 앱 코드 (STEP 2)

- `src/hooks/useNotificationAgreement.ts`
  - `requestNotificationAgreement({ options: { templateCode: 'moneytermi-DAILY_TERM_PUSH' } })` 만 호출
  - `templateCode`는 콘솔에 등록된 코드와 정확히 일치해야 동의 UI가 뜬다. 토스 문서가
    "동의문 코드"와 "캠페인 발송 코드"를 혼용하지만, 현재 콘솔엔 캠페인 발송 코드
    `moneytermi-DAILY_TERM_PUSH` 하나만 존재하므로 그 값을 쓴다.
  - `appLogin`/userKey 등록 없음
  - 동의 여부는 Supabase가 아닌 로컬 Storage에 저장 (UI 토글 표시용일 뿐, 발송 모수는 토스가 관리)
- `src/components/mypage/SettingsSheet.tsx`
  - 마이페이지 "학습 알림 동의" 토글에서 `requestAgreement` 호출

### 동의 노출 위치 (동의율 = 발송 모수)

- [x] 마이페이지 "학습 알림 동의" 토글
- [ ] 첫 학습 완료 직후 1회 (마이페이지만으론 도달률 낮음) - 미구현

## 보관 자산 (STEP 3, 미배포)

직접 API 발송으로 되돌릴 때 재사용하려고 보관만 한다. **배포하지 않는다.**

- `supabase/functions/daily-term-push/` - 직접 발송 함수 (미배포)
- `supabase/functions/toss-register-push/` - userKey 등록 함수 (미배포)
- `supabase/migration_push_subscriptions.sql`
  - `profiles.toss_user_key`, `notification_agreed` 컬럼은 둬도 무방 (재사용 대비)
  - pg_cron 스케줄은 주석 처리 상태 유지 (비활성)

## 검증 (STEP 4)

- 검수 승인 -> 콘솔에서 캠페인 활성화
- 본인 계정으로 알림 동의 -> 다음날 09:00 푸시 도달 확인
- 도달 안 되면 채널톡 문의
