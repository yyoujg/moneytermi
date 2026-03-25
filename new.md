한 눈에 보기

Copy as Markdown

Download as Markdown
이 페이지는 앱인토스 SDK에서 제공하는 주요 기능을 한 번에 살펴볼 수 있도록 정리한 가이드예요.

SDK에 어떤 기능들이 있는지 빠르게 훑어보고
게임 미니앱 / 비게임 미니앱에서 각각 어떤 기능을 주로 사용하는지 참고하고
WebView(WV)와 React Native(RN) 환경에서 사용할 수 있는 기능을 한눈에 확인할 수 있어요.
확인하세요

표의 '지원 환경'은 WV = WebView, RN = React Native를 의미해요.
'추천 대상'은 일반적인 사용 사례를 기준으로 한 권장 분류이며, 서비스 특성에 따라 달라질 수 있어요.
카테고리	기능	지원 환경	추천 대상	설명
화면 구조 · 내비게이션	화면 이동(라우팅)	RN	게임, 비게임	화면 전환, 히스토리 관리, 파라미터 전달 등 라우팅을 처리해요
화면 구조 · 내비게이션	레이아웃	RN	게임, 비게임	여러 페이지에서 반복되는 UI 요소(헤더, 내비게이션 바, 푸터 등)를 일관성 있게 관리하기 위한 구조를 설명해요
화면 구조 · 내비게이션	내비게이션 바 설정	WV, RN	게임, 비게임	앱인토스 내비게이션 바를 설정하는 방법이에요
스타일	Flex	RN	게임, 비게임	가로와 세로 방향 배치, 정렬, 중앙 정렬를 간편하게 구성해요
스타일	Spacing	RN	게임, 비게임	요소 사이의 간격을 쉽게 조절해요
스타일	Stack	RN	게임, 비게임	일정 간격으로 자식 요소를 배치하는 레이아웃 컴포넌트예요
스타일	margin	RN	게임, 비게임	컴포넌트의 외부 여백을 간결하게 지정하는 유틸이에요
스타일	padding	RN	게임, 비게임	컴포넌트의 안쪽 여백을 간결하게 지정하는 유틸이에요
스타일	Overlay	RN	게임, 비게임	모달, 바텀시트, 다이얼로그 등 별도의 UI 레이어를 표시할 때 사용해요
UI 컴포넌트	Image	RN	게임, 비게임	비트맵(png, jpg 등)이나 벡터(svg) 이미지를 불러와 화면에 표시해요
UI 컴포넌트	Lottie	RN	게임, 비게임	Lottie JSON 파일을 불러와 애니메이션을 재생해요
UI 컴포넌트	BlurView	RN	비게임	iOS에서만 지원되는 블러(Blur) 효과를 제공해요
UI 컴포넌트	Video	RN	게임, 비게임	비디오를 재생해요
이벤트 제어	뒤로가기 버튼 이벤트 감지하기	WV, RN	비게임	내비게이션 바의 뒤로가기 버튼 이벤트를 제어해요
화면 제어	Safe Area 여백 구하기	WV, RN	게임, 비게임	화면의 안전 영역(Safe Area) 여백 값을 확인해요
화면 제어	스크롤 뷰에서 요소 감지하기	RN	비게임	특정 요소가 화면에 일정 비율 이상 나타나면 onImpressionStart 콜백이 호출돼요
화면 제어	화면 방향 설정하기	WV, RN	게임	기기의 화면 방향을 설정하는 기능을 제공해요
화면 제어 > 노출/가시성 감지하기	요소 노출 감지하기	RN	비게임	화면에 요소가 보이기 시작하거나 화면에서 사라지는 것을 감지해요
화면 제어 > 노출/가시성 감지하기	컴포넌트 노출 감지하기	RN	비게임	특정 컴포넌트가 화면에 보이는지 여부를 감지해서 외부에 알려주는 컴포넌트예요
화면 제어 > 노출/가시성 감지하기	스크롤 영역 노출 감지하기	RN	비게임	스크롤 중 특정 요소가 화면에 보이거나 사라지는 상태를 감지할 수 있어요
화면 제어 > 노출/가시성 감지하기	리스트 항목 노출 감지하기	RN	비게임	리스트의 각 항목이 화면에 나타나는지 여부를 쉽게 확인하고 처리할 수 있어요
화면 제어 > 노출/가시성 감지하기	화면 보임 여부 확인하기	RN	게임, 비게임	화면이 현재 사용자에게 보이는지 여부를 알 수 있어요
화면 제어 > 노출/가시성 감지하기	가시성 변경 감지하기	RN	게임, 비게임	페이지나 컴포넌트가 사용자에게 보이는지 여부가 변경될 때 감지할 수 있어요
화면 제어 > 내비게이션 제어하기	화면 닫기	WV, RN	게임, 비게임	현재 화면을 닫는 함수에요
화면 제어 > 내비게이션 제어하기	iOS 스와이프 설정하기	WV	비게임	iOS에서 화면을 스와이프하여 뒤로가기 기능을 활성화하거나 비활성화할 수 있어요
화면 제어 > 내비게이션 제어하기	뒤로가기 이벤트 제어하기	RN	비게임	뒤로 가기 이벤트를 등록하고 제거할 수 있는 컨트롤러 객체를 반환하는 Hook이에요
화면 제어	화면 항상 켜짐 설정하기	WV, RN	게임	화면이 항상 켜져 있도록 설정하거나 해제하는 기능이에요
화면 제어	화면 캡처 차단하기	WV, RN	비게임	네이티브 수준에서 화면 캡처를 차단하거나 허용할 수 있어요
화면 제어	쿼리 파라미터 사용하기	RN	비게임	지정된 라우트에서 파라미터를 가져오는 훅이에요
화면 제어	화면 복귀 후 코드 실행하기	RN	게임, 비게임	화면 전환을 하고 돌아왔을 때 다음 코드를 동기적으로 실행할 수 있도록 도와주는 훅이에요
화면 제어	외부 URL 열기	WV, RN	비게임	지정한 URL을 기기의 기본 브라우저나 연결된 앱에서 열 수 있는 유틸리티예요
WebView 속성 제어하기	-	WV	게임, 비게임	스크롤 동작, 미디어 재생 방식, 제스처 사용 여부 등 사용자 경험에 직접적인 영향을 주는 WV 속성을 상황에 맞게 조정할 수 있어요
인터랙션	스크롤 바운스 영역 배경 처리	RN	비게임	iOS ScrollView에서 스크롤이 끝에 도달했을 때 발생하는 바운스 효과 영역(위/아래)에 배경색을 채워 보다 자연스러운 시각 효과를 제공하는 컴포넌트예요
인터랙션	색상 모드 타입	RN	비게임	현재 기기의 색상 모드(라이트/다크)를 나타내는 타입이에요
인터랙션	키보드 위로 요소 올리기	RN	비게임	키보드가 나타날 때 자식 컴포넌트를 자동으로 키보드 위로 올려주는 레이아웃 컴포넌트예요
인터랙션	오디오 포커스 변경 콜백	RN	게임	비디오나 오디오 컴포넌트의 오디오 포커스가 변경될 때 호출되는 콜백 타입이에요
인터랙션	햅틱 진동 실행하기	WV, RN	게임, 비게임	디바이스에서 햅틱 진동을 발생시키는 함수예요
인증 · 로그인	토스 로그인 - 인가 코드 받기	WV, RN	비게임	토스 앱의 인증 흐름을 사용해 로그인을 수행하고, 로그인이 성공하면 인가 코드를 반환해요
인증 · 로그인	토스 로그인 연동 확인	WV, RN	게임	현재 유저가 토스 로그인과 연동된 유저인지 여부를 확인해요
인증 · 로그인	게임 로그인 - 유저 식별자 받기	WV, RN	게임	게임 미니앱에서 유저 식별자를 확인해요
인증 · 로그인	토스 인증 - 인증 화면 호출	WV, RN	게임, 비게임	토스 인증 화면을 호출해요
콘텐츠 > 공통	공유 리워드 (게임/비게임)	WV, RN	게임, 비게임	사용자가 친구에게 미니앱을 공유하고, 그 결과에 따라 리워드를 지급해요
콘텐츠 > 공통 > 공유하기	토스앱 공유 링크 만들기	WV, RN	게임, 비게임	사용자가 지정한 경로를 토스 앱에서 열 수 있는 공유 링크로 변환해주는 유틸이에요
콘텐츠 > 공통 > 공유하기	메시지 공유하기	WV, RN	게임, 비게임	사용자가 콘텐츠를 쉽게 공유할 수 있도록, 네이티브 공유 시트를 표시해요
콘텐츠 > 게임	프로모션(토스 포인트)	WV, RN	게임	게임 로그인을 통해 받은 유저 식별자 값을 사용해 프로모션(토스 포인트) 기능을 실행해요
콘텐츠 > 게임	게임 리더보드	WV, RN	게임	사용자의 게임 점수를 집계하고, 순위를 확인할 수 있어요
콘텐츠 > 결제	토스 페이	WV, RN	비게임	토스 페이 결제창을 띄우고, 사용자 인증을 수행해요
콘텐츠 > 결제	인앱 결제	WV, RN	게임, 비게임	인앱 결제 함수를 제공해요
콘텐츠 > 인앱 광고 2.0 ver2	전면형/리워드 광고	WV, RN	게임, 비게임	통합 인앱 광고 함수를 제공해요
콘텐츠 > 인앱 광고 2.0 ver2	배너 광고(WebView)	WV	게임, 비게임	배너 광고 함수를 제공해요
콘텐츠 > 인앱 광고 2.0 ver2	배너 광고(React Native)	RN	게임, 비게임	배너 광고 함수를 제공해요
콘텐츠	인앱 광고 2.0	WV, RN	게임, 비게임	구글 애드몹 인앱 광고 함수를 제공해요
분석	사용자 행동 기록하기	WV, RN	게임, 비게임	분석(로깅) 함수를 제공해요
권한	필요한 권한 설정하기	WV, RN	비게임	토스앱에서 쓸 수 있도록 권한을 설정하는 방법을 안내해요
디바이스 > 위치 정보	현재 위치 가져오기	WV, RN	비게임	디바이스의 현재 위치 정보를 가져와요
디바이스 > 위치 정보	실시간 위치 추적하기	WV, RN	비게임	디바이스의 위치 정보를 지속적으로 감지하고, 위치가 변경되면 콜백을 실행해요
디바이스 > 위치 정보	훅으로 위치 사용하기	RN	비게임	디바이스의 위치 정보를 반환하는 훅이에요
디바이스	네이티브 저장소 이용하기	WV, RN	게임, 비게임	네이티브의 저장소를 사용해요
디바이스	카메라로 사진 촬영하기	WV, RN	비게임	카메라를 실행해서 촬영된 이미지를 반환해요
디바이스	앨범 가져오기	WV, RN	비게임	사용자의 앨범에서 사진 목록을 불러와요
디바이스	클립보드	WV, RN	게임, 비게임	클립보드에 저장된 텍스트를 가져오고 복사해요
디바이스	파일 저장하기	WV, RN	비게임	문자열로 인코딩된 Base64 데이터를 지정한 파일 이름과 MIME 타입으로 사용자 기기에 저장해요
디바이스	연락처 가져오기	WV, RN	비게임	사용자의 연락처 목록을 페이지 단위로 가져와요
네트워크 · 환경 > 네트워크	네트워크 연결 상태 확인하기	WV, RN	게임, 비게임	디바이스의 현재 네트워크 연결 상태를 가져와요
네트워크 · 환경 > 네트워크	http 통신하기	WV, RN	게임, 비게임	네트워크 통신을 하는 방법을 소개해요
네트워크 · 환경 > 환경 확인	기기 고유식별자 확인하기	WV, RN	게임, 비게임	사용 중인 기기의 고유 식별자를 문자열로 반환해요
네트워크 · 환경 > 환경 확인	애플리케이션 환경 확인하기	WV, RN	게임, 비게임	샌드박스 환경인지 토스앱 환경인지 반환해요
네트워크 · 환경 > 환경 확인	토스앱 버전 가져오기	WV, RN	게임, 비게임	토스 앱 버전을 가져와요
네트워크 · 환경 > 환경 확인	앱 최소 버전 확인하기	WV, RN	게임, 비게임	현재 토스 앱 버전이 지정한 최소 버전 이상인지 확인해요
네트워크 · 환경 > 환경 확인	실행중인 플랫폼 확인하기	WV, RN	게임, 비게임	현재 실행 중인 플랫폼을 확인해요
네트워크 · 환경 > 환경 확인	스킴 값 가져오기	WV, RN	비게임	처음에 화면에 진입한 스킴 값을 반환해요
네트워크 · 환경 > 환경 확인	서버 시간 가져오기	WV, RN	게임, 비게임	토스 앱 서버 기준의 현재 시간을 반환해요
언어(로케일)	로케일 가져오기	WV, RN	게임, 비게임	현재 사용자의 로케일(local) 정보를 가져와요
게임에 추천하는 기능
게임 미니앱에서 자주 사용되며,
게임 플레이 흐름과 사용자 경험에 직접적인 영향을 주는 주요 기능들을 정리했어요.

