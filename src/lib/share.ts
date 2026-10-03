import { share, getTossShareLink } from '@apps-in-toss/web-framework';

// 공유 미리보기용 OG 이미지(절대 HTTPS) - 가로형 1200x630(docs/assets/share-1200x630.png).
// 커밋 SHA로 고정한 GitHub raw 주소라 파일을 바꾸면 새 커밋 SHA로 갱신해야 한다. 저장소가 비공개가 되면 깨진다.
const OG_IMAGE = 'https://raw.githubusercontent.com/yyoujg/moneytermi/358feebed19000496a797ce458c638d853393246/docs/assets/share-1200x630.png';

// 토스 공유 링크를 만들어 네이티브 공유 시트를 띄운다. 미지원/취소/실패 시 무시.
export const shareTossLink = async (path: string, message: string): Promise<void> => {
  try {
    const link = await getTossShareLink(path, OG_IMAGE);
    await share({ message: `${message}\n${link}` });
  } catch { /* 미지원/취소/실패 무시 */ }
};
