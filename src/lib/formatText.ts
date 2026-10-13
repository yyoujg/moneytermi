const SHORT_UNIT_PATTERN = /(\d[\d,.]*(?:천|만|억|조)?)[ \t]+(원|달러|엔|유로|개월|문제|XP|P|%|개|명|일|년|회|점|배)(?=[\s,.)!?]|[가-힣]|$)/g;

export const keepShortUnitsTogether = (text: string): string =>
  text.replace(SHORT_UNIT_PATTERN, '$1\u00a0$2');
