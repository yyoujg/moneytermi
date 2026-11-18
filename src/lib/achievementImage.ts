import { File as TossFile } from '@apps-in-toss/web-framework';
import { toDateStr } from './date';
import { weekDays, type WeekDay } from './streak';

export type AchievementCard = {
  kind: 'quest' | 'streak' | 'badge' | 'quiz' | 'record' | 'league';
  title: string;
  value: string;
  unit: string;
  description: string;
  stats?: { label: string; value: string }[];
  week?: WeekDay[];
};

export type AchievementImage = { dataUrl: string; file: File };

export const streakShareCard = (streak: number, attendanceDates: string[]): AchievementCard => ({
  kind: 'streak', title: '하루하루 쌓는 중', value: String(streak), unit: '일 연속 학습',
  description: '오늘도 돈 공부 완료!', week: weekDays(attendanceDates),
});

export const questShareCard = (title: string, xp?: number): AchievementCard => ({
  kind: 'quest', title: '퀘스트 클리어!', value: xp === undefined ? '완료' : `+${xp.toLocaleString()}`,
  unit: xp === undefined ? '오늘의 작은 성취' : 'XP 획득', description: title,
});

// 종류별 세로 템플릿(public/share/<kind>.jpg, 1080x1920). 그림·제목·하단 문구는 템플릿에 있고,
// 라벨 줄(y 609)과 값 줄(y 668)만 배경색으로 덮고 실제 값을 쓴다. 덮는 영역은 단색 배경이다.
const TEMPLATE: Record<Exclude<AchievementCard['kind'], 'record'>, { bg: string; ink: string }> = {
  quiz: { bg: '#101e1f', ink: '#fff6e8' },
  streak: { bg: '#fff1d8', ink: '#483024' },
  quest: { bg: '#deefe1', ink: '#174d35' },
  league: { bg: '#302040', ink: '#fff6e8' },
  badge: { bg: '#fff3bb', ink: '#374322' },
};

// 템플릿 값 줄에 들어갈 [라벨, 값]
export const achievementImageLines = (card: AchievementCard): [string, string] => {
  switch (card.kind) {
    case 'streak': return ['연속 학습 기록', `${card.value}일 연속 출석`];
    case 'quest': return ['오늘의 미션 완료', card.value.startsWith('+') ? `${card.description} · ${card.value} XP` : card.description];
    case 'league': return ['이번 주 리그', `${card.value} 리그로 승급`];
    case 'badge': return [card.description, `새 배지 ${card.value}개`];
    default: return ['오늘의 퀴즈', card.description];
  }
};

export const createAchievementImage = async (card: AchievementCard): Promise<AchievementImage> => {
  const kind = card.kind === 'record' ? 'quiz' : card.kind;
  const { bg, ink } = TEMPLATE[kind];
  const art = new Image();
  art.src = `/share/${kind}.jpg`;
  await Promise.all([art.decode(), document.fonts.ready]);
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('이미지를 만들 수 없어요.');
  ctx.drawImage(art, 0, 0, 1080, 1920);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 596, 1080, 152);
  const font = getComputedStyle(document.body).fontFamily || 'sans-serif';
  const [label, value] = achievementImageLines(card);
  ctx.textBaseline = 'top';
  ctx.fillStyle = ink;
  ctx.globalAlpha = 0.75;
  ctx.font = `500 28px ${font}`;
  ctx.fillText(label, 66, 606, 948);
  ctx.globalAlpha = 1;
  let size = 60;
  ctx.font = `800 ${size}px ${font}`;
  // 한 줄에 다 들어가게 글자를 줄인다(최소 36px, 그래도 넘치면 fillText가 가로로 압축)
  while (ctx.measureText(value).width > 948 && size > 36) ctx.font = `800 ${--size}px ${font}`;
  ctx.fillText(value, 66, 668 + (60 - size) / 2, 948);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('이미지 저장 준비에 실패했어요.')), 'image/png'));
  return {
    dataUrl: canvas.toDataURL('image/png'),
    file: new File([blob], `moneytermi-${card.kind}-${toDateStr()}-${Date.now()}.png`, { type: 'image/png' }),
  };
};

export const supportsTossImageShare = (): boolean => {
  // 일반 브라우저에는 토스 환경 상수가 없어 SDK의 지원 여부 조회도 예외가 난다.
  try { return TossFile.saveBase64.isSupported(); } catch { return false; }
};

export const canShareAchievementImage = (image: AchievementImage): boolean => (
  supportsTossImageShare() || (typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [image.file] }))
);

export const downloadAchievementImage = (image: AchievementImage): void => {
  const link = document.createElement('a');
  link.href = image.dataUrl;
  link.download = image.file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// 이미지를 미리 만들어 둔 뒤 클릭 안에서 호출해 Web Share의 사용자 활성화를 유지한다.
export const shareAchievementImage = async (image: AchievementImage): Promise<'shared' | 'downloaded' | 'cancelled'> => {
  try {
    if (supportsTossImageShare()) {
      await TossFile.saveBase64({ data: image.dataUrl.split(',')[1], fileName: image.file.name, mimeType: 'image/png' });
      return 'shared';
    }
    if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [image.file] })) {
      await navigator.share({ files: [image.file] });
      return 'shared';
    }
    downloadAchievementImage(image);
    return 'downloaded';
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError') return 'cancelled';
    throw error;
  }
};
