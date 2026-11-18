import { share, getTossShareLink } from '@apps-in-toss/web-framework';
import type { AchievementCard } from './achievementImage';

// 공유 미리보기용 OG 이미지(절대 HTTPS, 1200x630). main의 docs/assets/og를 본다 - main에 있어야 보이고, 저장소가 비공개가 되면 깨진다.
const OG_BASE = 'https://raw.githubusercontent.com/yyoujg/moneytermi/main/docs/assets/og';

// 성취 종류별 링크 착지 화면과 OG 이미지(docs/assets/og/og-<kind>.png, 원본 피그마 https://www.figma.com/design/sA84PSXwlvVwmAoOMyQW4u)
const LINK_BY_KIND: Record<AchievementCard['kind'], { path: string; og: string }> = {
  quiz: { path: 'intoss://moneytermi/course', og: 'og-quiz.png' },
  record: { path: 'intoss://moneytermi/home', og: 'og-image.png' },
  streak: { path: 'intoss://moneytermi/home', og: 'og-streak.png' },
  quest: { path: 'intoss://moneytermi/home', og: 'og-quest.png' },
  league: { path: 'intoss://moneytermi/league', og: 'og-league.png' },
  badge: { path: 'intoss://moneytermi/my', og: 'og-badge.png' },
};

// 토스 공유 시트로 보내는 텍스트. 줄마다 끊어 읽히게 한다
export const achievementShareMessage = (card: AchievementCard): string => {
  switch (card.kind) {
    case 'streak': return `머니터미 ${card.value}일 연속 출석 찍음\n작심삼일 아니고 진짜 갓생\n너도 같이 해 ㄱㄱ`;
    case 'quest': return `머니터미 퀘스트 클리어${card.value.startsWith('+') ? ` ${card.value} XP` : ''}\n${card.description}\n오늘 할 일 끝, 퇴근합니다`;
    case 'league': return `머니터미 ${card.value} 리그로 승급함\n다음 주엔 더 위로 간다`;
    case 'badge': return `머니터미 새 배지 ${card.value}개 겟\n${card.description}\n수집욕 자극 제대로임`;
    default: return `머니터미에서 ${card.description}\n${card.unit} ${card.value}, 나 좀 치는 듯`;
  }
};

// 토스 공유 링크를 만들어 네이티브 공유 시트를 띄운다. 미지원/취소/실패 시 무시.
export const shareTossLink = async (kind: AchievementCard['kind'], message: string): Promise<void> => {
  const { path, og } = LINK_BY_KIND[kind];
  try {
    const link = await getTossShareLink(path, `${OG_BASE}/${og}`);
    await share({ message: `${message}\n${link}` });
  } catch { /* 미지원/취소/실패 무시 */ }
};
