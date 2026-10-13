import type { Word } from '../types';

type LearningOutcomeInput = {
  category?: string;
  title?: string;
  words?: Pick<Word, 'word'>[];
};

const RULES = [
  { re: /주식|채권시장|ETF|펀드|투자|배당|파생상품|분산/, text: '투자 상품 얘기가 나와도 장단점을 구분할 수 있어요' },
  { re: /재정|조세|사회보장|세금|공제|연말정산|부가가치세|증여|상속/, text: '세금과 정부 돈 이야기를 내 생활과 연결할 수 있어요' },
  { re: /경기|성장|국민소득|GDP|국내총생산/, text: '경기와 성장 흐름을 이해할 수 있어요' },
  { re: /고용|노동|분배|임금|실업/, text: '일자리와 소득 분배 뉴스를 읽을 수 있어요' },
  { re: /국제수지|무역|통상|수출|수입/, text: '무역과 국제 거래 흐름을 이해할 수 있어요' },
  { re: /지급결제|화폐|결제|통화량/, text: '돈의 흐름과 결제 시스템 뉴스를 이해할 수 있어요' },
  { re: /핀테크|디지털|신산업|가상자산|블록체인/, text: '디지털 금융 서비스를 알아볼 수 있어요' },
  { re: /기업|산업|회계|재무제표|매출|영업이익/, text: '기업 실적과 산업 흐름을 더 쉽게 읽을 수 있어요' },
  { re: /금리|이자|채권|통화|물가|인플레이션|긴축|완화/, text: '금리와 물가가 대출·저축에 주는 영향을 읽을 수 있어요' },
  { re: /예금|적금|저축|복리|단리|수익률/, text: '저축 상품의 이자 차이를 비교할 수 있어요' },
  { re: /대출|신용|상환|담보|연체|DSR|LTV|DTI/, text: '대출 조건과 신용 리스크를 더 차분히 볼 수 있어요' },
  { re: /보험|보장|실손|약관|공제|손해/, text: '보험 설명에서 꼭 확인할 말을 찾을 수 있어요' },
  { re: /환율|달러|외환/, text: '환율 변화가 물가와 수출입에 주는 영향을 읽을 수 있어요' },
  { re: /전세|월세|임대|임차|보증금|부동산|주택|담보/, text: '주거 계약과 부동산 뉴스의 위험 신호를 확인할 수 있어요' },
  { re: /소비|가격|수요|공급|효용|비용|시장|경제/, text: '경제의 기본 문장을 생활 속 상황과 연결할 수 있어요' },
] as const;

export const learningOutcomeFor = ({ category = '', title = '', words = [] }: LearningOutcomeInput): string => {
  const source = `${category} ${title} ${words.map(word => word.word).join(' ')}`;
  const match = RULES.find(rule => rule.re.test(source));
  if (match) return match.text;
  const firstWord = words[0]?.word;
  return firstWord ? `${firstWord} 같은 말을 실제 상황에서 알아볼 수 있어요` : '어려운 경제 말을 생활 속 상황과 연결할 수 있어요';
};
