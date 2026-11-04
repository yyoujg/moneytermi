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
