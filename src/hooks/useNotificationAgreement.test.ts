import { describe, it, expect } from 'vitest';
import { toAgreementOutcome, agreementLogName } from './useNotificationAgreement';

describe('toAgreementOutcome', () => {
  it('신규 동의/기동의 → agreed', () => {
    expect(toAgreementOutcome('newAgreement')).toBe('agreed');
    expect(toAgreementOutcome('alreadyAgreed')).toBe('agreed');
  });

  it('거절 → rejected', () => {
    expect(toAgreementOutcome('agreementRejected')).toBe('rejected');
  });
});

describe('agreementLogName', () => {
  it('결과값 → 이벤트명', () => {
    expect(agreementLogName('agreed')).toBe('notification_agree');
    expect(agreementLogName('rejected')).toBe('notification_reject');
    expect(agreementLogName('error')).toBe('notification_agree_error');
  });
});
