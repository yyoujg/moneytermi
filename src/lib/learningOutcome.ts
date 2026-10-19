import type { Word } from '../types';

type LearningOutcomeInput = {
  category?: string;
  title?: string;
  words?: Pick<Word, 'word'>[];
};

const RULES = [
  { re: /주식|채권시장|ETF|펀드|투자|배당|파생상품|분산/, text: '투자 상품을 설명하는 기본 용어를 살펴봐요' },
  { re: /재정|조세|사회보장|세금|공제|연말정산|부가가치세|증여|상속/, text: '세금과 정부 지출에 관한 용어를 살펴봐요' },
  { re: /경기|성장|국민소득|GDP|국내총생산/, text: '경기와 성장에 관한 용어를 살펴봐요' },
  { re: /고용|노동|분배|임금|실업/, text: '일자리와 소득 분배에 관한 용어를 살펴봐요' },
  { re: /국제수지|무역|통상|수출|수입/, text: '무역과 국제 거래에 관한 용어를 살펴봐요' },
  { re: /지급결제|화폐|결제|통화량/, text: '돈의 흐름과 결제에 관한 용어를 살펴봐요' },
  { re: /핀테크|디지털|신산업|가상자산|블록체인/, text: '디지털 금융 서비스의 용어를 살펴봐요' },
  { re: /기업|산업|회계|재무제표|매출|영업이익/, text: '기업 실적과 산업에 관한 용어를 살펴봐요' },
  { re: /금리|이자|채권|통화|물가|인플레이션|긴축|완화/, text: '금리와 물가를 설명하는 용어와 예시를 살펴봐요' },
  { re: /예금|적금|저축|복리|단리|수익률/, text: '저축과 이자에 관한 용어를 살펴봐요' },
  { re: /대출|신용|상환|담보|연체|DSR|LTV|DTI/, text: '대출 조건과 신용에 관한 용어를 살펴봐요' },
  { re: /보험|보장|실손|약관|공제|손해/, text: '보험 설명에 등장하는 용어를 살펴봐요' },
  { re: /환율|달러|외환/, text: '환율 변화에 관한 용어와 예시를 살펴봐요' },
  { re: /주거|전세|월세|임대|임차|보증금|부동산|주택|담보/, text: '주거 계약과 부동산에 관한 용어를 살펴봐요' },
  { re: /소비|가격|수요|공급|효용|비용|시장|경제/, text: '경제의 기본 용어를 생활 속 예시로 살펴봐요' },
] as const;

export const learningOutcomeFor = ({ category = '', title = '', words = [] }: LearningOutcomeInput): string => {
  const match = [category, title, words.map(word => word.word).join(' ')]
    .map(source => RULES.find(rule => rule.re.test(source)))
    .find(Boolean);
  if (match) return match.text;
  const firstWord = words[0]?.word;
  return firstWord ? `${firstWord}의 뜻과 예시를 살펴봐요` : '경제 용어의 뜻과 생활 속 예시를 살펴봐요';
};
