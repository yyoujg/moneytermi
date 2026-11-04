// 주제 사진(홈 주제 카드·단어 카드 뉴스). Unsplash 무료 라이선스 사진을 400x260으로 줄여 public/topics에 둠. 출처는 public/topics/SOURCES.md
export const TOPIC_IMAGES: Record<string, string> = {
  '가계·소비·부동산': 'household', '경기·성장·국민소득': 'growth', '경제 기초 개념': 'basics', '고용·노동·분배': 'labor',
  '국제기구·세계경제': 'world', '국제수지·무역·통상': 'trade', '금리·통화정책·중앙은행': 'monetary', '금융안정·건전성 규제': 'stability',
  '기업·산업·회계': 'industry', '물가·인플레이션': 'prices', '외환·환율': 'fx', '은행·금융제도': 'banking',
  '재정·조세·사회보장': 'fiscal', '주식·채권시장': 'markets', '지급결제·화폐': 'payments', '파생상품·펀드·투자': 'investing',
  '핀테크·디지털·신산업': 'fintech',
};

// 용어가 속한 코스의 주제 이름. 못 찾으면 undefined
export const topicOfWord = (wordId: number, courses: { category: string; words: { id: number }[] }[]) =>
  courses.find(course => course.words.some(w => w.id === wordId))?.category;
