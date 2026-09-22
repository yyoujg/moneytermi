import { useEffect, useRef, useState } from 'react';
import { requestNotificationAgreement, type NotificationAgreementResult } from '@apps-in-toss/web-framework';
import { Storage } from '../lib/storage';
import { logClick } from '../lib/analytics';

// 발송은 토스 콘솔의 스마트 발송 캠페인이 담당한다.
// 앱은 알림 동의만 받으면 되고(appLogin/userKey 불필요), 동의 여부 저장은 UI 토글 표시용일 뿐이다.
const KEY = 'setting_notification_agreement';
const TEMPLATE_CODE = 'moneytermi-DAILY_TERM_PUSH2'; // 콘솔 기능성 캠페인 발송 코드(templateSetCode)와 일치 (moneytermi- 접두사는 콘솔 자동 부여)

export type AgreementOutcome = 'agreed' | 'rejected' | 'error';
export type AgreementSource = 'prompt_card' | 'settings';

// 결과값 → 로그 이벤트명 (category_action 컨벤션)
export const agreementLogName = (outcome: AgreementOutcome) =>
  outcome === 'agreed' ? 'notification_agree'
  : outcome === 'rejected' ? 'notification_reject'
  : 'notification_agree_error';

// 토스 동의 시트 이벤트 → 저장/로깅에 쓰는 결과값
export const toAgreementOutcome = (type: NotificationAgreementResult): 'agreed' | 'rejected' =>
  type === 'newAgreement' || type === 'alreadyAgreed' ? 'agreed' : 'rejected';

export const useNotificationAgreement = () => {
  const [agreed, setAgreed] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    Storage.getItem(KEY).then(v => { if (v === 'agreed') setAgreed(true); }).catch(() => {});
    return () => cleanupRef.current?.();
  }, []);

  // 시트에서 동의/거절하거나 에러가 나면 resolve. 시트를 그냥 닫으면 이벤트가 없어 resolve되지 않는다.
  const requestAgreement = (source: AgreementSource) => new Promise<AgreementOutcome>(resolve => {
    const done = (outcome: AgreementOutcome) => {
      logClick(agreementLogName(outcome), { source });
      resolve(outcome);
    };
    cleanupRef.current?.(); // 재호출 전 이전 리스너 정리 (문서 권고)
    try {
      cleanupRef.current = requestNotificationAgreement({
        options: { templateCode: TEMPLATE_CODE },
        onEvent: ({ type }) => {
          const outcome = toAgreementOutcome(type);
          setAgreed(outcome === 'agreed');
          Storage.setItem(KEY, outcome);
          cleanupRef.current?.();
          cleanupRef.current = null;
          done(outcome);
        },
        onError: () => {
          cleanupRef.current?.();
          cleanupRef.current = null;
          done('error');
        },
      });
    } catch {
      cleanupRef.current = null;
      done('error');
    }
  });

  return { agreed, requestAgreement };
};