게임 출시 가이드를 확인하세요

게임 미니앱 출시 전 반드시 확인해야 하는 체크리스트예요.
출시 가이드를 지키지 않으면 심사 과정에서 반려될 수 있으니, 반드시 확인하세요.

특히 아래 항목은 게임 미니앱에서 필수로 고려해야 하는 사항이에요.

풀스크린 구성 :
사용자의 몰입도를 높이기 위해 게임 화면은 풀스크린으로 구현해야 해요.
Safe Area 함수를 사용해 상·하단 레터박스가 생기지 않도록 구성하고,
내비게이션 바가 게임 화면의 버튼이나 UI 요소와 겹치지 않도록 주의해 주세요.
사운드 처리 :
사운드는 필수는 아니지만, 게임 경험을 크게 향상시키는 요소예요.
백그라운드 전환 시 사운드가 중지되고,
다시 게임으로 돌아왔을 때 정상적으로 재생되도록 처리해 주세요.
카테고리	기능	지원 환경	권장도	설명
인증 · 로그인	게임 로그인 - 유저 식별자 받기	WV, RN	필수	게임 전용 유저 식별자(hash)를 사용해 랭킹, 프로모션 등 유저별 데이터를 안전하게 관리해요.
콘텐츠 > 게임	게임 리더보드	WV, RN	필수	플레이 후 점수 제출 · 순위 확인으로 경쟁 요소를 제공해 몰입도를 높여요
콘텐츠 > 게임	프로모션(토스 포인트)	WV, RN	권장	게임 식별자를 이용한 포인트/보상 지급. 이벤트, 로그인 보상 등에 유용해요
콘텐츠 > 공통	공유 리워드 (게임/비게임)	WV, RN	권장	초대/공유 완료 시 리워드 지급으로 바이럴 유입을 촉진해요
콘텐츠 > 공통 > 공유하기	토스앱 공유 링크 만들기	WV, RN	권장	게임 결과나 초대 링크를 토스앱에서 바로 열 수 있는 공유 링크로 생성해요.
콘텐츠 > 결제	인앱 결제	WV, RN	권장	아이템 판매 등 직접 수익화를 해보세요
콘텐츠 > 인앱 광고 2.0 ver2	전면형/리워드 광고	WV, RN	권장	통합 인앱 광고 함수를 제공해요
콘텐츠 > 인앱 광고 2.0 ver2	배너 광고(WebView)	WV	권장	배너 광고 함수를 제공해요
콘텐츠 > 인앱 광고 2.0 ver2	배너 광고(React Native)	RN	권장	배너 광고 함수를 제공해요
콘텐츠	인앱 광고 2.0	WV, RN	권장	전면형/보상형 광고를 통해 광고 기반 수익화를 해보세요
디바이스	네이티브 저장소 이용하기	WV, RN	필수	네이티브의 저장소를 사용하여 유저의 정보를 저장하세요
유저의 기기 변경 시 데이터 유실이 없도록 설계하세요
화면 제어	화면 항상 켜짐 설정하기	WV, RN	권장	방치형·플레이 지속형 게임에서는 화면이 꺼지지 않는게 좋아요
화면 제어	화면 방향 설정하기	WV, RN	권장	가로/세로 고정 등 게임 플레이에 맞는 화면의 방향을 설정해요
화면 제어	Safe Area 여백 구하기	WV, RN	필수	다양한 디바이스에서 UI가 가려지지 않도록 안전 영역을 고려하세요
인터랙션	오디오 포커스 변경 콜백	RN	권장	사운드/뮤트 상태 전환을 적절히 처리해 UX를 향상시켜요
인터랙션	햅틱 진동 실행하기	WV, RN	권장	디바이스에서 햅틱 진동을 발생시켜 게임의 몰입도를 높여요
분석	사용자 행동 기록하기	WV, RN	필수	플레이 데이터 분석, 이벤트 추적, A/B 테스트 등 게임 고도화의 필수 요소예요
네트워크 · 환경 > 환경 확인	서버 시간 가져오기	WV, RN	권장	토스 앱 서버 기준의 현재 시간을 반환해요

