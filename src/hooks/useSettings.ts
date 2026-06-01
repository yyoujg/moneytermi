import { useState, useEffect } from 'react';
import { Storage } from '../lib/storage';

// 효과음/진동 설정 (Storage 키 setting_sound / setting_vibration, 'on'|'off')
export const useSettings = () => {
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);

  useEffect(() => {
    Storage.getItem('setting_sound').then(v => { if (v !== null) setSoundOn(v !== 'off'); }).catch(() => {});
    Storage.getItem('setting_vibration').then(v => { if (v !== null) setVibrationOn(v !== 'off'); }).catch(() => {});
  }, []);

  const toggleSound = () => setSoundOn(prev => {
    const next = !prev;
    Storage.setItem('setting_sound', next ? 'on' : 'off');
    return next;
  });

  const toggleVibration = () => setVibrationOn(prev => {
    const next = !prev;
    Storage.setItem('setting_vibration', next ? 'on' : 'off');
    return next;
  });

  return { soundOn, vibrationOn, toggleSound, toggleVibration };
};
