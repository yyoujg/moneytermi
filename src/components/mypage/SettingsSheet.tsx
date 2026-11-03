import { Volume2, VolumeX, Bell, Vibrate, Music2 } from '../ui/OtterIcons';
import { Switch, BottomSheet } from '@toss/tds-mobile';
import { useSettings } from '../../hooks/useSettings';
import { useNotificationAgreement } from '../../hooks/useNotificationAgreement';
import { Card } from '../ui/Card';

export const SettingsSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { soundOn, bgmOn, vibrationOn, toggleSound, toggleBgm, toggleVibration } = useSettings();
  const { agreed, requestAgreement } = useNotificationAgreement();

  return (
    <BottomSheet open={open} onDimmerClick={onClose} header={<span className="sheet-title">앱 설정</span>}>
      <div className="px-5 pb-6 flex flex-col divide-y divide-[var(--color-line)]">
        {/* 앱인토스 미니앱은 라이트 모드만 지원해 테마 선택은 두지 않는다 */}
        {/* 효과음 */}
        <Card pad="md" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex w-6 shrink-0 justify-center">
              {soundOn
                ? <Volume2 size={20} className="text-[var(--color-ink-2)]" />
                : <VolumeX size={20} className="text-[var(--color-ink-4)]" />
              }
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">효과음</p>
              <p className="text-xs text-[var(--color-ink-3)]">퀴즈 정답/오답 효과음</p>
            </div>
          </div>
          <Switch checked={soundOn} onChange={toggleSound} aria-label="효과음" />
        </Card>

        {/* 배경음악 */}
        <Card pad="md" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex w-6 shrink-0 justify-center">
              <Music2 size={20} className={bgmOn ? 'text-[var(--color-ink-2)]' : 'text-[var(--color-ink-4)]'} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">배경음악</p>
              <p className="text-xs text-[var(--color-ink-3)]">조용한 학습 루프</p>
            </div>
          </div>
          <Switch checked={bgmOn} onChange={toggleBgm} aria-label="배경음악" />
        </Card>

        {/* 진동 */}
        <Card pad="md" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex w-6 shrink-0 justify-center">
              <Vibrate size={20} className={vibrationOn ? 'text-[var(--color-ink-2)]' : 'text-[var(--color-ink-4)]'} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">진동</p>
              <p className="text-xs text-[var(--color-ink-3)]">햅틱 피드백</p>
            </div>
          </div>
          <Switch checked={vibrationOn} onChange={toggleVibration} aria-label="진동" />
        </Card>

        {/* 학습 알림 */}
        <button
          type="button"
          onClick={() => requestAgreement('settings')}
          disabled={agreed}
          className="press-fade flex min-h-14 items-center justify-between py-4 text-left disabled:opacity-100"
        >
          <div className="flex items-center gap-3">
            <span className="flex w-6 shrink-0 justify-center"><Bell size={20} className="text-[var(--color-ink-2)]" /></span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">학습 알림</p>
              <p className="text-xs text-[var(--color-ink-3)]">복습/학습 리마인더 받기</p>
            </div>
          </div>
          <span className={`text-sm font-semibold ${agreed ? 'text-[var(--color-ink-4)]' : 'text-[var(--color-ink)]'}`}>
            {agreed ? '동의됨' : '받기'}
          </span>
        </button>
      </div>
    </BottomSheet>
  );
};