공통 설정

Copy as Markdown

Download as Markdown
지원환경:
React Native
React Native SDK
v1.0.3
WebView
WebView SDK
v1.0.3
실행환경:
Toss App
Sandbox App
미니앱에서 공통으로 사용하는 브랜드 정보, 호스트 설정, 권한, 빌드 옵션 등의 전역 설정을 한 곳에서 관리할 수 있어요.

이 문서에서는 WebView와 React Native 환경에서 미니앱을 시작하기 위해 반드시 필요한 기본 설정과 권장 설정을 설명해요.

기본 설정을 적용하면 내비게이션 바가 자동으로 표시돼요.
또한 내비게이션 바의 더보기 버튼을 통해 공유하기, 신고하기 등의 기본 기능을 별도 구현 없이 바로 사용할 수 있어요.

SDK 1.6.1 이후 변경 사항

SDK 1.6.1 버전부터 내부 운영 정책 변경으로 브릿지 뷰 기능이 제거되었어요.
이에 따라 브릿지 뷰의 색상 모드를 설정하던 bridgeColorMode 옵션은 더 이상 필요하지 않아요.

WebView 설정
appName : 콘솔에 등록한 앱 ID를 입력해 주세요.
displayName : 사용자에게 노출될 앱 이름을 입력해 주세요. 콘솔에 등록된 이름과 동일하게 입력해야 해요.
primaryColor : 앱의 기본 색상 값을 지정해 주세요. 지정한 색상은 버튼 등에 적용돼요.
icon : 앱의 로고 이미지 URL을 입력해 주세요. 콘솔의 앱 정보에서 업로드한 이미지를 우클릭해 링크 복사 후 넣어 주세요.
permissions : 권한이 필요한 경우 설정해 주세요. 필요한 권한 설정하기 문서를 참고해 주세요.
webViewProps.type : 미니앱에 맞게 내비게이션 바를 설정할 수 있어요.
게임 : game
비게임 : partner


게임

비게임

예시

interface defineConfig {
  appName: string; // 콘솔에 등록한 앱ID
  brand: {
    displayName: string; // 사용자에게 노출될 앱 이름
    primaryColor: string; // 브랜드 기본 색상(hex)
    icon: string; // 콘솔에서 업로드한 이미지의 URL(콘솔의 앱 정보에서 업로드한 이미지를 우클릭해 링크 복사 후 넣어주세요)
  };
  web: {
    host: string; // 개발 서버 호스트
    port: number; // 개발 서버 포트
    commands: {
      dev: string; // 실행 명령어
      build: string; // 빌드 명령어
    };
  };
  permissions: Permission[]; // 런타임 권한(필요 시 확장)
  outdir: string; // 빌드 산출물 경로
  webViewProps: {
    type: 'partner'; // 비게임
  };
}

화면 이동

Copy as Markdown

Download as Markdown
지원환경:
React Native
React Native SDK
v1.0.3
실행환경:
Toss App
Sandbox App
Granite 앱에서는 화면 전환, 히스토리 관리, 파라미터 전달 같은 라우팅을 간편하게 처리할 수 있어요. 내부적으로는 React Navigation을 기반으로 동작하므로, 익숙한 API로 바로 활용할 수 있습니다.

WebView 라우팅

WebView 환경에서는 프로젝트에 설정한 웹 라우터(예: React Router)의 규칙을 그대로 따릅니다.

라우팅 예제 구조
라우팅 예제는 총 3개의 페이지(page-a, page-b, page-c)로 구성되어 있어요.


root
├─── pages
│    ├─── page-a.tsx
│    ├─── page-b.tsx
│    └─── page-c.tsx
└─── src
     └─── ...
페이지 A: 화면 이동하기

