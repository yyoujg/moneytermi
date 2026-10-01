export const RollingNumber = ({ value }: { value: number }) => {
  return <span className="tabular-nums">{value.toLocaleString('ko-KR')}</span>;
};
