// 주제 그림(홈 주제 카드·단어 카드 뉴스). 달리 장면 일러스트 public/topics/scenes, 장면이 없는 주제만 Unsplash 사진(출처 public/topics/SOURCES.md)
const scene = (slug: string) => `/topics/scenes/topic-${slug}.svg`;
const photo = (name: string) => `/topics/${name}.jpg`;
export const TOPIC_IMAGES: Record<string, string> = {
  '가계·소비·부동산': scene('household'), '경기·성장·국민소득': scene('growth'), '경제 기초 개념': scene('basics'), '고용·노동·분배': scene('labor'),
  '국제기구·세계경제': scene('global'), '국제수지·무역·통상': scene('trade'), '금리·통화정책·중앙은행': scene('monetary'), '금융안정·건전성 규제': scene('stability'),
  '기업·산업·회계': scene('corporate'), '물가·인플레이션': scene('inflation'), '외환·환율': scene('fx'), '은행·금융제도': photo('banking'),
  '재정·조세·사회보장': scene('fiscal'), '주식·채권시장': scene('stocks-bonds'), '지급결제·화폐': scene('payments'), '파생상품·펀드·투자': scene('investment'),
  '핀테크·디지털·신산업': photo('fintech'),
};

// 용어가 속한 코스의 주제 이름. 못 찾으면 undefined
export const topicOfWord = (wordId: number, courses: { category: string; words: { id: number }[] }[]) =>
  courses.find(course => course.words.some(w => w.id === wordId))?.category;

// 홈 주제 카드 한 줄 설명. 난이도와 상관없이 주제 단위로 둔다
export const TOPIC_DESCRIPTIONS: Record<string, string> = {
  '경제 기초 개념': '기회비용, 수요와 공급처럼 경제를 보는 기본 틀',
  '가계·소비·부동산': '소득과 소비부터 대출 규제, 집값까지 살림 이야기',
  '물가·인플레이션': '장바구니 물가가 오르내리는 이유와 물가 지표',
  '경기·성장·국민소득': 'GDP와 경기 지표로 보는 나라 경제의 체력',
  '고용·노동·분배': '일자리, 임금, 실업률과 소득 분배',
  '금리·통화정책·중앙은행': '기준금리를 정하는 한국은행과 시중의 돈',
  '주식·채권시장': '주가지수, 공시, 국채와 회사채가 움직이는 시장',
  '파생상품·펀드·투자': 'ETF, 펀드, 선물·옵션 같은 투자 상품',
  '외환·환율': '환율이 오르내리는 이유와 원화 강세·약세',
  '국제수지·무역·통상': '수출입, 관세, 경상수지로 보는 나라 밖 거래',
  '재정·조세·사회보장': '세금과 나라 살림, 국민연금 같은 사회보장',
  '지급결제·화폐': '카드, 계좌이체처럼 돈이 실제로 오가는 방법',
  '핀테크·디지털·신산업': '간편 송금, 가상자산, AI가 바꾸는 금융',
  '기업·산업·회계': '순이익, 손익분기점으로 기업 실적 읽기',
  '은행·금융제도': '은행이 하는 일과 금융회사를 묶는 규칙',
  '국제기구·세계경제': 'IMF, OECD, 신용등급으로 보는 세계 경제',
  '금융안정·건전성 규제': '금융위기를 막는 자기자본비율 같은 안전장치',
};
