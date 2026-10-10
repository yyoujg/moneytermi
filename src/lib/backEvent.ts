export const resolveBackEventAction = (historyIdx: unknown): 'back' | 'close' => (
  typeof historyIdx === 'number' && historyIdx > 0 ? 'back' : 'close'
);
