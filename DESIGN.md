# DESIGN.md

머니터미 화면을 만들거나 고칠 때 따르는 디자인 규칙이다. 값의 원본은 `src/styles/tokens.css`이고, 공통 적용은 `src/index.css`가 맡는다. 화면 파일에 hex 색이나 임의 크기를 직접 쓰지 않는다.

## 원칙

- 핵심 정보와 주요 행동만 강조한다. 화면마다 가장 먼저 보여야 할 것은 하나다.
- 카드는 적게, 여백과 타이포그래피로 위계를 만든다.
- 메인 컬러는 CTA 버튼에만 쓴다. 나머지는 중성색과 낮은 채도의 보조색이다.
- 평면이다. 그림자, 그라데이션, 떠 있는(아일랜드) UI를 쓰지 않는다.
- 아이콘은 듀오톤 한 벌이고, 아이콘 뒤에 색 바탕을 깔지 않는다.

## 색

### 메인 컬러

| 토큰 | 값 | 쓰는 곳 |
|---|---|---|
| `--color-brand-action` | `#CC4C1A` (탠저린) | 주요 CTA 버튼 배경 |
| `--color-brand-pressed` | `#BD4819` | CTA 눌림 |
| `--color-on-brand` | `#FFFFFF` | CTA 글자 (대비 4.55:1) |

- 화면 면적의 5~10%를 넘지 않는다. 한 화면에 채운 CTA는 보통 하나다.
- 진행 막대, 선택 상태, 숫자 강조, 장식, 로딩 표시에는 쓰지 않는다.
- `.bg-brand-500`, `button.action-button`(primary)만 이 색을 받는다. `.text-brand-*`, `--color-brand-decoration`, `--color-brand-soft`는 중성색으로 연결되어 있다.

### 중성색

| 역할 | 라이트 | 다크 |
|---|---|---|
| `--color-canvas` 페이지 바탕 | `#F4F4F6` | `#202124` |
| `--color-card` 카드 | `#FFFFFF` | `#2B2C31` |
| `--color-surface` 보조 표면 | `#F3F3F5` | `#38393F` |
| `--color-ink` 제목/주요 수치 | `#202124` | `#F4F4F6` |
| `--color-ink-2` 본문 | `#45484F` | `#D7DAE0` |
| `--color-ink-3` 보조 설명 | `#60646C` | `#B5BAC3` |
| `--color-line` 구분선 | `#E7E8ED` | `#4B4D56` |

선택 상태(언더라인 탭, 하단 탭 활성, 세그먼트 선택, 스위치)는 `--color-ink`로 표시한다.

### 보조색 5개

메인 컬러보다 채도를 낮춘 색이다. 아이콘, 진행, 상태에만 쓰고 넓은 면에는 쓰지 않는다. 글자에는 `-ink` 단계를 쓴다(흰 카드 기준 4.5:1 이상).

| 이름 | 아이콘/막대 | 글자(`-ink`) | 다크 | 역할 |
|---|---|---|---|---|
| sage | `#5F8F7A` | `#4A7362` | `#8DC0A8` | 정답/성공, 학습/용어, 출석 완료 |
| rose | `#C2707A` | `#A4505B` | `#E3949D` | 오답/오류, 연속 학습, 새 소식 점 |
| amber | `#C08A3E` | `#8E6020` | `#E0B068` | 코인/보상 |
| slate | `#5E7A99` | `#4C6683` | `#93AECB` | 진행 막대, 에너지, 정보 |
| lavender | `#7C74B8` | `#615AA0` | `#ABA4E0` | XP, 등급, 리그 |

의미 토큰은 이 다섯 개를 참조한다: `--color-success-*` sage, `--color-danger-*` rose, `--color-reward-foreground` amber, `--color-progress` slate, `--color-stat-{words,streak,points,energy,xp}`.
상태를 색만으로 전달하지 않는다. 문구나 아이콘을 함께 쓴다.

## 타이포그래피

글꼴은 Pretendard. 크기는 8단계만 쓴다.

| 토큰 | 크기 | 용도 |
|---|---|---|
| `display` | 34px | 큰 숫자 |
| `title-1` | 28px | 드물게 쓰는 큰 제목 |
| `title-2` | 24px | 화면 제목 |
| `title-3` | 20px | 강조 블록 제목, 통계 값 |
| `headline` | 17px | 섹션 제목, 목록 항목 제목, 기본 CTA 글자 |
| `body` | 15px | 본문 |
| `label` | 13px | 보조 설명 |
| `caption` | 11px | 메타 정보 |

굵기는 400 / 600 / 700 세 가지. 카드가 없는 영역의 위계는 3단계로 만든다.

1. 섹션 제목: `headline` 700 `ink`
2. 항목 제목: `body`~`headline` 600 `ink`
3. 보조: `label`/`caption` 400 `ink-3`

## 간격과 형태

