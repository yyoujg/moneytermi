import { share, getTossShareLink } from '@apps-in-toss/web-framework';

// 공유 미리보기용 OG 이미지(절대 HTTPS) — 브랜드 아이콘
const OG_IMAGE = 'https://static.toss.im/appsintoss/25699/18f666e4-2b68-4c41-98d4-34fdc6e1599e.png';

// 토스 공유 링크를 만들어 네이티브 공유 시트를 띄운다. 미지원/취소/실패 시 무시.
export const shareTossLink = async (path: string, message: string): Promise<void> => {
  try {
    const link = await getTossShareLink(path, OG_IMAGE);
    await share({ message: `${message}\n${link}` });
  } catch { /* 미지원/취소/실패 무시 */ }
};
