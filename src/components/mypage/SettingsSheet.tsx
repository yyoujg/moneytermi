import { Volume2, VolumeX, Bell } from 'lucide-react';
import { Switch, BottomSheet } from '@toss/tds-mobile';
import { useSettings } from '../../hooks/useSettings';
import { useNotificationAgreement } from '../../hooks/useNotificationAgreement';

export const SettingsSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { soundOn, vibrationOn, toggleSound, toggleVibration } = useSettings();
  const { agreed, requestAgreement } = useNotificationAgreement();

  return (
    <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700 }}>앱 설정</span>}>
      <div className="px-5 pb-6 flex flex-col gap-2">
        {/* 효과음 */}
        <div className="flex items-center justify-between bg-[#F0F0F0] rounded-2xl px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E5E5E5] flex items-center justify-center">
              {soundOn
                ? <Volume2 size={16} className="text-[#555555]" />
                : <VolumeX size={16} className="text-[#AAAAAA]" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111111]">효과음</p>
              <p className="text-xs text-[#AAAAAA]">퀴즈 정답/오답 효과음</p>
            </div>
          </div>
          <Switch checked={soundOn} onChange={toggleSound} />
        </div>

        {/* 진동 */}
        <div className="flex items-center justify-between bg-[#F0F0F0] rounded-2xl px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E5E5E5] flex items-center justify-center">
              <span className={`text-base ${vibrationOn ? 'text-[#555555]' : 'text-[#AAAAAA]'}`}>📳</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111111]">진동</p>
              <p className="text-xs text-[#AAAAAA]">햅틱 피드백</p>
            </div>
          </div>
          <Switch checked={vibrationOn} onChange={toggleVibration} />
        </div>

        {/* 학습 알림 */}
        <button
          type="button"
          onClick={requestAgreement}
          disabled={agreed}
          className="flex items-center justify-between bg-[#F0F0F0] rounded-2xl px-4 py-4 text-left disabled:opacity-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E5E5E5] flex items-center justify-center">
              <Bell size={16} className={agreed ? 'text-[#555555]' : 'text-[#AAAAAA]'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111111]">학습 알림</p>
              <p className="text-xs text-[#AAAAAA]">복습/학습 리마인더 받기</p>
            </div>
          </div>
          <span className={`text-sm font-semibold ${agreed ? 'text-[#AAAAAA]' : 'text-[#F97316]'}`}>
            {agreed ? '동의됨' : '받기'}
          </span>
        </button>
      </div>
    </BottomSheet>
  );
};
