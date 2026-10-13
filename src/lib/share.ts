import { share, getTossShareLink } from '@apps-in-toss/web-framework';

// 공유 미리보기용 OG 이미지(절대 HTTPS) - 가로형 1200x630(docs/assets/share-1200x630.png).
// main의 최신 이미지를 본다. 저장소가 비공개가 되면 깨진다.
const OG_IMAGE = 'https://raw.githubusercontent.com/yyoujg/moneytermi/main/docs/assets/share-1200x630.png';

// 토스 공유 링크를 만들어 네이티브 공유 시트를 띄운다. 미지원/취소/실패 시 무시.
export const shareTossLink = async (path: string, message: string): Promise<void> => {
  try {
    const link = await getTossShareLink(path, OG_IMAGE);
    await share({ message: `${message}\n${link}` });
  } catch { /* 미지원/취소/실패 무시 */ }
};
