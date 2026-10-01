import { Volume2, VolumeX, Bell, Moon, Vibrate, X } from 'lucide-react';
import { BottomSheet } from '@toss/tds-mobile';
import { useSettings } from '../../hooks/useSettings';
import { useNotificationAgreement } from '../../hooks/useNotificationAgreement';
import { useTheme, type Theme } from '../../hooks/useTheme';
import { Card } from '../ui/Card';

const THEME_OPTIONS: [Theme, string][] = [['system', '시스템'], ['light', '라이트'], ['dark', '다크']];

export const SettingsSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { soundOn, vibrationOn, toggleSound, toggleVibration } = useSettings();
  const { agreed, requestAgreement } = useNotificationAgreement();
  const { theme, setTheme } = useTheme();

  return (
    <BottomSheet open={open} className="original-modal" onDimmerClick={onClose} header={<div className="flex w-full items-center justify-between pl-5 pr-4"><span className="font-bold text-[var(--color-ink)]">앱 설정</span><button type="button" onClick={onClose} aria-label="설정 닫기" className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-ink-2)]"><X size={20} /></button></div>}>
      <div className="flex flex-col gap-2 bg-[var(--color-canvas)] px-5 pb-6 pt-3">
        {/* 테마 */}
        <Card pad="md" style={{ border: 0 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-chip bg-[var(--color-brand-soft)] flex items-center justify-center">
              <Moon size={16} className="text-brand-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">테마</p>
              <p className="text-xs text-[var(--color-ink-4)]">화면 밝기 모드</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {THEME_OPTIONS.map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setTheme(val)}
                className={`flex-1 py-2 rounded-button text-xs font-bold transition-colors
                  ${theme === val ? 'bg-brand-500' : 'bg-[var(--color-button-secondary)] text-[var(--color-ink-2)]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>

        {/* 효과음과 진동 */}
        <div className="rounded-card bg-[var(--color-card)] px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-chip bg-[var(--color-brand-soft)] flex items-center justify-center">
              {soundOn
                ? <Volume2 size={16} className="text-brand-500" />
                : <VolumeX size={16} className="text-[var(--color-ink-4)]" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">효과음</p>
              <p className="text-xs text-[var(--color-ink-3)]">퀴즈 정답/오답 효과음</p>
            </div>
          </div>
          <button type="button" role="switch" aria-label="효과음" aria-checked={soundOn} onClick={toggleSound}
            className="flex h-11 w-12 shrink-0 items-center justify-center">
            <span className={`flex h-7 w-12 items-center rounded-full p-0.5 transition-colors ${soundOn ? 'bg-brand-500' : 'bg-[var(--color-line-strong)]'}`}>
              <span className={`h-6 w-6 rounded-full bg-white transition-transform ${soundOn ? 'translate-x-5' : ''}`} />
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-line)] py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-chip bg-[var(--color-brand-soft)] flex items-center justify-center">
              <Vibrate size={16} className={vibrationOn ? 'text-brand-500' : 'text-[var(--color-ink-4)]'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">진동</p>
              <p className="text-xs text-[var(--color-ink-3)]">햅틱 피드백</p>
            </div>
          </div>
          <button type="button" role="switch" aria-label="진동" aria-checked={vibrationOn} onClick={toggleVibration}
            className="flex h-11 w-12 shrink-0 items-center justify-center">
            <span className={`flex h-7 w-12 items-center rounded-full p-0.5 transition-colors ${vibrationOn ? 'bg-brand-500' : 'bg-[var(--color-line-strong)]'}`}>
              <span className={`h-6 w-6 rounded-full bg-white transition-transform ${vibrationOn ? 'translate-x-5' : ''}`} />
            </span>
          </button>
        </div>
        </div>

        {/* 학습 알림 */}
        <p className="mb-1! mt-3! text-xs font-bold text-[var(--color-ink-3)]">알림</p>
        <button
          type="button"
          onClick={() => requestAgreement('settings')}
          disabled={agreed}
          className="flex items-center justify-between bg-[var(--color-card)] rounded-card px-4 py-4 text-left disabled:opacity-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-chip bg-[var(--color-brand-soft)] flex items-center justify-center">
              <Bell size={16} className={agreed ? 'text-brand-500' : 'text-[var(--color-ink-4)]'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">학습 알림</p>
              <p className="text-xs text-[var(--color-ink-3)]">복습/학습 리마인더 받기</p>
            </div>
          </div>
          <span className={`text-sm font-semibold ${agreed ? 'text-[var(--color-ink-4)]' : 'text-brand-ink'}`}>
            {agreed ? '동의됨' : '받기'}
          </span>
        </button>
      </div>
    </BottomSheet>
  );
};