- 간격은 4px 격자(`--space-1` 4px ~ `--space-12` 48px).
- 그룹 사이 32px(`--space-8`), 그룹 안 12~16px(`--space-3`~`--space-4`). 그룹 사이가 그룹 안보다 분명히 넓어야 한다.
- 페이지 좌우 여백 20px(`--space-5`).
- 곡률: 카드 24px(`--shape-card`), 버튼 16px(`--shape-button`), 칩 12px, 원 `--shape-full`.
- 그림자 토큰은 모두 `none`이다.
- 버튼 높이 52px(큰 버튼 56px), 최소 터치 영역 44px.

## 카드

`src/components/ui/Card.tsx`. 기본 `tone="plain"`은 박스 없이 세로 여백만 준다.

카드(`tone="card"` 또는 같은 표면)는 핵심 정보와 주요 행동을 담을 때만 쓴다.

- 코스 홈 추천 학습(`.course-home-hero`)
- 퀘스트 복습 진입
- 리그 이번 주 순위/내 등급 요약
- 복습 단어 카드, 퀴즈 문제 카드, 공유 미리보기

그 외 안내, 목록, 통계는 카드 없이 둔다. 목록 항목은 카드 대신 1px `--color-line` 구분선으로 나눈다.

## 아이콘

- `@phosphor-icons/react`의 `weight="duotone"`으로 통일한다. 색은 `currentColor`를 따르고 2차 레이어는 20% 불투명도다.
- 꺾쇠(`ChevronRight/Left/Down`, `ChevronsUp`)만 예외로 `weight="bold"` 선형이다. 듀오톤 꺾쇠는 삼각형처럼 읽힌다.
- 아이콘은 `src/components/ui/OtterIcons.tsx`의 export로만 가져온다(파일 이름은 호환용). 새 아이콘은 같은 파일에 `createIcon`으로 추가한다. 조작 표시는 `ControlIcons.tsx`에서 다시 내보낸다.
- 기본 크기: 역할 아이콘 24px, 조작 아이콘 18px.
- 아이콘 뒤에 색 원이나 파스텔 박스를 깔지 않는다. 의미가 있으면 아이콘 자체에 보조색을 준다.
- 재화/통계 아이콘은 `src/components/StatIcons.tsx`: 코인 `Coins`(amber), 에너지 `Lightning`(slate), 연속 학습 `Flame`(rose), XP `Trophy`(lavender), 용어 `BookOpen`(sage).

## 컴포넌트 규칙

- **CTA 버튼**: 메인 컬러 채움, 흰 글자, 굵게. 기본 `button.action-button`은 17px, `bg-brand-500` 버튼은 15px. 다크 모드에서는 `--color-action-boundary` 1px 테두리가 붙는다.
- **카테고리 필터**: 칩이 아닌 언더라인 탭. 전체 폭 하단 1px 선, 선택 탭은 2px `ink` 밑줄과 굵은 글자. 배경 없음. 상단 고정과 가로 스크롤 유지(`.course-home-filters`).
- **하단 탭바**: 화면 아래에 붙은 전체 폭 바. `--color-card` 배경, 상단 1px 선, 라운드/그림자 없음, 하단 안전 영역 패딩. 활성 탭은 `ink` 굵게, 비활성은 `ink-3`. 새 소식은 rose 점으로 표시하고 `aria-label`에 "새 내용 있음"을 넣는다.
- **진행 막대**: `--color-progress`(slate). 리그 등급 막대만 lavender.
- **배지**: 바탕 없이 보조색 테두리와 글자. 미획득은 `line` 테두리와 `ink-3`.
- **뒤로가기**: 상단 X/뒤로 버튼을 직접 만들지 않는다. 토스 내비게이션 바가 맡는다(검수 반려 사유).

## 용어

- 재화 이름은 **코인**이다. "조개"는 쓰지 않는다. "포인트"는 토스 포인트(현금성)와 헷갈려 쓰지 않는다.
- 받침이 있으므로 조사는 코인은, 코인을, 코인이, 코인과, 코인이에요.
- 에너지는 "에너지"로 쓴다.

## 접근성

- 일반 글자 4.5:1, 큰 글자/비문자 요소(진행, 경계) 3:1 이상. `src/styles/tokens.test.ts`가 토큰 대비를 검사한다.
- 터치 영역 44px 이상, 키보드 초점 표시 유지, `prefers-reduced-motion` 존중.
- 장식 아이콘은 `aria-hidden`, 의미는 글자나 `aria-label`로 전달한다.

## 바꿀 때

1. 색/크기 값은 `src/styles/tokens.css`에만 추가한다. 의미 토큰(`--color-*`)은 원시값을 `var()`로 참조한다.
2. `npx vitest run`으로 토큰 대비/아이콘 규격 테스트를 통과시킨다.
3. 375px 라이트/다크 화면에서 메인 컬러가 CTA에만 보이는지 확인한다.
