CI/CD 명령어 사용하기
콘솔에 접속하지 않고 CLI를 통해 앱 번들을 업로드할 수 있어요.

CI/CD 사용 가능한 SDK 버전

CI/CD 명령어를 통한 자동 업로드는 SDK v1.4.0 이상에서 지원돼요.
이전 버전의 SDK를 사용 중이라면 먼저 SDK를 업그레이드 해주세요.

먼저 콘솔에서 API 키를 발급해주세요.
전체 앱 또는 특정 앱 단위로 접근 권한을 설정할 수 있어요.

접속 경로:
워크스페이스 선택 → 좌측 메뉴에서 키

이미지

이미지

아래 명령어를 실행해 앱 번들을 업로드하세요.
정상적으로 업로드가 되었다면, 테스트용 앱스킴을 확인할 수 있어요.


npx ait deploy --api-key {API 키}
API 키를 등록해두면 반복 입력할 필요가 없어요.


npx ait token add
npx ait deploy
필요에 따라 아래 명령어를 사용해보세요.

명령어	용도
npx ait token --help	도움말 보기
npx ait token add [워크스페이스명] [API 키]	토큰 등록하기
npx ait token remove [워크스페이스명]	등록된 토큰 삭제하기
npx ait deploy [워크스페이스명] [API 키]	번들 업로드하기
3. 앱 출시 전 피처 테스트
intoss:// 스킴은 앱이 정식 출시된 이후에만 접근 가능해요.
출시 전 기능 테스트를 위해서는 업로드 시 생성된 테스트 스킴(QR 코드) 를 활용해야 해요.

테스트 시 디버깅이 필요하다면?

디버깅하기 문서를 확인하여 보다 빠르게 이슈를 해결하세요.

WebView
React Native
① QR 코드에서 deploymentId 확인하기
앱 번들을 업로드할 때마다 새로운 deploymentId가 발급돼요.
테스트 스킴에서는 _deploymentId 는 필수 파라미터예요.

예시 :


intoss-private://appsintoss?_deploymentId=0198c000-68c3-7d2b-0000-2c00000005ec
② 스킴에 path/query 적용하여 테스트하기
하위 path를 적용한 경우 :

intoss-private://appsintoss/path/pathpath?_deploymentId=0198c000-68c3-7d2b-0000-2c00000005ec
쿼리 파라미터를 적용한 경우 : queryParams는 반드시 URL-encoding이 필요해요.

intoss-private://appsintoss?_deploymentId=0198c000-68c3-7d2b-0000-2c00000005ec&queryParams=%7B%22categoryKey%22%3A%22
문제 해결 가이드
iOS에서 흰 화면이 보이나요?
샌드박스에서는 정상 동작하지만 토스앱 내에서 흰 화면이 표시된다면, 아래 항목을 순서대로 점검해보세요.

1. Sentry로 오류를 감지하고 모니터링하세요
런타임 에러가 발생했지만 바로 확인되지 않는 경우가 있어요.
Sentry를 통해 에러를 수집하고, 실제 사용자 환경에서 발생하는 오류를 추적해보세요.
Sentry 가이드 확인하기

2. 메모리 및 리소스 사용량을 점검하세요
토스앱 내에서는 메모리 제약으로 인해 앱이 정상적으로 렌더링되지 못하고 흰 화면이 표시될 수 있어요.

이미지, 폰트 등 리소스 용량을 줄여 빌드 파일을 최적화하세요.
분할 로딩 구조를 적용해 초기에는 반드시 필요한 파일만 로딩하고, 이후 필요한 리소스를 순차적으로 불러오도록 구성해보세요.
불필요한 객체 생성이나 메모리 누수가 없는지 점검하세요.
3. Unity로 개발한 경우
Unity 기반 미니앱은 일반 웹앱보다 리소스 사용량이 높을 수 있어, 별도의 성능 최적화가 필요해요.
아래 가이드를 참고해 토스앱 환경에 맞게 최적화해 주세요.

Unity 최적화 가이드 확인하기

Unity 최적화 가이드에서는 다음과 같은 항목을 다루고 있어요.

런타임 성능 최적화
시작 최적화
로딩 최적화
리소스 최적화 및 로딩 전략
성능 분석 도구 활용
플랫폼별 최적화
메모리 최적화
렌더링 최적화
파티클 시스템 최적화
토스앱에서 통신이 되지 않는 경우
1. CORS 설정 확인
Origin 허용 목록에 다음 도메인을 등록하세요.

https://<appName>.apps.tossmini.com : 실제 서비스 환경
https://<appName>.private-apps.tossmini.com : 콘솔 QR 테스트 환경
2. App Transport Security (ATS) 설정 확인
샌드박스에서는 HTTP 요청이 허용되지만, 라이브 환경에서는 HTTPS만 허용됩니다.
HTTP 기반 API는 토스앱 내에서 차단됩니다.

3. iOS 서드파티 쿠키 차단 정책 확인
iOS/iPadOS 13.4 이상에서는 서드파티 쿠키가 완전히 차단돼요.
쿠키 기반 로그인 대신 토큰 기반 인증 방식을 적용하세요.

자주 묻는 질문

토스앱에서 미니앱이 열리지 않아요.
토스앱 하위 버전에서 오류가 발생할 수 있어요 최신 버전의 토스앱에서 테스트를 진행해 주세요.


"잠시 문제가 생겼어요" 문구가 노출되고 있어요.
granite.config.ts 파일에서 icon 값을 채운 상태에서 빌드된 ait 파일인지 확인해주세요. appInToss 플러그인 내의 brand 값이 모두 포함된 상태여야 합니다.


export default defineConfig({
  appsInToss({
    brand: {
      // 👈 brand 값에 빈 값이 없도록
    },
  }),
});