useNavigation은 화면 간 이동을 처리할 때 사용해요. navigate 메서드로 이동할 화면의 경로와 필요한 데이터를 함께 전달할 수 있어요.


// page-a.tsx
import { createRoute, useNavigation } from '@granite-js/react-native';
import { StyleSheet, View, Text, Pressable } from 'react-native';

export const Route = createRoute('/page-a', {
  validateParams: (params) => params,
  component: PageA,
});

function PageA() {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate('/page-b');
  };

  return (
    <View style={[styles.container, { backgroundColor: '#3182f6' }]}>
      <Text style={styles.text}>Page A</Text>
      <Pressable onPress={handlePress}>
        <Text style={styles.buttonLabel}>B 페이지로 이동하기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  text: {
    color: 'white',
    fontSize: 24,
  },
  buttonLabel: {
    color: 'white',
  },
});
주요 포인트
useNavigation 훅을 사용해 navigation 객체를 가져와요.
navigation.navigate('/page-b')를 호출하면 'B' 페이지로 이동해요.
페이지 B: 이전 화면으로 돌아가기

goBack 메서드를 사용하면 이전 화면으로 돌아갈 수 있어요. 하지만 이전 화면 기록이 없는 경우에는 에러가 발생할 수 있으니, canGoBack으로 먼저 확인해야 해요.


// page-b.tsx
import { createRoute, useNavigation } from '@granite-js/react-native';
import { StyleSheet, View, Text, Pressable } from 'react-native';

export const Route = createRoute('/page-b', {
  validateParams: (params) => params,
  component: PageB,
});

function PageB() {
  const navigation = useNavigation();

  // 이전 화면으로 돌아가는 함수예요.
  const handlePressBackButton = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.warn('이전 화면으로 이동할 수 없습니다.');
    }
  };

  const handlePressNextButton = () => {
    navigation.navigate('/page-c', {
      message: '안녕!',
      date: new Date().getTime(),
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: '#fe9800' }]}>
      <Text style={styles.text}>Page B</Text>
      <Pressable onPress={handlePressBackButton}>
        <Text style={styles.buttonLabel}>이전으로 이동하기</Text>
      </Pressable>
      <Pressable onPress={handlePressNextButton}>
        <Text style={styles.buttonLabel}>C 페이지로 이동하기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  text: {
    color: 'white',
    fontSize: 24,
  },
  buttonLabel: {
    color: 'white',
  },
});
주요 포인트
canGoBack()으로 이전 화면이 있는지 확인하고, 있으면 goBack()을 호출해요.
navigate('/page-c', { message: '안녕!', date: new Date().getTime() })로 데이터를 전달하면서 'C' 페이지로 이동해요.
페이지 C: 전달받은 데이터 사용하기

Route.useParams 훅은 다른 화면에서 전달된 데이터를 가져올 때 사용해요.

이때, createRoute.validateParams 옵션을 설정하면 전달된 데이터를 타입 검증(Type-Safe)하면서 접근할 수 있어요. 이를 통해 잘못된 데이터 형식으로 인한 에러를 방지할 수 있어요.


// page-c.tsx
import { createRoute, useNavigation } from '@granite-js/react-native';
import { CommonActions } from '@granite-js/native/@react-navigation/native';
import { StyleSheet, View, Text, Pressable } from 'react-native';

export const Route = createRoute('/page-c', {
  validateParams: (params) => params as { message: string; date: number },
  component: PageC,
});

function PageC() {
  const navigation = useNavigation();
  const params = Route.useParams();
  // 또는 아래와 같이 사용할 수 있어요.
  // import { useParams } from '@granite-js/react-native';
  //
  // const params = useParams({
  //   from: '/page-b',
  // });

  const handlePressHomeButton = () => {
    navigation.dispatch((state) => {
      return CommonActions.reset({
        ...state,
        index: 0,
        routes: state.routes.filter((route) => route.name === '/page-a'),
      });
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: '#f04452' }]}>
      <Text style={styles.text}>{params.message}</Text> // [!code highlight]
      <Text style={styles.text}>{params.date}</Text> // [!code highlight]
      <View style={styles.line} />
      <Text style={styles.text}>Page C</Text>
      <Pressable onPress={handlePressHomeButton}>
        <Text style={styles.buttonLabel}>처음으로 이동하기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  text: {
    color: 'white',
    fontSize: 24,
  },
  buttonLabel: {
    color: 'white',
  },
});
주요 포인트
Route.useParams 훅을 사용하면 URL에서 전달된 데이터(매개변수)에 접근할 수 있어요.
createRoute.validateParams 옵션을 설정하면 데이터 타입을 검증하면서(Type-Safe) 안전하게 사용할 수 있어요.
화면 파라미터 타입 정의하기
페이지마다 아래와 같은 Route 컴포넌트를 정의해요. 여기서 validateParams 옵션은 해당 화면에서 받을 파라미터의 타입을 정의해요.


export const Route = createRoute('/page-c', {
  validateParams: (params) => params as { message: string; date: number },
  component: PageC,
});
위 코드에서 validateParams는 message와 date라는 두 필드를 포함한 매개변수를 타입으로 정의해요.

이를 통해 다른 코드에서 useNavigate나 useParams를 사용할 때, 타입 검사를 통해 필요한 경로와 전달해야 할 데이터를 명확히 알 수 있어요. 이렇게 하면 코드의 안전성과 가독성이 높아져요.

자동 타입 정의 생성
개발 모드에서는 pages/ 디렉토리에 파일이 추가되면 자동으로 타입 정의가 생성되므로 별도의 명령어를 실행하지 않아도 돼요.

생성된 파일 예시
자동으로 생성된 파일은 다음과 같아요. 이 파일은 자동 생성되므로 수동으로 수정할 필요가 없어요.


// src/router.gen.ts

/* eslint-disable */
// This file is auto-generated by @granite-js/react-native. DO NOT EDIT.
import { Route as _AboutRoute } from '../pages/about';
import { Route as _IndexRoute } from '../pages/';

declare module '@granite-js/react-native' {
  interface RegisterScreen {
    '/about': ReturnType<typeof _AboutRoute.useParams>;
    '/': ReturnType<typeof _IndexRoute.useParams>;
  }
}
주요 포인트
각 화면에서 받을 파라미터의 타입을 createRoute.validateParams 옵션으로 정의해두면, navigate와 params 사용 시 타입 검사를 받을 수 있어 더 안전하게 코드를 작성할 수 있어요.
개발 모드에서는 pages/ 디렉토리에 파일이 추가되면 타입 정의가 자동으로 생성되기 때문에 별도의 명령어 실행이 필요하지 않아요.
이렇게 React Navigation을 사용하면 화면 간 이동을 쉽게 처리할 수 있고, 데이터를 전달하거나 기록을 조작하는 기능을 통해 다양한 UX를 구현할 수 있어요. 또한 타입스크립트와 함께 사용하면 안전하고 견고한 코드를 작성할 수 있답니다.

라우팅 상태 초기화하기
navigate-state-1

페이지 A → 페이지 B → 페이지 C 순서로 이동한 직후의 상태는 아래와 그림과 같이 같이 나타낼 수 있어요.

