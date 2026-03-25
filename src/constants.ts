import type { Word } from './types';

export const COURSES = [
  {
    id: 'course_1',
    level: 'Lv.1',
    title: '경제의 기초, 물가',
    description: '인플레이션? 확실히 잡고 가기',
    words: [
      { id: 2, word: '인플레이션', meaning: '물가가 오르고 돈의 가치가 떨어지는 현상', detailedMeaning: '월급은 그대로인데 짜장면 값, 버스 요금이 계속 오르는 상황입니다. 시중에 돈이 너무 많거나, 물건을 만드는 비용이 비싸질 때 발생해요.', newsExample: '사과 한 알에 만 원 돌파... 체감 밥상 물가 인플레이션 심각', hint: 'ㅇㅍㄹㅇㅅ' },
      { id: 4, word: '디플레이션', meaning: '물가가 계속 떨어져서 경제가 얼어붙는 현상', detailedMeaning: "물가가 떨어지면 좋을 것 같지만, 사람들이 '내일이면 더 싸지겠지?' 하고 돈을 안 쓰게 됩니다. 결국 기업은 물건이 안 팔려 망하고 일자리도 줄어드는 무서운 현상이에요.", newsExample: '일본, 잃어버린 30년... 장기 디플레이션 늪에서 벗어날 수 있을까', hint: 'ㄷㅍㄹㅇㅅ' },
    ],
  },
  {
    id: 'course_2',
    level: 'Lv.2',
    title: '주린이 탈출기',
    description: '주식 기사에 맨날 나오는 단어들',
    words: [
      { id: 3, word: '블루칩', meaning: '수익성과 재무구조가 탄탄한 우량주', detailedMeaning: '주식 시장에서 오랜 기간 안정적으로 이익을 내고 배당도 잘 주는 대형 우량 기업을 뜻합니다. 카지노에서 가장 비싼 칩이 파란색인 데서 유래했어요.', newsExample: '흔들리는 증시에도 외국인들은 삼성전자 등 블루칩 쓸어담아', hint: 'ㅂㄹㅊ' },
      { id: 7, word: '어닝쇼크', meaning: '기업의 실적이 예상보다 훨씬 나쁠 때', detailedMeaning: '기업이 분기별로 발표하는 실적(어닝)이 시장의 예상치를 크게 밑돌아 투자자들에게 충격(쇼크)을 주는 상황입니다. 보통 주가 폭락으로 이어집니다.', newsExample: '테슬라, 3분기 영업이익 반토막... 최악의 어닝쇼크에 주가 급락', hint: 'ㅇㄴㅅㅋ' },
      { id: 8, word: '데드캣바운스', meaning: '주가가 크게 떨어지다 잠깐 반짝 오르는 현상', detailedMeaning: "'죽은 고양이도 아주 높은 곳에서 떨어지면 살짝 튀어 오른다'는 무시무시한 증시 격언에서 왔습니다. 하락장 속에서 아주 잠깐 가격이 회복되는 속임수 반등을 뜻해요.", newsExample: '비트코인 4만 달러 회복, 진짜 찐반등? 아니면 데드캣바운스?', hint: 'ㄷㄷㅋㅂㅇㅅ' },
    ],
  },
  {
    id: 'course_3',
    level: 'Lv.3',
    title: '금리와 돈의 흐름',
    description: '미국 연준이 금리를 올리면?',
    words: [
      { id: 1, word: '양적완화', meaning: '시장에 돈 복사기 돌리기', detailedMeaning: '중앙은행이 화폐를 찍어내서 국채나 민간 자산을 사들여 시장에 돈(유동성)을 직접 푸는 정책입니다. 경기가 너무 안 좋을 때 금리를 낮추는 것만으로 부족할 때 사용해요.', newsExample: '미 연준, 코로나19 사태로 무제한 양적완화 선언... 시장에 달러 쏟아진다', hint: 'ㅇㅈㅇㅎ' },
      { id: 5, word: '매파', meaning: '물가를 잡기 위해 금리를 올려야 한다는 강경파', detailedMeaning: '매(Hawk)처럼 날카롭게 물가 상승을 경계하는 사람들을 말합니다. 경제 성장보다는 물가 안정을 중요하게 생각해서 금리 인상을 강력히 주장해요.', newsExample: '미 연준의 강력한 매파적 발언에... 기준금리 인상 공포감 확산', hint: 'ㅁㅍ' },
      { id: 6, word: '비둘기파', meaning: '경기를 살리기 위해 금리를 내려야 한다는 온건파', detailedMeaning: '평화의 상징 비둘기처럼, 물가보다는 경제 성장과 일자리 창출을 더 중요하게 생각하는 사람들입니다. 시중에 돈을 푸는 금리 인하를 선호해요.', newsExample: '한은 총재의 비둘기파적 스탠스... 연내 금리 인하 기대감 솔솔', hint: 'ㅂㄷㄱㅍ' },
    ],
  },
];

export const ALL_WORDS: Word[] = COURSES.flatMap((course) => course.words);

export const LEAGUE_TIERS = [
  { id: 1, name: '알개미' },
  { id: 2, name: '뽀시래기' },
  { id: 3, name: '일개미' },
  { id: 4, name: '전투개미' },
  { id: 5, name: '슈퍼개미' },
];

export const CURRENT_LEAGUE_ID = 2;
export const CURRENT_LEAGUE_NAME = '뽀시래기 개미';

const NICKNAMES = ['존버는승리한다', '물린개미', '야수의심장', '월급루팡', '영끌족', '한강뷰가즈아', '빨간불만본다', '주식천재', '버핏형님', '단타의신', '파란불수집가', '슈퍼개미', '무지성풀매수', '빚투의결말', '하따전문가'];
const EMOJIS = ['🐶', '🐱', '🐯', '🐰', '🐹', '🐼', '🐻', '🦊', '🐸', '🐵', '🐥', '🦄', '👽', '👻', '🤖'];

export const INITIAL_LEAGUE_USERS = Array.from({ length: 29 }, (_, i) => ({
  id: `user_${i}`,
  name: NICKNAMES[i % NICKNAMES.length],
  points: Math.floor(Math.random() * 200) + 100,
  emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
}));
