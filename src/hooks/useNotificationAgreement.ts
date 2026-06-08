import { useEffect, useRef, useState } from 'react';
import { requestNotificationAgreement } from '@apps-in-toss/web-framework';
import { Storage } from '../lib/storage';

// 발송은 토스 콘솔의 스마트 발송 캠페인이 담당한다.
// 앱은 알림 동의만 받으면 되고(appLogin/userKey 불필요), 동의 여부 저장은 UI 토글 표시용일 뿐이다.
const KEY = 'setting_notification_agreement';
const TEMPLATE_CODE = 'DAILY_TERM_PUSH'; // 콘솔 발송 코드와 일치

export const useNotificationAgreement = () => {
  const [agreed, setAgreed] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    Storage.getItem(KEY).then(v => { if (v === 'agreed') setAgreed(true); }).catch(() => {});
    return () => cleanupRef.current?.();
  }, []);

  const requestAgreement = () => {
    cleanupRef.current?.(); // 재호출 전 이전 리스너 정리 (문서 권고)
    cleanupRef.current = requestNotificationAgreement({
      options: { templateCode: TEMPLATE_CODE },
      onEvent: ({ type }) => {
        const ok = type === 'newAgreement' || type === 'alreadyAgreed';
        setAgreed(ok);
        Storage.setItem(KEY, ok ? 'agreed' : 'rejected');
        cleanupRef.current?.();
        cleanupRef.current = null;
      },
      onError: () => {
        cleanupRef.current?.();
        cleanupRef.current = null;
      },
    });
  };

  return { agreed, requestAgreement };
};