navigate-state-1

페이지 A, 페이지 B, 페이지 C가 순서대로 routes 기록에 남아 있고, index 값은 마지막으로 이동한 페이지 C의 위치인 2를 가리켜요.

reset을 사용하면 화면 이동 기록을 초기화할 수 있어요. 예를 들어, '페이지 A → B → C'로 이동한 후에 '페이지 A'로 돌아가면서 B와 C 기록을 삭제하고 싶다면, CommonActions.reset을 사용해요.


navigation.dispatch(
  CommonActions.reset({
    index: 0,
    routes: [{ name: '/page-a' }],
  }),
);
navigate-state-2

주요 포인트
CommonActions.reset으로 특정 화면만 기록에 남기고 나머지 화면 기록을 삭제할 수 있어요.
레퍼런스
React Navigation 공식 문서
이전 버전 문서가 필요할 때

이전 버전의 문서는 화면 이동하기에서 확인할 수 있어요.

SDK 2.x 마이그레이션

Copy as Markdown

Download as Markdown
SDK 2.x 업데이트는 React Native 0.84 및 React 19 대응을 포함하는 메이저 업데이트예요.
토스앱의 React Native 업데이트가 예정되어 있어 SDK 1.x를 사용하는 경우 향후 정상 동작을 보장할 수 없어요.

앱인토스 파트너사는 SDK 2.x 로 반드시 마이그레이션해 주세요.

주의하세요

2026년 3월 23일 이후에는 SDK 1.x로 빌드한 앱 번들을 콘솔에 업로드할 수 없어요.
1.x 기반 프로젝트는 신규 배포 및 업데이트가 제한돼요.

기한 내 업데이트가 되지 않을 경우, 별도 연락 및 서비스 운영이 중단될 수 있어요.

최신 SDK 버전을 다운로드해주세요

릴리스 노트의 SDK 업데이트 탭에서 최신 버전을 확인한 후, 해당 버전을 다운로드하여 적용해주세요.

최신 SDK에는 일반적으로 다음 변경 사항이 포함되어 있어요.

보안 및 안정성 개선
신규 기능 및 API 추가
기존 버그 수정 및 deprecated 기능 정리
왜 마이그레이션이 필요한가요?
React Native 0.72는 보안 패치와 유지보수가 종료되었어요.
2026년 3월 30일 토스앱이 RN 0.84 기반으로 업데이트돼요.
런타임 및 브리지 레벨에서 하위 버전과의 호환이 보장되지 않아요.
안정성과 보안을 위해 최신 버전 사용이 필요해요.
적용 대상
다음에 해당하면 마이그레이션이 필요해요:

@apps-in-toss/framework 1.x 사용 프로젝트
@apps-in-toss/web-framework 1.x 사용 프로젝트
granite build 커맨드를 사용 중인 프로젝트
변경 사항 요약
1. 빌드 커맨드가 변경돼요
기존	변경
granite build	ait build
2. React / React Native 버전이 업데이트돼요
항목	변경 전	변경 후
React	18.x	19.2.3
React Native	0.72.x	0.84.0
Types	18.x	19.2.3
3. 의존성 구조가 변경돼요
SDK 2.x 에서는 React 및 React Native 버전이 업데이트되고, Granite 기반 패키지 구조가 새롭게 적용돼요.
자동 마이그레이션 명령어를 실행하면 아래 변경 사항이 함께 반영돼요.

주요 패키지 변경 내역
패키지	변경 전	변경 후
react	18.x	19.2.3
react-dom	18.x	19.2.3
react-native	0.72.x	0.84.0
@types/react	18.x	19.2.3
@types/react-dom	18.x	19.2.3
react-test-renderer	18.x	19.2.3
Granite 관련 패키지
패키지	변경 전	변경 후
@granite-js/react-native	-	1.0.4
@granite-js/native	-	1.0.4
@granite-js/plugin-core	-	1.0.4
@granite-js/plugin-env	-	1.0.4
@granite-js/plugin-hermes	-	1.0.4
@granite-js/plugin-router	-	1.0.4
@granite-js/plugin-micro-frontend	-	1.0.4
@granite-js/plugin-sentry	-	1.0.4
babel-preset-granite	-	1.0.3
@toss/tds-react-native	-	2.0.2
brick-module	-	0.5.0
WebView 마이그레이션
1. 프레임워크를 2.x 로 업데이트해 주세요
@apps-in-toss/web-framework의 버전을 2.x으로 업데이트해 주세요.


# npm
npm install @apps-in-toss/web-framework@2.0.5

# yarn
yarn add @apps-in-toss/web-framework@2.0.5

# pnpm
pnpm add @apps-in-toss/web-framework@2.0.5
2. 빌드 커맨드를 변경해 주세요
기존	변경
granite build	ait build
React Native 마이그레이션
1. 프레임워크를 2.x 버전으로 업데이트해 주세요
@apps-in-toss/framework의 버전을 2.x으로 업데이트해 주세요.


# npm
npm install @apps-in-toss/framework@2.0.5

# yarn
yarn add @apps-in-toss/framework@2.0.5

# pnpm
pnpm add @apps-in-toss/framework@2.0.5
2. 자동 마이그레이션을 실행해 주세요

# npx
npx ait migrate react-native-0-84-0

# yarn
yarn ait migrate react-native-0-84-0

# pnpm
pnpm ait migrate react-native-0-84-0
다음 항목이 자동으로 반영돼요:

package.json 의존성 버전 업데이트
babel.config.js 설정 업데이트
granite build → ait build 변경
3. 타입 오류를 확인해 주세요
React 19 및 React Native 0.84로 업그레이드로 일부 타입 정의가 변경되었어요.

마이그레이션 이후 아래 항목을 꼭 확인해 주세요:

React.FC 관련 타입 오류
children 타입 정의 변경
React 19 신규 API와의 충돌 여부
Strict Mode 관련 경고
React 19 업그레이드 가이드 문서를 참고해 주세요.

테스트 안내
RN 0.84 대응을 위해 2026년 3월 6일 업로드된 최신 샌드박스 앱이 배포되었어요.
반드시 3월 6일 업로드 버전 이상의 샌드박스 앱으로 테스트해 주세요.
최신 샌드박스 앱 다운로드 받기

현재 토스앱 환경에서는 RN 0.84 대응 테스트가 불가해요.
반드시 샌드박스 앱에서 테스트해 주세요.

구버전 샌드박스 앱에서는 RN 0.84 환경 검증이 정상적으로 이루어지지 않을 수 있어요.
테스트 전 샌드박스 앱 버전을 꼭 확인해 주세요.

참고하세요

미니앱 런칭 전 내부 검수 단계에서는 RN 0.84가 적용된 토스앱 환경에서 별도 테스트가 진행될 예정이에요.

마이그레이션 체크리스트
 SDK 2.x 로 업데이트했어요
 ait migrate react-native-0-84-0를 실행했어요
 타입 오류를 모두 수정했어요
 ait build로 빌드가 정상 동작해요
 최신 샌드박스 환경에서 테스트를 완료했어요
