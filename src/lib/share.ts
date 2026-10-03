import { share, getTossShareLink } from '@apps-in-toss/web-framework';

// 공유 미리보기용 OG 이미지(절대 HTTPS) - 콘솔에 올린 수달 앱 아이콘(docs/assets/app-icon-600.png)
const OG_IMAGE = 'https://static.toss.im/appsintoss/25699/live-managed-v1-c7373a3d-ac5e-4160-a99d-0e98a41e6cf2.png';

// 토스 공유 링크를 만들어 네이티브 공유 시트를 띄운다. 미지원/취소/실패 시 무시.
export const shareTossLink = async (path: string, message: string): Promise<void> => {
  try {
    const link = await getTossShareLink(path, OG_IMAGE);
    await share({ message: `${message}\n${link}` });
  } catch { /* 미지원/취소/실패 무시 */ }
};
