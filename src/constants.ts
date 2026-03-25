// 단어/코스 데이터는 src/data/ 폴더에서 관리합니다.
// 새 단어 추가 → 해당 카테고리 파일 (macro.ts, stocks.ts, ...)
// 새 카테고리 추가 → 새 파일 생성 후 src/data/index.ts에 등록

export { COURSES, ALL_WORDS, CATEGORIES } from './data/index';

export const LEAGUE_TIERS = [
  { id: 1, name: '알개미' },
  { id: 2, name: '뽀시래기' },
  { id: 3, name: '왕개미' },
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