자주 묻는 질문
SDK 2.x 전환과 관련해 많이 문의 주시는 내용을 정리했어요.

📌 정책 및 전환 일정 관련
Q. SDK 1.x를 계속 사용하면 어떻게 되나요?
토스앱 RN 0.84 업데이트 이후 정상 동작을 보장할 수 없어요.
2026년 3월 23일 이후에는 1.x로 빌드한 번들을 콘솔에 업로드할 수 없어요.

기한을 지키지 않을 경우 별도 연락 및 서비스 운영이 중단될 수 있어요.

Q. 기존에 출시한 앱도 마이그레이션이 필요한가요?
네, 기존에 출시한 앱도 SDK 2.0.5로 업데이트가 필요해요.
3월 23일 이후에는 SDK 1.x 기반으로 신규 배포 및 업데이트가 불가해요.

Q. 3월 23일 이후 기존 사용자들은 어떻게 되나요?
이미 출시된 1.x 기반 미니앱은 기존 버전으로 계속 동작해요.
다만, 신규 업데이트는 불가해요.

Q. 토스앱을 업데이트하지 않은 사용자는 어떻게 되나요?
토스앱을 업데이트하지 않은 사용자는 기존 RN 0.72 기반 환경에서 계속 서비스를 이용하게 돼요.
내부적으로는 5월 말 기준 80~90% 이상의 사용자 전환을 예상하고 있어요.

Q. 토스앱 강제 업데이트 계획이 있나요?
5월 이후에도 업데이트 비율이 낮을 경우 강제 업데이트를 고려하고 있어요.
구체적인 일정은 확정되는 대로 별도 안내드릴 예정이에요.

Q. 미니앱 자체에서 구버전 차단 로직을 넣어도 되나요?
네, 가능합니다.
원격 제어 방식으로 특정 버전 이하를 차단하는 로직을 두는 것도 허용돼요.

Q. RN 0.84로 빠르게 전환한 배경이 궁금해요.
내부적으로 장기간 준비를 진행해왔고,
RN 0.84와 주요 서드파티 라이브러리 호환성 테스트를 내부적으로 완료했어요.

단계적으로 검증을 진행한 뒤 안정성이 확인되어 전환을 결정했어요.

🧪 테스트 및 출시 관련
Q. RN 0.84가 적용된 토스앱은 외부에서 테스트할 수 없나요?
현재 RN 0.84가 적용된 토스앱은 외부 테스트용으로 제공되지 않아요.
파트너사에서는 최신 샌드박스 앱에서 테스트해 주세요.

제출된 번들은 내부 검수 단계에서 RN 0.72 / 0.84 토스앱 환경 모두에서 Android / iOS 테스트를 진행해요.

Q. 검토 요청은 언제 넣으면 되나요?
샌드박스 테스트 및 토스앱 QR 테스트에서 이상이 없다면 바로 검토 요청해 주세요.
검토 요청이 접수되면 내부에서 RN 0.84 토스앱 환경에서도 추가 검증을 진행해요.

Q. RN 0.84가 적용된 토스앱은 언제 사용자에게 배포되나요?
3월 30일부터 점진적으로 배포될 예정이에요.
강제 업데이트가 아니기 때문에 사용자 설정에 따라 업데이트 시점이 달라질 수 있어요.

내부적으로는 5월 말 기준 80~90% 전환을 예상하고 있어요.

Q. WebView도 React 19로 반드시 올려야 하나요?
아니에요.
React Native 미니앱만 React 19로 업데이트가 필수예요.
WebView 미니앱은 React 18.x를 유지해도 괜찮아요.

Q. SDK 1.x 전용 샌드박스 앱은 제공되지 않나요?
별도의 SDK 1.x(0.72) 전용 샌드박스 앱은 제공하지 않아요.
최신 샌드박스 앱에서는 SDK 1.x 기반 미니앱 테스트가 지원되지 않아요.

반드시 SDK 2.x로 업데이트한 후 최신 샌드박스 앱에서 테스트해 주세요.

🛠 기술 이슈 및 문제 해결
Q. 자동 마이그레이션 후에도 오류가 발생해요.
React 19 및 RN 0.84 변경으로 인해 일부 수동 수정이 필요할 수 있어요.
빌드 로그를 확인해 타입 및 의존성 충돌을 해결해 주세요.

Q. SDK 2.0.5 마이그레이션 후 StackOverflowError가 발생해요.
메트로 서버 연결 문제로 발생하는 경우가 많아요.
adb reverse tcp:8081 tcp:8081 명령어가 정상 작동하는지 확인해 주세요.

Q. iOS 샌드박스에서 8081 포트 접속 시 오류가 발생해요.
현재 일부 환경에서 8081 포트 접속 시 오류가 발생하고 있어 수정 중이에요.
우선 IP 기반 접속으로 테스트해 주세요.

Q. 최신 샌드박스 앱 로그인이 되지 않아요.
아래 두 가지를 확인해 주세요:

콘솔 로그인 계정 및 비밀번호 만료 여부 확인
콘솔 계정에 문제가 없다면 채널톡으로 문의해주세요.

메트로 서버 연결 상태 확인

문의
마이그레이션 관련 문의는 채널톡 또는 커뮤니티를 통해 문의해 주세요.

TDS를 소개해요
Image

TDS는 토스 제품을 만들 때 공통적으로 사용하는 디자인 시스템이에요. 수백 개의 컴포넌트와 템플릿으로 구성되어 있고, 단순히 디자인 툴에만 머무는 것이 아니라 개발과 연결되어 토스 제품을 구성하는 하나의 언어처럼 사용돼요.

TDS가 지향하는 목표
제품의 최소 품질을 언제나 보장해요. TDS를 사용하면 토스의 일관된 UI를 유지할 수 있기 때문이에요.
생산성을 향상시키고 문제 해결에 집중할 수 있도록 도와줘요. 재사용 할 수 있는 아름다운 디자인 시스템으로 제품의 UI 개발 과정을 효율적으로 만들어요.
일관성 있는 인터랙션, 애니메이션, 일러스트레이션, 디자인 템플릿을 통해 제품 완성도를 업계 최고 수준으로 끌어올리는 것이 최종 목표에요.


TDS Mobile 시작하기
TDS Mobile 패키지를 사용하면 모바일 환경에서 다양한 UI 컴포넌트를 쉽게 적용할 수 있어요. 이 문서에서는 TDS Mobile을 프로젝트에 설치하고 사용하는 방법을 알려드려요.

1. 필수 패키지 설치하기
먼저, TDS Mobile을 사용하려면 관련된 패키지들을 설치해야 해요.

npm install @toss/tds-mobile @toss/tds-mobile-ait @emotion/react@^11 react@^18 react-dom@^18
2. Provider 설정하기
TDS Mobile을 사용하려면, 프로젝트의 최상위를 TDSMobileAITProvider로 감싸야 해요. 이 컴포넌트는 TDS Mobile의 컴포넌트들이 올바르게 동작할 수 있도록 설정해 줘요.

