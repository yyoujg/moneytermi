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
  const props: Props = { points: 1000, energy: 3, energyMax: 25, energyLeft: 61000, boostLeft: 0,
    refillPending: false, refillNotice: null, rewardedAdAvailable: true, rewardedAdReady: true,
    rewardedAdPreparing: false, rewardedAdPending: false, onEnergyAd: vi.fn(), onEnergyRefill: vi.fn(), onBoost: vi.fn(), ...overrides };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<EnergyShopContent {...props} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  const button = (kind: string) => container.querySelector<HTMLButtonElement>(`[data-energy-option="${kind}"]`)!;
  return { container, props, button };
};

describe('에너지 상점의 실제 조건과 동작', () => {
  it('광고+5·완충600조개·부스트300조개/30분과 실제 잔액·진행률을 유지한다', () => {
    const { container } = mount();
    expect(container).toHaveTextContent('시청 보상 에너지 +5');
    expect(container).toHaveTextContent('조개 600개');
    expect(container).toHaveTextContent('조개 300개 · 30분');
    expect(container.querySelector('.energy-shop-wallet')).toHaveTextContent('1,000개');
    const bar = container.querySelector('[role="progressbar"]')!;
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemax', '25');
    expect(bar.querySelector('span')).toHaveStyle({ width: '12%' });
  });
  it('가득 차면 두 충전만 막고, 잔액이 충분한 부스트까지 막지 않는다', () => {
    const { button, container } = mount({ energy: 25 });
    expect(button('ad')).toBeDisabled();
    expect(button('refill')).toBeDisabled();
    expect(button('boost')).not.toBeDisabled();
    expect(container).toHaveTextContent('에너지가 가득해서 지금은 충전할 필요가 없어요.');
  });
  it.each([[599, false], [600, true]])('보유 조개%i개의 완충 가능 여부를 바꾸지 않는다', (points, canBuy) => {
    const { button } = mount({ points: points as number });
    expect(button('refill').disabled).toBe(!canBuy);
  });
  it('충전 요청 중에는 다시 구매하지 않는다', () => {
    const { button, props } = mount({ refillPending: true });
    expect(button('refill')).toBeDisabled();
    expect(button('refill')).toHaveTextContent('충전 중');
    act(() => button('refill').click());
    expect(props.onEnergyRefill).not.toHaveBeenCalled();
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
  it('가능한 세 행동은 전달받은 기존 콜백만 실행한다', () => {
    const { button, props } = mount();
    act(() => { button('ad').click(); button('refill').click(); button('boost').click(); });
    expect(props.onEnergyAd).toHaveBeenCalledOnce();
    expect(props.onEnergyRefill).toHaveBeenCalledOnce();
    expect(props.onBoost).toHaveBeenCalledOnce();
  });
  it.each([{ points: 299, boostLeft: 0 }, { points: 1000, boostLeft: 125000 }])('부스트 잔액/사용 중 조건을 유지한다', state => {
    const { button, props } = mount(state);
    expect(button('boost')).toBeDisabled();
    act(() => button('boost').click());
    expect(props.onBoost).not.toHaveBeenCalled();
  });
  it('자동 충전·부스트 남은 시간을 기존 방식으로 표시한다', () => {
    const { container } = mount({ energyLeft: 3599000, boostLeft: 125000 });
    expect(container).toHaveTextContent('다음 충전: 1시간 0분 후');
    expect(container).toHaveTextContent('2:05 남음');
  });
  it('네트워크 실패는 경고로 남기고 이용 안내와 복습 무료 조건을 유지한다', () => {
    const { container } = mount({ refillNotice: { tone: 'network', text: '네트워크가 불안정해 충전하지 못했어요' } });
    expect(container.querySelector('[role="alert"]')).toHaveTextContent('네트워크가 불안정해 충전하지 못했어요');
    expect(container).toHaveTextContent('이어하기, 다시 보기, 복습은 무료예요.');
    expect(container).toHaveTextContent('XP 50마다 조개 +50개');
  });
});
