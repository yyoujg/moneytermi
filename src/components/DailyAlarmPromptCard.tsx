import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Storage } from '../lib/storage';
import { useNotificationAgreement } from '../hooks/useNotificationAgreement';

// 학습 완료 결과 화면에서 미동의 사용자에게 1회만 노출하는 알림 동의 카드.
// 노출/나중에 클릭 시 다시 자동으로 뜨지 않고, 재동의는 마이페이지에서만 가능하다.
const SEEN_KEY = 'daily_term_alarm_prompt_seen';
const AGREE_KEY = 'setting_notification_agreement';

export const DailyAlarmPromptCard = () => {
  const { agreed, requestAgreement } = useNotificationAgreement();
  const [show, setShow] = useState(false);

  useEffect(() => {
    Promise.all([
      Storage.getItem(SEEN_KEY).catch(() => null),
      Storage.getItem(AGREE_KEY).catch(() => null),
    ]).then(([seen, agree]) => {
      if (seen !== '1' && agree !== 'agreed') {
        setShow(true);
        Storage.setItem(SEEN_KEY, '1').catch(() => {}); // 1회 노출 처리
      }
    });
  }, []);

  if (!show || agreed) return null;

  return (
    <div className="w-full bg-white rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
          <Bell size={16} className="text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111111]">매일 오늘의 용어 받기</p>
          <p className="text-xs text-[#AAAAAA]">매일 09:00, 오늘의 경제 용어를 알림으로 보내드려요</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShow(false)}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-[#555555] bg-[#F0F0F0] active:opacity-90"
        >
          나중에
        </button>
        <button
          onClick={requestAgreement}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-orange-500 active:opacity-90"
        >
          알림 받기
        </button>
      </div>
    </div>
  );
};