import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';

function App({ Component, pageProps }) {
  return (
    <TDSMobileAITProvider>
      <Component {...pageProps} />
    </TDSMobileAITProvider>
  );
}

3. 사용하기
패키지 설치와 설정이 끝났다면, 이제 컴포넌트를 프로젝트에 불러와서 사용할 수 있어요. 예를 들어, Button 컴포넌트를 사용하려면 다음과 같이 코드를 작성하면 돼요.

import { Button } from '@toss/tds-mobile';

const App = () => <Button>버튼</Button>;

Colors
토스의 색상 시스템은 개발자와 디자이너가 통일된 색상 이름을 사용하도록 도와줘요. 이 시스템을 활용하면 디자인 가이드에 맞춰 일관된 UI를 쉽게 구현할 수 있어요.

기본 사용법
토스의 색상 시스템을 사용하려면 @toss/tds-colors 패키지를 설치해야 해요.

yarn add @toss/tds-colors

설치가 끝나면 colors 객체에서 원하는 색상을 가져와 사용할 수 있어요.

import { colors } from '@toss/tds-colors';

<div style={{ width:100, height:100, backgroundColor: colors.blue500 }} />
기본 색상
Grey
colors.grey50
#f9fafb

colors.grey100
#f2f4f6

colors.grey200
#e5e8eb

colors.grey300
#d1d6db

colors.grey400
#b0b8c1

colors.grey500
#8b95a1

colors.grey600
#6b7684

colors.grey700
#4e5968

colors.grey800
#333d4b

colors.grey900
#191f28

Blue
colors.blue50
#e8f3ff

colors.blue100
#c9e2ff

colors.blue200
#90c2ff

colors.blue300
#64a8ff

colors.blue400
#4593fc

colors.blue500
#3182f6

colors.blue600
#2272eb

colors.blue700
#1b64da

colors.blue800
#1957c2

colors.blue900
#194aa6

Red
colors.red50
#ffeeee

colors.red100
#ffd4d6

colors.red200
#feafb4

colors.red300
#fb8890

colors.red400
#f66570

colors.red500
#f04452

colors.red600
#e42939

colors.red700
#d22030

colors.red800
#bc1b2a

colors.red900
#a51926

Grey Opacity
colors.greyOpacity50
#001733, 0.02

colors.greyOpacity100
#022047, 0.05

colors.greyOpacity200
#001b37, 0.1

colors.greyOpacity300
#001d3a, 0.18

colors.greyOpacity400
#001936, 0.31

colors.greyOpacity500
#031832, 0.46

colors.greyOpacity600
#00132b, 0.58

colors.greyOpacity700
#031228, 0.7

colors.greyOpacity800
#000c1e, 0.8

colors.greyOpacity900
#020913, 0.91

Orange
colors.orange50
#fff3e0

colors.orange100
#ffe0b0

colors.orange200
#ffcd80

colors.orange300
#ffbd51

colors.orange400
#ffa927

colors.orange500
#fe9800

colors.orange600
#fb8800

colors.orange700
#f57800

colors.orange800
#ed6700

colors.orange900
#e45600

Yellow
colors.yellow50
#fff9e7

colors.yellow100
#ffefbf

colors.yellow200
#ffe69b

colors.yellow300
#ffdd78

colors.yellow400
#ffd158

colors.yellow500
#ffc342

colors.yellow600
#ffb331

colors.yellow700
#faa131

colors.yellow800
#ee8f11

colors.yellow900
#dd7d02

Green
colors.green50
#f0faf6

colors.green100
#aeefd5

colors.green200
#76e4b8

colors.green300
#3fd599

colors.green400
#15c47e

colors.green500
#03b26c

colors.green600
#02a262

colors.green700
#029359

colors.green800
#028450

colors.green900
#027648

Teal
colors.teal50
#edf8f8

colors.teal100
#bce9e9

colors.teal200
#89d8d8

colors.teal300
#58c7c7

colors.teal400
#30b6b6

colors.teal500
#18a5a5

colors.teal600
#109595

colors.teal700
#0c8585

colors.teal800
#097575

colors.teal900
#076565

Purple
colors.purple50
#f9f0fc

colors.purple100
#edccf8

colors.purple200
#da9bef

colors.purple300
#c770e4

colors.purple400
#b44bd7

colors.purple500
#a234c7

colors.purple600
#9128b4

colors.purple700
#8222a2

colors.purple800
#73228e

colors.purple900
#65237b

배경 색상
colors.background
#FFFFFF

colors.greyBackground
lightThemeGrey100

colors.layeredBackground
#FFFFFF

colors.floatedBackground
#FFFFFF

Typography
Typography는 디자인 시스템의 핵심 요소로, 텍스트의 가독성을 보장하고 일관된 방향성을 유지하며 브랜드 아이덴티티를 전달하는 중요한 역할을 해요. 폰트 크기, 라인 높이 등을 통해 정보의 계층 구조를 명확히 하고, 다양한 디바이스와 환경에서 통일된 비주얼을 제공하는 데 초점을 맞춰요.

우리의 디자인 시스템은 다양한 플랫폼에서의 일관된 사용자 경험을 제공하기 위해 설계되었어요. 안드로이드와 iOS뿐 아니라, 웹 페이지에서도 이질감 없이 동일한 텍스트 스타일이 적용될 수 있도록 명확한 규칙을 따르고 있어요. 특히 네이티브 환경에서의 더 큰 텍스트 모드와 같은 접근성 옵션을 지원하며, 폰트 크기와 텍스트 스타일이 이에 맞춰 동적으로 조정되도록 설계했어요.

규칙 알아보기
토큰
Typography 토큰은 계층 구조를 가지고 있어요. 사용 방법은 아래 표에서 확인할 수 있어요. Typography를 사용하는 입장에서 구체적인 폰트 크기와 라인 높이를 외우거나 직접 계산할 필요는 없어요. 사용자는 계층화된 토큰을 그대로 사용하도록 추상화되어 있어요.

또한, 아래 표에 나온 값을 직접 하드코딩하지 않길 권장해요. 이 표는 더 큰 텍스트가 적용되지 않은 기본적인 상황을 가정한 것이며, 값을 직접 하드코딩하면 더 큰 텍스트로 인해 시스템의 폰트 크기가 변경되는 상황에서 유연하게 대응하기 어려울 수 있어요.

Token
font Size
Line Height
Usage
Typography 1
30
40
매우 큰 제목
sub Typography 1
29
38
sub Typography 2
28
37
sub Typography 3
27
36
Typography 2
26
35
큰 제목
sub Typography 4
25
34
sub Typography 5
24
33
조금 큰 제목
sub Typography 6
23
32
Typography 3
22
31
일반 제목
sub Typography 7
21
30
Typography 4
20
29
작은 제목
sub Typography 8
19
28
조금 큰 본문
sub Typography 9
18
27
Typography 5
17
25.5
일반 본문
sub Typography 10
16
24
Typography 6
15
22.5
작은 본문
sub Typography 11
14
21
Typography 7
13
19.5
안 읽어도 됨
sub Typography 12
12
18
sub Typography 13
11
16.5
아예 안읽어도 됨
더 큰 텍스트
더 큰 텍스트는 iOS와 Android에서 제공하는 접근성 설정으로, 사용자가 텍스트 크기를 조정해 가독성을 높이는 기능이에요. 이 설정은 네이티브 환경뿐 아니라 앱 내부의 웹 페이지에서도 동일하게 적용되어야 해요. 네이티브 설정으로 텍스트 비율이 커진 경우, 웹 페이지 본문 텍스트가 상대적으로 작아 가독성이 떨어질 수 있기 때문이에요.

