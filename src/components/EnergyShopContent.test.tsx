import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EnergyShopContent } from './EnergyShopContent';

type Props = ComponentProps<typeof EnergyShopContent>;
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (overrides: Partial<Props> = {}) => {
  const props: Props = { energy: 3, energyMax: 25, energyLeft: 61000, rewardedAdAvailable: true, rewardedAdReady: true,
    rewardedAdPreparing: false, rewardedAdPending: false, onEnergyAd: vi.fn(), ...overrides };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<EnergyShopContent {...props} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  const button = (kind: string) => container.querySelector<HTMLButtonElement>(`[data-energy-option="${kind}"]`)!;
  return { container, props, button };
};

describe('에너지 시트의 실제 조건과 동작', () => {
  it('광고+5와 진행률만 보여주고 코인 완충·부스트는 없다', () => {
    const { container, button } = mount();
    expect(container).toHaveTextContent('시청 보상 에너지 +5');
    expect(container).not.toHaveTextContent(/코인|부스트/);
    expect(button('refill')).toBeNull();
    expect(button('boost')).toBeNull();
    const bar = container.querySelector('[role="progressbar"]')!;
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemax', '25');
    expect(bar.querySelector('span')).toHaveStyle({ width: '12%' });
  });
  it('가득 차면 광고 충전을 막는다', () => {
    const { button } = mount({ energy: 25 });
    expect(button('ad')).toBeDisabled();
  });
  it.each([{ rewardedAdReady: false, rewardedAdPreparing: true }, { rewardedAdPending: true }])('광고 준비/표시 중 상태를 유지한다', state => {
    const { button, props } = mount(state);
    expect(button('ad')).toBeDisabled();
    act(() => button('ad').click());
    expect(props.onEnergyAd).not.toHaveBeenCalled();
  });
  it('광고 기능 미지원 상태의 안내 콜백 경로도 기존대로 둔다', () => {
    const { button, props } = mount({ rewardedAdAvailable: false, rewardedAdReady: false });
    expect(button('ad')).not.toBeDisabled();
    act(() => button('ad').click());
    expect(props.onEnergyAd).toHaveBeenCalledOnce();
  });
  it('자동 충전 남은 시간을 기존 방식으로 표시한다', () => {
    const { container } = mount({ energyLeft: 3599000 });
    expect(container).toHaveTextContent('다음 충전: 1시간 0분 후');
  });
  it('이용 안내와 복습 무료 조건을 유지한다', () => {
    const { container } = mount();
    expect(container).toHaveTextContent('이어하기, 다시 보기, 복습은 무료예요.');
  });
});
