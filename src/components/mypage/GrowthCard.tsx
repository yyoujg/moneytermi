import { useEffect, useRef } from 'react';
import { Info, Share2, Gift, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TextButton } from '@toss/tds-mobile';
import { GROWTH_STAGES, getGrowthStage } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { logClick } from '../../lib/analytics';
import { shareTossLink } from '../../lib/share';
import { isReferralEnabled, startReferralInvite } from '../../lib/referral';
import { isRewardedAdEnabled, showRewardedAd } from '../../lib/ads';

// 캐릭터 키우기 — 별도 탭이었다가 마이페이지로 합쳤다.
export const GrowthCard = () => {
  const navigate = useNavigate();
  const { points, claimReferralReward, claimAdReward } = useAppContext();
  const referralCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => () => referralCleanupRef.current?.(), []);

  const handleInviteFriends = () => {
    logClick('referral_invite_start');
    referralCleanupRef.current?.();
    referralCleanupRef.current = startReferralInvite((amount, unit) => {
      claimReferralReward(amount, unit).then(credited => {
        if (credited) toast.success(`친구 초대 완료! +${credited}P`);
      });
    }) ?? null;
  };

  const handleWatchAd = () => {
    logClick('rewarded_ad_start');
    showRewardedAd((amount, unit) => {
      claimAdReward(amount, unit).then(credited => {
        if (credited) toast.success(`광고 시청 완료! +${credited}P`);
      });
    });
  };

  const stage = getGrowthStage(points);
  const progressPct = stage.nextMinPoints !== null
    ? Math.min(100, Math.round(((points - stage.minPoints) / (stage.nextMinPoints - stage.minPoints)) * 100))
    : 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-[var(--color-ink-2)]">캐릭터 키우기</p>
        <div className="flex items-center gap-1">
          <TextButton
            size="small"
            onClick={() => {
              logClick('league_share');
              shareTossLink('intoss://moneytermi/league', '머니터미에서 경제 용어 배우고 내 캐릭터를 키워봐요!');
            }}
          >
            <span className="flex items-center gap-1"><Share2 size={13} />공유</span>
          </TextButton>
          <TextButton size="small" onClick={() => navigate('/league/rules')}>
            <span className="flex items-center gap-1"><Info size={13} />안내</span>
          </TextButton>
        </div>
      </div>

      <div className="bg-[var(--color-card)] rounded-card p-5">
        {/* 캐릭터 */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="text-7xl mb-2">{stage.emoji}</div>
          <p className="text-lg font-bold text-[var(--color-ink)] mb-3!">{stage.name}</p>
          <div className="w-full">
            <div className="w-full bg-[var(--color-surface)] rounded-full h-1.5 overflow-hidden mb-1.5">
              <div className="bg-brand-500 h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs text-[var(--color-ink-4)]">
              {stage.nextMinPoints !== null ? `다음 단계까지 ${stage.nextMinPoints - points}P` : '최고 단계 달성! 🎉'}
            </p>
          </div>
        </div>

        {/* 단계 로드맵 */}
        <div className="flex justify-between items-start relative mb-1">
          <div className="absolute top-4 left-4 right-4 h-[2px] bg-[var(--color-line)] z-0 rounded-full">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-1000"
              style={{ width: `${((stage.id - 1) / (GROWTH_STAGES.length - 1)) * 100}%` }}
            />
          </div>
          {GROWTH_STAGES.map(s => {
            const isCurrent = s.id === stage.id;
            return (
              <div key={s.id} className="flex flex-col items-center relative z-10 w-14">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all
                  ${isCurrent ? 'bg-brand-500 scale-110' : s.id < stage.id ? 'bg-[var(--color-line)]' : 'bg-[var(--color-surface)]'}`}>
                  {s.emoji}
                </div>
                <span className={`text-3xs font-medium text-center mt-1.5 leading-tight
                  ${isCurrent ? 'text-brand-500' : 'text-[var(--color-ink-4)]'}`}>
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 포인트 획득 */}
      {(isReferralEnabled() || isRewardedAdEnabled()) && (
        <div className="flex flex-col gap-2 mt-3">
          {isReferralEnabled() && (
            <button
              onClick={handleInviteFriends}
              className="w-full flex items-center justify-center gap-1.5 rounded-chip px-3 py-3 text-sm font-bold text-brand-500 active:opacity-70"
              style={{ backgroundColor: 'var(--color-brand-soft)' }}
            >
              <Gift size={15} /> 친구 초대하고 포인트 받기
            </button>
          )}
          {isRewardedAdEnabled() && (
            <button
              onClick={handleWatchAd}
              className="w-full flex items-center justify-center gap-1.5 rounded-chip px-3 py-3 text-sm font-bold text-brand-500 active:opacity-70"
              style={{ backgroundColor: 'var(--color-brand-soft)' }}
            >
              <Play size={15} /> 광고 보고 포인트 받기
            </button>
          )}
        </div>
      )}
    </div>
  );
};
