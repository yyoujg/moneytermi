# 효과음 파일

이 폴더에 아래 이름으로 mp3를 넣으면 앱이 합성음 대신 파일을 튼다. 없는 파일은 자동으로 합성음으로 대체된다 (`src/lib/feedback.ts`).
짧을수록 좋다 (버튼 0.05~0.1초, 나머지 0.3~1.5초). 파일 재생은 앱에서 낮은 게인과 짧은 연타 제한을 한 번 더 적용한다.

| 파일 | 언제 | 느낌 |
|---|---|---|
| tick.mp3 | 모든 버튼 누름 | 아주 짧은 톡/클릭 |
| node.mp3 | 패스 노드 탭 | 팝 |
| spend.mp3 | 레슨 시작 포인트 소모 | 쓱, 동전 빠짐 |
| correct.mp3 | 퀴즈 정답 | 딩동 |
| combo.mp3 | 정답 콤보 3 이상 | 조금 더 화려한 정답 |
| combo_max.mp3 | 정답 콤보 5 이상 | 가장 화려한 정답 |
| wrong.mp3 | 오답 | 버저 |
| learned.mp3 | 단어 하나 완료 | 부드러운 딩 |
| lesson.mp3 | 레슨(단어 묶음) 완료 | 짧은 팡파르 |
| quiz.mp3 | 퀴즈/복습 완료 | 상승음 |
| perfect.mp3 | 퀴즈 100% | 더 큰 상승음 |
| tierup.mp3 | 티어 승급 | 웅장 |
| claim.mp3 | 미션·광고 보상 수령 | 동전 |
| boost.mp3 | 부스트 구매 | 파워업 |
| streak.mp3 | 연속 학습 축하 | 차임 |
| celebrate.mp3 | 마일스톤(7·14·30일…) | 팡파르 + 축포 |
| badge.mp3 | 배지 획득 | 반짝이는 상승 아르페지오 |
| error.mp3 | 실패 알림 | 낮은 버저 |

## 현재 포함된 파일

출처와 라이선스 근거는 `SOURCES.md`에 파일별로 기록했다.

| 파일 | 원본 파일 | 최종 길이 | 비고 |
|---|---|---:|---|
| correct.mp3 | `Ogg/Confirm_tones/style2/confirm_style_2_007.ogg` | 0.624초 | 정답 피드백 |
| wrong.mp3 | `Ogg/Error_tones/style5/error_style_5_007.ogg` | 0.506초 | 오답 피드백 |
| lesson.mp3 | `Ogg/Confirm_tones/style3/confirm_style_3_007.ogg` | 0.930초 | 레슨 완료 피드백 |

라이선스: 앱(소프트웨어) 사용이 허용된 음원만. 새 음원을 추가할 때는 파일별 출처, 원본 파일명, 라이선스 근거를 `SOURCES.md`에 적어 둘 것.