이런 문제를 방지하려면, 사용자가 기기에서 더 큰 텍스트 모드를 활성화하고 비율을 변경했을 때 적용되는 실제 폰트 크기를 아래 표에 정리했어요. 이 표를 참고하면 네이티브와 웹 간 텍스트 비율 차이를 줄이고 모든 환경에서 일관된 사용자 경험을 제공할 수 있어요. 표에 나온 값을 고정 값으로 하드코딩하지 않는 것이 중요해요. 하드코딩된 값은 더 큰 텍스트 모드에서 유연한 대응을 어렵게 만들 수 있어요.

Android, iOS, 웹 간의 차이로 인해 완벽히 동일한 규칙을 적용하기는 어려워요. 하지만 플랫폼 간 차이를 최소화하기 위해 근사한 값을 기준으로 규칙을 마련했어요. 아래에서 이를 확인할 수 있어요.

iOS
iOS는 xLarge와, xxLarge와, xxxLarge와와 같이 제한된 수의 더 큰 텍스트 단계를 제공해요. 우리는 이 단계를 비율로 추상화해서 Android, iOS, 그리고 웹 간의 규칙을 일관되게 맞췄어요. 아래 표에서는 네이티브 환경의 각 설정에 따라 웹에서 보여줘야 할 값을 확인할 수 있어요.

비율
Typography
100%
Large
110%
xLarge
120%
xxLarge
135%
xxxLarge
160%
A11y_Medium
190%
A11y_Large
235%
A11y_xLarge
275%
A11y_xxLarge
310%
A11y_xxxLarge
Typography 1
30
32
34
36
40
41
41
42
42
sub Typography 1
29
31
33
35
39
40
41
42
42
sub Typography 2
28
30
32
34
38
39
40
41
41
sub Typography 3
27
29
31
33
37
38
40
41
41
Typography 2
26
28
30
32
36
38
40
41
41
sub Typography 4
25
27
29
31
36
38
40
41
41
sub Typography 5
24
26
28
30
35
37
39
40
40
sub Typography 6
23
25
27
29
34
37
39
40
40
Typography 3
22
24
26
28
33
36
39
40
40
sub Typography 7
21
23
25
27
32
36
39
40
40
Typography 4
20
22
24
26
31
35
38
39
40
sub Typography 8
19
21
23
25
30
34
38
39
40
sub Typography 9
18
20
22
24
28
33
37
38
39
Typography 5
17
19
21
23
27
32
36
38
39
sub Typography 10
16
18
20
22
26
30
34
37
39
Typography 6
15
17
19
21
24
28
31
34
37
sub Typography 11
14
16
18
20
23
26
29
32
36
Typography 7
13
15
17
19
21
24
27
30
34
sub Typography 12
12
14
16
18
20
22
25
28
32
sub Typography 13
11
13
15
17
19
21
24
27
31
Android
한편, Android는 iOS와 달리 100% 이상의 모든 값을 지원하고 제한된 단계로 표현할 수 없어요. 그래서 다음 표와 같은 규칙을 마련했어요. 표에 표시된 NN%는 비율을 나타내요.

예를 들어 사용자가 110%로 설정하고 Typography 1 토큰을 사용했다면, 해당 토큰의 공식(30 x NN x 0.01)에 따라 33으로 계산돼요.

Typography
100%
NN%
Max
Typography 1
30
30 * NN * 0.01
42
sub Typography 1
29
29 * NN * 0.01
42
sub Typography 2
28
28 * NN * 0.01
41
sub Typography 3
27
27 * NN * 0.01
41
Typography 2
26
26 * NN * 0.01
41
sub Typography 4
25
25 * NN * 0.01
41
sub Typography 5
24
24 * NN * 0.01
40
sub Typography 6
23
23 * NN * 0.01
40
Typography 3
22
22 * NN * 0.01
40
sub Typography 7
21
21 * NN * 0.01
40
Typography 4
20
20 * NN * 0.01
40
sub Typography 8
19
19 * NN * 0.01
40
sub Typography 9
18
18 * NN * 0.01
39
Typography 5
17
17 * NN * 0.01
39
sub Typography 10
16
16 * NN * 0.01
39
Typography 6
15
15 * NN * 0.01
37
sub Typography 11
14
14 * NN * 0.01
36
Typography 7
13
13 * NN * 0.01
34
sub Typography 12
12
12 * NN * 0.01
32
sub Typography 13
11
11 * NN * 0.01
31
전체 보기
Typography_Light
Typography1_Light
subTypography1_Light
subTypography2_Light
subTypography3_Light
Typography2_Light
subTypography4_Light
subTypography5_Light
subTypography6_Light
Typography3_Light
subTypography7_Light
Typography4_Light
subTypography8_Light
subTypography9_Light
Typography5_Light
subTypography10_Light
Typography6_Light
subTypography11_Light
Typography7_Light
subTypography12_Light
subTypography13_Light
Typography_Regular
Typography1_Regular
subTypography1_Regular
subTypography2_Regular
subTypography3_Regular
Typography2_Regular
subTypography4_Regular
subTypography5_Regular
subTypography6_Regular
Typography3_Regular
subTypography7_Regular
Typography4_Regular
subTypography8_Regular
subTypography9_Regular
Typography5_Regular
subTypography10_Regular
Typography6_Regular
subTypography11_Regular
Typography7_Regular
subTypography12_Regular
subTypography13_Regular
Typography_Medium
Typography1_Medium
subTypography1_Medium
subTypography2_Medium
subTypography3_Medium
Typography2_Medium
subTypography4_Medium
subTypography5_Medium
subTypography6_Medium
Typography3_Medium
subTypography7_Medium
Typography4_Medium
subTypography8_Medium
subTypography9_Medium
Typography5_Medium
subTypography10_Medium
Typography6_Medium
subTypography11_Medium
Typography7_Medium
subTypography12_Medium
subTypography13_Medium

컴포넌트
Badge
Board Row
Border
Bottom Info
Bottom Sheet
Bubble
Button
Checkbox
Grid List
Highlight
Icon Button
List Footer
List Header
Loader
Menu
Modal
Numeric Spinner
Paragraph
Post
Progress Bar
Progress Stepper
Rating
Result
Search Field
Segmented Control
Skeleton
Slider
Stepper
Switch
Tab
Table Row
Text Button
Toast
Tooltip
Top
Agreement
Asset
BottomCTA
Chart
Dialog
Keypad
ListRow
TextField
