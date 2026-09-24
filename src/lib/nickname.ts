// 랜덤 닉네임. 프로필 생성 시 전원이 같은 기본값('예비슈퍼개미')을 쓰던 것을 대체한다.
// 서버 public.random_nickname()과 같은 단어 목록을 쓴다(둘 중 어느 경로로 생성돼도 비슷하게 보이도록).
// 닉네임 입력란이 10자 제한(NicknameSheet maxLength)이라 3+3+3=9자를 넘지 않게 고른다.
const ADJ = [
  '성실한', '똑똑한', '용감한', '느긋한', '재빠른', '든든한', '따뜻한',
  '신중한', '대담한', '꼼꼼한', '유쾌한', '침착한', '단단한',
];
const NOUN = [
  '너구리', '다람쥐', '수달', '판다', '여우', '펭귄', '올빼미',
  '두더지', '햄스터', '알파카', '코알라', '비버', '오리', '고래',
];

// rand는 [0,1) 난수. 테스트에서 주입한다.
export const randomNickname = (rand: () => number = Math.random): string => {
  const a = ADJ[Math.floor(rand() * ADJ.length)];
  const n = NOUN[Math.floor(rand() * NOUN.length)];
  const num = Math.floor(rand() * 900) + 100;
  return `${a}${n}${num}`;
};
