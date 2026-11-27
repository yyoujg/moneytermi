import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EnergyAdPrompt } from './EnergyAdPrompt';

const state = vi.hoisted(() => ({ energy: 3, enabled: true, openShop: vi.fn() }));
vi.mock('../../context/AppContext', () => ({ useAppContext: () => ({ energy: state.energy, energyMax: 10, openShop: state.openShop }) }));
vi.mock('../../lib/ads', () => ({ isRewardedAdEnabled: () => state.enabled }));
vi.mock('../../lib/analytics', () => ({ logClick: vi.fn() }));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

let cleanup = () => {};
afterEach(() => { cleanup(); state.energy = 3; state.enabled = true; vi.clearAllMocks(); });

const mount = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<EnergyAdPrompt from="test" />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('EnergyAdPrompt', () => {
  it('에너지가 덜 찼으면 버튼을 보여주고 누르면 에너지 시트를 연다', () => {
    const button = mount().querySelector('button')!;
    expect(button).toHaveTextContent('광고 보고 에너지 +5');
    act(() => button.click());
    expect(state.openShop).toHaveBeenCalledWith('energy');
  });

  it('에너지가 가득 찼거나 광고가 꺼져 있으면 숨긴다', () => {
    state.energy = 10;
    expect(mount().querySelector('button')).toBeNull();
    cleanup();
    state.energy = 3; state.enabled = false;
    expect(mount().querySelector('button')).toBeNull();
  });
});
