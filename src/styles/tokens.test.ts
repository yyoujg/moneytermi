/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { cwd } from 'node:process';

const css = readFileSync(resolvePath(cwd(), 'src/styles/tokens.css'), 'utf8');
const indexCss = readFileSync(resolvePath(cwd(), 'src/index.css'), 'utf8');
const declarations = (selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`))?.[1] ?? '';
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim().replace(/\s*!important$/, '')]));
};
const light = declarations(':root');
const dark = { ...light, ...declarations('.dark') };
const resolve = (name: string, values: Record<string, string>, seen: string[] = []): string => {
  if (seen.includes(name)) throw new Error(`순환 참조: ${name}`);
  const value = values[name];
  if (!value) throw new Error(`정의되지 않은 색상: ${name}`);
  const alias = value.match(/^var\((--[\w-]+)\)$/)?.[1];
  return alias ? resolve(alias, values, [...seen, name]) : value;
};
const luminance = (hex: string) => {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error(`명도 계산에 필요한 단색이 아님: ${hex}`);
  const [r, g, b] = hex.slice(1).match(/../g)!.map(value => parseInt(value, 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

for (const [name, values] of [['라이트', light], ['다크', dark]] as const) {
  describe(`${name} 디자인 시스템`, () => {
    for (const [foreground, background] of [
      ['--color-on-action', '--color-action-secondary'],
      ['--color-on-action', '--color-button-disabled'],
      ['--color-on-action', '--color-action-secondary-pressed'],
      ['--color-ink', '--color-card'],
      ['--color-ink', '--color-surface'],
      ['--color-ink-2', '--color-card'],
      ['--color-ink-3', '--color-card'],
      ['--color-ink-4', '--color-canvas'],
      ['--color-brand-text', '--color-brand-soft'],
      ['--color-success-foreground', '--color-success-soft'],
      ['--color-danger-foreground', '--color-danger-soft'],
      ['--color-tooltip-ink', '--color-tooltip'],
      ['--color-selection-ink', '--color-selection-soft'],
      ['--color-reward-foreground', '--color-card'],
      ['--color-reward-foreground', '--color-canvas'],
      ['--color-reward-foreground', '--color-surface'],
      ['--color-ink-3', '--color-filter-tray'],
    ]) {
      it(`${foreground} / ${background} 글자 대비가 4.5 이상이다`, () => {
        expect(contrast(resolve(foreground, values), resolve(background, values))).toBeGreaterThanOrEqual(4.5);
      });
    }
    it('주행동은 웜 잉크이고 다크에서는 밝게 뒤집는다', () => {
      expect(resolve('--color-brand-action', values)).toBe(name === '라이트' ? '#1c1917' : '#f7f5f2');
      expect(contrast(resolve('--color-on-brand', values), resolve('--color-brand-action', values))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(resolve('--color-on-brand', values), resolve('--color-brand-pressed', values))).toBeGreaterThanOrEqual(4.5);
    });
    it('누름 색은 기본과 구분되고 글자 대비를 유지한다', () => {
      expect(resolve('--color-brand-pressed', values)).not.toBe(resolve('--color-brand-action', values));
      expect(contrast(resolve('--color-on-brand', values), resolve('--color-brand-pressed', values))).toBeGreaterThanOrEqual(4.5);
      expect(luminance(resolve('--color-action-soft-pressed', values)))
        .toBeLessThan(luminance(resolve('--color-action-soft', values)));
      expect(luminance(resolve('--color-action-secondary-pressed', values)))
        .toBeLessThan(luminance(resolve('--color-action-secondary', values)));
    });
    it('호환 표면·통계·히어로 역할이 끊기지 않고 단색으로 해석된다', () => {
      for (const key of Object.keys(values).filter(key => key.startsWith('--color-') && key !== '--color-overlay')) {
        expect(resolve(key, values), key).toMatch(/^#[\da-f]{6}$/i);
      }
    });
    it('밝은 보조 버튼은 바탕과 구분되는 중성 면과 짙은 글자로 충분한 대비를 사용한다', () => {
      // 라이트는 surface가 canvas와 거의 같아 한 단계 진한 회색을 쓴다
      expect(resolve('--color-action-soft', values)).toBe(name === '라이트' ? '#ebe7e2' : resolve('--color-surface', values));
      expect(resolve('--color-on-action-soft', values)).toBe(resolve('--color-ink-2', values));
      for (const background of ['--color-action-soft', '--color-action-soft-pressed']) {
        expect(contrast(resolve('--color-on-action-soft', values), resolve(background, values))).toBeGreaterThanOrEqual(4.5);
      }
    });
    it('진행·강한 경계는 비문자 대비 3 이상을 유지한다', () => {
      for (const foreground of ['--color-progress', '--color-line-strong', '--color-brand-action', '--color-brand-pressed']) {
        expect(contrast(resolve(foreground, values), resolve('--color-canvas', values)), foreground).toBeGreaterThanOrEqual(3);
      }
      for (const foreground of ['--color-progress', '--color-line-strong']) {
        for (const background of ['--color-card', '--color-surface']) {
          expect(contrast(resolve(foreground, values), resolve(background, values)), foreground + background).toBeGreaterThanOrEqual(3);
        }
      }
      expect(contrast(resolve('--color-brand-line-strong', values), resolve('--color-selection-soft', values))).toBeGreaterThanOrEqual(3);
    });
    it('새 여섯 역할은 두 테마에서 해석되고 페이지별로 덮어쓰지 않는다', () => {
      for (const key of ['--color-progress', '--color-reward-foreground', '--color-selection-soft', '--color-selection-ink', '--color-character-stage', '--color-filter-tray']) {
        expect(resolve(key, values)).toMatch(/^#[\da-f]{6}$/i);
        for (const selector of [':is(.my-page-screen, .league-screen, .identity-badge, .badge-tone)', '.dark :is(.my-page-screen, .league-screen, .identity-badge, .badge-tone)', '.league-screen', '.dark .league-screen']) {
          expect(declarations(selector)[key], selector + key).toBeUndefined();
        }
      }
      expect(resolve('--color-selection-soft', values)).toBe(resolve('--color-brand-soft', values));
      expect(resolve('--color-character-stage', values)).toBe(resolve('--color-surface', values));
      expect(resolve('--color-filter-tray', values)).toBe(name === '라이트' ? '#ebe7e2' : '#2e2a27');
    });
    it('주행동 글자는 라이트 흰색·다크 잉크, 중성 채움 버튼 글자는 흰색이다', () => {
      expect(resolve('--color-on-brand', values)).toBe(name === '라이트' ? '#ffffff' : '#1c1917');
      expect(resolve('--color-on-action', values)).toBe('#ffffff');
    });
  });
}

describe('이해 확인의 캐릭터·중성 상태 표현', () => {
  it('이해 확인 전용 파랑 역할을 제거하고 기존 퀴즈 상태색은 보존한다', () => {
    expect(css).not.toContain('--color-answer-');
    // 파일 뒤에 추가된 다른 화면의 오류색이 아니라 이해 확인 선택자의 선언만 검사한다.
    const feedbackCss = [...indexCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, selector]) => /\.lesson-(feedback|complete)/.test(selector))
      .map(([rule]) => rule)
      .join('\n');
    expect(feedbackCss).not.toMatch(/--color-(answer|danger|success)-/);
    expect(feedbackCss).not.toContain('.lesson-feedback-character');
    expect(feedbackCss).toContain('.lesson-complete-score-track > span { background: var(--color-ink-3); }');
    for (const [values, success, danger] of [[light, '#2a7155', '#a63a47'], [dark, '#6cc9a0', '#f08a97']] as const) {
      expect(resolve('--color-success-foreground', values)).toBe(success);
      expect(resolve('--color-danger-foreground', values)).toBe(danger);
    }
  });
  it('정답·내 선택·펼친 보기의 상태 표면은 모두 중성 역할이다', () => {
    for (const selector of ['.lesson-feedback-answer', '.lesson-feedback-my-answer', '.lesson-feedback-options li:is(.is-correct, .is-wrong)']) {
      const start = indexCss.indexOf(selector + ' {');
      const body = indexCss.slice(start, indexCss.indexOf('}', start));
      expect(body, selector).toContain('background: var(--color-surface)');
      expect(body, selector).toMatch(/color: var\(--color-ink(?:-2)?\)/);
    }
  });
});

describe('색상 정의의 단일 원본', () => {
  it('페이지 바탕·일반 표면은 라이트와 다크에서만 정의한다', () => {
    for (const key of ['canvas', 'card', 'surface']) {
      expect(css.match(new RegExp('--color-' + key + ':', 'g'))).toHaveLength(2);
    }
    expect(resolve('--color-canvas', light)).toBe('#f7f5f2');
    expect(resolve('--color-canvas', dark)).toBe('#1c1917');
    const recap = readFileSync(resolvePath(cwd(), 'src/components/WeeklyRecap.tsx'), 'utf8');
    expect(recap).toContain('bg-[var(--color-canvas)]');
    expect(recap).not.toContain('bg-[var(--color-hero-start)]');
  });
  it('학습 카드에는 브랜드색 테두리나 장식 강조선을 추가하지 않는다', () => {
    const current = indexCss.match(/\.course-node-current\s*\{([^}]+)\}/)?.[1] ?? '';
    const definition = indexCss.match(/\.word-study-definition\s*\{([^}]+)\}/)?.[1] ?? '';
    expect(current).toContain('border-color: var(--color-line)');
    expect(indexCss).toMatch(/\.course-node-current::before\s*\{\s*content:\s*none;\s*\}/);
    expect(definition).toContain('border-top-color: var(--color-line)');
    expect(definition).not.toContain('--color-brand');
    expect(definition).not.toContain('3px');
  });
  it('메인 컬러가 장식에 새지 않도록 브랜드 장식·글자 역할은 중성색이다', () => {
    for (const values of [light, dark]) {
      expect(resolve('--color-brand-text', values)).toBe(resolve('--color-ink-2', values));
      expect(resolve('--color-brand-on-light-surface', values)).toBe(resolve('--color-ink-2', values));
      expect(resolve('--color-brand-decoration', values)).toBe(resolve('--color-ink-2', values));
      expect(resolve('--color-brand-soft', values)).toBe(resolve('--color-surface', values));
    }
    expect(indexCss).toContain('--color-brand-ink: var(--color-brand-decoration)');
    expect(indexCss).toContain('.text-brand-ink { color: var(--color-brand-text) !important; }');
    expect(indexCss).toContain('svg:is(.text-brand-300, .text-brand-400, .text-brand-500, .text-brand-600, .text-brand-ink) { color: var(--color-brand-decoration) !important; }');
  });
  it('밝은 보조 버튼은 활성·비활성·눌림의 색상 역할을 분리한다', () => {
    const normal = indexCss.match(/button\.action-button\[data-tone='soft'\]\s*\{([^}]+)\}/)?.[1] ?? '';
    const disabled = indexCss.match(/button\.action-button\[data-tone='soft'\]:disabled\s*\{([^}]+)\}/)?.[1] ?? '';
    const pressed = indexCss.match(/button\.action-button\[data-tone='soft'\]:not\(:disabled\):active\s*\{([^}]+)\}/)?.[1] ?? '';
    expect(normal).toContain('background: var(--color-action-soft)');
    expect(normal).toContain('color: var(--color-on-action-soft) !important');
    expect(normal).toContain('border-color: transparent');
    expect(disabled).toContain('color: var(--color-ink-4) !important');
    expect(disabled).toContain('background: var(--color-surface) !important');
    expect(pressed).toContain('background-color: var(--color-action-soft-pressed) !important');
  });
  it('채운 버튼의 눌림에 투명도나 필터를 겹치지 않는다', () => {
    const pressed = indexCss.match(/button\.action-button:not\(:disabled\):active,\s*button\.action-secondary:not\(:disabled\):active,\s*button\.bg-brand-500:not\(:disabled\):active\s*\{([^}]+)\}/)?.[1] ?? '';
    expect(pressed).toContain('opacity: 1 !important');
    expect(pressed).toContain('filter: none !important');
    expect(indexCss).toContain('-webkit-tap-highlight-color: transparent');
  });
  it('색상 값은 토큰 파일에만 두고 공통 스타일은 참조한다', () => {
    expect(indexCss).toContain('@import "./styles/tokens.css"');
    const withoutCommentsAndSwitchSelector = indexCss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\[style\*="#[\da-f]+"\]/gi, '');
    expect(withoutCommentsAndSwitchSelector).not.toMatch(/#[\da-f]{3,8}\b/i);
  });
  it('히어로와 통계의 큰 표면은 공통 중성 역할을 따른다', () => {
    expect(light['--color-hero-start']).toBe('var(--color-card)');
    expect(light['--color-hero-end']).toBe('var(--color-card)');
    expect(light['--color-xp-soft']).toBe('var(--color-surface)');
    expect(light['--color-points-soft']).toBe('var(--color-surface)');
  });
});

describe('배지·리그·프로필의 기존 표현 보존', () => {
  const scope = ':is(.my-page-screen, .league-screen, .identity-badge, .badge-tone)';
  it('프로필과 배지는 장식색을 보존하고 공통 바탕·카드를 상속한다', () => {
    const identity = declarations(scope);
    expect(identity['--color-canvas']).toBeUndefined();
    expect(identity['--color-card']).toBeUndefined();
    expect(identity['--color-surface']).toBeUndefined();
    expect(identity['--color-ink']).toBeUndefined();
    expect(identity['--color-brand-soft']).toBeUndefined();
    expect(identity['--color-brand-ink']).toBe('var(--color-brand-decoration)');
    expect(identity['--color-brand-cream']).toBe('var(--color-brand-soft)');
    expect(identity['--radius-card']).toBe('var(--shape-card)');
    expect(resolve('--color-canvas', light)).toBe('#f7f5f2');
  });
  it('다크 모드도 공통 바탕·카드와 등급 장식색을 분리한다', () => {
    const identity = declarations(`.dark ${scope}`);
    expect(identity['--color-canvas']).toBeUndefined();
    expect(identity['--color-card']).toBeUndefined();
    expect(identity['--color-surface']).toBeUndefined();
    expect(identity['--color-brand-ink']).toBeUndefined();
    expect(identity['--color-brand-soft']).toBeUndefined();
    expect(identity['--color-brand-line']).toBeUndefined();
  });
  for (const [name, base, selector] of [['라이트', light, scope], ['다크', dark, `.dark ${scope}`]] as const) {
    it(`${name} 마이페이지·리그는 같은 중성 바탕을 사용하고 글자 대비도 유지한다`, () => {
      const identity = declarations(selector);
      const values = { ...base, ...identity };
      for (const background of ['--color-canvas', '--color-card', '--color-surface']) {
        expect(identity[background]).toBeUndefined();
        expect(resolve(background, values)).toBe(resolve(background, base));
      }
      for (const foreground of ['--color-ink', '--color-ink-2', '--color-ink-3', '--color-ink-4']) {
        expect(identity[foreground]).toBeUndefined();
        expect(resolve(foreground, values)).toBe(resolve(foreground, base));
        for (const background of ['--color-card', '--color-canvas', '--color-surface']) {
          expect(contrast(resolve(foreground, values), resolve(background, values))).toBeGreaterThanOrEqual(4.5);
        }
      }
      expect(resolve('--color-brand-text', values)).toBe(resolve('--color-ink-2', base));
    });
  }
  it('리그의 금·은·동은 작은 표식에만 남기고 행은 같은 카드 표면을 사용한다', () => {
    const league = declarations('.league-screen');
    expect(league['--radius-card']).toBe('var(--shape-card)');
    expect(league['--color-league-hero']).toBeUndefined();
    expect(declarations('.dark .league-screen')['--color-league-hero']).toBeUndefined();
    expect(league['--color-league-first']).toBe('var(--color-card)');
    expect(league['--color-league-second']).toBe('var(--color-card)');
    expect(league['--color-league-third']).toBe('var(--color-card)');
    expect(indexCss).not.toContain('.league-ranking-row[data-podium]:not(.is-me)');
    expect(indexCss).not.toContain('--league-row-tint');
  });
});


describe('수달 아이콘과 통일한 평면 카드·버튼 표면', () => {
  it('모든 테마와 화면이 같은 둥근 모서리 원본을 사용한다', () => {
    for (const values of [light, dark]) {
      expect(values['--shape-card']).toBe('var(--shape-xl)');
      expect(values['--shape-button']).toBe('var(--shape-lg)');
      expect(values['--shape-chip']).toBe('var(--shape-md)');
      expect(values['--shape-inset']).toBe('var(--shape-lg)');
      expect([values['--shape-sm'], values['--shape-md'], values['--shape-lg'], values['--shape-xl']]).toEqual(['4px', '6px', '8px', '12px']);
      const shadows = Object.keys(values).filter(key => key.startsWith('--shadow-'));
      expect(shadows).toEqual(expect.arrayContaining(['--shadow-card', '--shadow-card-pressed', '--shadow-choice', '--shadow-action', '--shadow-action-secondary', '--shadow-action-soft', '--shadow-action-pressed']));
      for (const key of shadows) expect(values[key], key).toBe('none');
    }
    for (const [key, value] of Object.entries(declarations('.dark')).filter(([key]) => key.startsWith('--shadow-'))) {
      expect(value, key).toBe('none');
    }
  });
  it('카드·버튼은 평면 역할을 참조하고 누를 때 위치를 이동하지 않는다', () => {
    expect(indexCss).toContain('box-shadow: var(--shadow-card) !important');
    expect(indexCss).toContain(":is(.app-card[data-card-tone='card'],");
    expect(indexCss).not.toContain("data-card-tone='surface'");
    expect(indexCss).toMatch(/button\.action-button\[data-tone='soft'\]:disabled\s*\{[^}]*box-shadow:\s*none !important;\s*transform:\s*none !important/s);
    const pressed = [...indexCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, selector]) => selector.includes('button.action-button:not(:disabled):active'))
      .map(([, , body]) => body).join('\n');
    expect(pressed).toContain('transform: none !important');
    expect(pressed).not.toContain('translateY');
    expect(indexCss).toContain('box-shadow: var(--shadow-action-pressed) !important');
  });
});

describe('다른 그림과 통일한 원형 파스텔 순위 표시', () => {
  for (const [name, values] of [['라이트', light], ['다크', dark]] as const) {
    it(`${name} 숫자는 테마와 관계없이 밝은 그림 안에서 충분히 구분된다`, () => {
      expect(contrast(resolve('--color-league-symbol-ink', values), '#fffbf3')).toBeGreaterThanOrEqual(4.5);
      expect(resolve('--color-league-symbol-ink', values)).toBe('#44403c');
      expect(indexCss).toContain('.league-rank-symbol { display: block; flex: none; width: 40px; height: 40px; }');
      expect(indexCss).toContain('.league-rank-value { position: absolute; inset-inline: 0; top: 14px;');
      expect(indexCss).not.toContain(".league-rank-badge[data-podium='3'] .league-rank-value");
      expect(indexCss).not.toContain(".league-rank-badge[data-podium='1'] { background:");
    });
  }
});

describe('닉네임 입력의 둥근 초점 표시', () => {
  it('기본 초점은 중성 회색이며 오류 상태는 기존 빨강을 유지한다', () => {
    expect(indexCss).toContain('.nickname-field { --nickname-focus-ring: var(--color-ink-3);');
    expect(indexCss).toContain('.nickname-field.has-error { --nickname-focus-ring: var(--color-danger-foreground);');
    for (const values of [light, dark]) {
      expect(contrast(resolve('--color-ink-3', values), resolve('--color-surface', values))).toBeGreaterThanOrEqual(3);
    }
  });
  it('안쪽 사각 선을 없애되 바깥 영역의 초점선은 스크롤 영역 안에서 잘리지 않는다', () => {
    expect(indexCss).toMatch(/\.nickname-field:has\(input:focus-visible\)\s*\{[^}]*outline: 2px solid var\(--nickname-focus-ring\);[^}]*outline-offset: -2px;/s);
    expect(indexCss).toMatch(/\.nickname-field input\.nickname-input:focus-visible\s*\{[^}]*outline: none !important;/s);
  });
});

describe('원시값과 의미 역할의 2단계 구조', () => {
  it('의미 색 역할은 원시 팔레트만 참조하고 직접 색값을 갖지 않는다', () => {
    for (const selector of [':root', '.dark']) {
      for (const [key, value] of Object.entries(declarations(selector)).filter(([key]) => key.startsWith('--color-') && key !== '--color-overlay')) {
        expect(value, key).toMatch(/^var\(--/);
      }
    }
  });
  it('글자·간격·곡률은 정해진 단계만 정의한다', () => {
    expect(['caption', 'label', 'body', 'headline', 'title-3', 'title-2', 'title-1', 'display'].map(step => light[`--font-size-${step}`])).toEqual(['11px', '13px', '15px', '17px', '20px', '24px', '28px', '34px']);
    expect(['regular', 'semibold', 'bold'].map(step => light[`--font-weight-${step}`])).toEqual(['400', '600', '700']);
    for (const [key, value] of Object.entries(light).filter(([key]) => key.startsWith('--space-'))) {
      expect(parseInt(value) % 4, key).toBe(0);
    }
  });
});

describe('웜 모노 팔레트', () => {
  it('라이트는 따뜻한 회색 바탕·흰 카드·잉크 행동·중성 장식을 사용한다', () => {
    expect(resolve('--color-canvas', light)).toBe('#f7f5f2');
    expect(resolve('--color-card', light)).toBe('#ffffff');
    expect(resolve('--color-surface', light)).toBe('#f2efeb');
    expect(resolve('--color-brand-action', light)).toBe('#1c1917');
    expect(resolve('--color-brand-decoration', light)).toBe('#44403c');
    expect(resolve('--color-brand-accent', light)).toBe('#66605b');
  });
  it('다크에서도 행동 버튼과 바탕의 비문자 대비를 확보한다', () => {
    expect(contrast(resolve('--color-brand-action', dark), resolve('--color-canvas', dark))).toBeGreaterThanOrEqual(3);
    expect(resolve('--color-canvas', dark)).toBe('#1c1917');
  });
  it('마이페이지·리그의 구분선도 공통 중성·민트 역할을 상속한다', () => {
    for (const selector of [':is(.my-page-screen, .league-screen, .identity-badge, .badge-tone)', '.dark :is(.my-page-screen, .league-screen, .identity-badge, .badge-tone)']) {
      expect(declarations(selector)['--color-line']).toBeUndefined();
      expect(declarations(selector)['--color-line-strong']).toBeUndefined();
    }
  });
});

describe('보상 장식과 실제 재화·배지 역할의 분리', () => {
  it('수치 글자와 통계 아이콘은 색 없이 중성색을 쓴다', () => {
    for (const values of [light, dark]) {
      for (const role of ['--color-xp', '--color-points', '--color-info']) {
        expect(values[role], role).toBe('var(--color-ink-2)');
      }
      for (const role of ['--color-stat-words', '--color-stat-streak', '--color-stat-points', '--color-stat-energy', '--color-stat-xp']) {
        expect(values[role], role).toBe('var(--color-ink-2)');
      }
      for (const role of ['--color-xp-soft', '--color-points-soft', '--color-info-soft']) {
        expect(values[role], role).toBe('var(--color-surface)');
      }
      expect(resolve('--color-success-action', values)).toBe(resolve('--accent-green-ink', values));
      expect(resolve('--color-danger-action', values)).toBe(resolve('--accent-rose-ink', values));
    }
  });
  for (const [name, base, prefix] of [['라이트', light, ''], ['다크', dark, '.dark ']] as const) {
    it(name + ' 배지의 의미·미획득 조건과 글자 대비를 보존한다', () => {
      for (const stat of ['words', 'streak', 'xp']) {
        const selector = '.badge-tone[data-badge-stat]';
        // 배지는 바탕 없이 카드 위에 바로 놓인다.
        const earned = { ...base, ...declarations(selector), ...declarations(prefix + selector) };
        expect(earned['--badge-bg']).toBeUndefined();
        expect(contrast(resolve('--badge-ink', earned), resolve('--color-card', earned)), stat).toBeGreaterThanOrEqual(4.5);
        const unearned = { ...earned, ...declarations(".badge-tone[data-earned='false']"), ...declarations(prefix + ".badge-tone[data-earned='false']") };
        expect(resolve('--badge-ink', unearned)).toBe(resolve('--color-ink-3', base));
        expect(resolve('--badge-line', unearned)).toBe(resolve('--color-line', base));
        expect(contrast(resolve('--badge-ink', unearned), resolve('--color-card', unearned))).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

describe('어두운 카드 위 채움 버튼의 평면 경계', () => {
  it('밝은 화면과 어두운 화면의 경계선이 카드와 3:1 이상 구분된다', () => {
    for (const values of [light, dark]) {
      expect(contrast(resolve('--color-action-boundary', values), resolve('--color-card', values))).toBeGreaterThanOrEqual(3);
    }
  });
  it('어두운 채움 버튼에 선을 사용하고 밝은 soft·비활성 상태와 분리한다', () => {
    expect(indexCss).toContain(".dark :is(button.action-button, button.action-secondary, button.bg-brand-500):not([data-tone='soft']):not(:disabled)");
    expect(indexCss).toContain('border: 1px solid var(--color-action-boundary) !important');
  });
});
