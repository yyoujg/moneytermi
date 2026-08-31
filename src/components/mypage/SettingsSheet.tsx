import { Volume2, VolumeX, Bell, Moon } from 'lucide-react';
import { Switch, BottomSheet } from '@toss/tds-mobile';
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
    <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>앱 설정</span>}>
      <div className="px-5 pb-6 flex flex-col gap-2">
        {/* 테마 */}
        <Card tone="surface" pad="md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-chip bg-[var(--color-line)] flex items-center justify-center">
              <Moon size={16} className="text-[var(--color-ink-2)]" />
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
                  ${theme === val ? 'bg-brand-500 text-white' : 'bg-[var(--color-card)] border border-[var(--color-line)] text-[var(--color-ink-3)]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>

        {/* 효과음 */}
        <Card tone="surface" pad="md" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-chip bg-[var(--color-line)] flex items-center justify-center">
              {soundOn
                ? <Volume2 size={16} className="text-[var(--color-ink-2)]" />
                : <VolumeX size={16} className="text-[var(--color-ink-4)]" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">효과음</p>
              <p className="text-xs text-[var(--color-ink-4)]">퀴즈 정답/오답 효과음</p>
            </div>
          </div>
          <Switch checked={soundOn} onChange={toggleSound} />
        </Card>

        {/* 진동 */}
        <Card tone="surface" pad="md" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-chip bg-[var(--color-line)] flex items-center justify-center">
              <span className={`text-base ${vibrationOn ? 'text-[var(--color-ink-2)]' : 'text-[var(--color-ink-4)]'}`}>📳</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">진동</p>
              <p className="text-xs text-[var(--color-ink-4)]">햅틱 피드백</p>
            </div>
          </div>
          <Switch checked={vibrationOn} onChange={toggleVibration} />
        </Card>

        {/* 학습 알림 */}
        <button
          type="button"
          onClick={requestAgreement}
          disabled={agreed}
          className="flex items-center justify-between bg-[var(--color-surface)] rounded-card px-4 py-4 text-left disabled:opacity-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-chip bg-[var(--color-line)] flex items-center justify-center">
              <Bell size={16} className={agreed ? 'text-[var(--color-ink-2)]' : 'text-[var(--color-ink-4)]'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">학습 알림</p>
              <p className="text-xs text-[var(--color-ink-4)]">복습/학습 리마인더 받기</p>
            </div>
          </div>
          <span className={`text-sm font-semibold ${agreed ? 'text-[var(--color-ink-4)]' : 'text-brand-500'}`}>
            {agreed ? '동의됨' : '받기'}
          </span>
        </button>
      </div>
    </BottomSheet>
  );
};
