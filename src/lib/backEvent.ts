export const resolveBackEventAction = (historyIdx: unknown): 'back' | 'close' => (
  typeof historyIdx === 'number' && historyIdx > 0 ? 'back' : 'close'
);

// 토스의 뒤로가기 이벤트도 읽기 전용 미리보기를 먼저 닫는다.
export const dismissRelatedWordPreview = (root: Document = document): boolean => {
  const dialog = root.querySelector<HTMLDialogElement>('dialog[data-related-word-preview][open]');
  if (!dialog) return false;
  dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
  return true;
};
