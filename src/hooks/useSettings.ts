import { useState, useEffect } from 'react';
import { Storage } from '../lib/storage';
import { bgmPrefs, hapticPrefs, setBgmEnabled, soundPrefs } from '../lib/feedback';

// 효과음/배경음악/진동 설정 (Storage 키 setting_sound / setting_bgm / setting_vibration, 'on'|'off')
export const useSettings = () => {
  const [soundOn, setSoundOn] = useState(true);
  const [bgmOn, setBgmOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);

  useEffect(() => {
    Storage.getItem('setting_sound').then(v => { if (v !== null) { setSoundOn(v !== 'off'); soundPrefs.enabled = v !== 'off'; } }).catch(() => {});
    Storage.getItem('setting_bgm').then(v => {
      if (v !== null) {
        const enabled = v !== 'off';
        setBgmOn(enabled);
        if (enabled) bgmPrefs.enabled = true;
        else setBgmEnabled(false);
      }
    }).catch(() => {});
    Storage.getItem('setting_vibration').then(v => { if (v !== null) { setVibrationOn(v !== 'off'); hapticPrefs.enabled = v !== 'off'; } }).catch(() => {});
  }, []);

  const toggleSound = () => setSoundOn(prev => {
    const next = !prev;
    Storage.setItem('setting_sound', next ? 'on' : 'off').catch(() => {});
    soundPrefs.enabled = next;
    return next;
  });

  const toggleBgm = () => setBgmOn(prev => {
    const next = !prev;
    Storage.setItem('setting_bgm', next ? 'on' : 'off').catch(() => {});
    setBgmEnabled(next);
    return next;
  });

  const toggleVibration = () => setVibrationOn(prev => {
    const next = !prev;
    Storage.setItem('setting_vibration', next ? 'on' : 'off').catch(() => {});
    hapticPrefs.enabled = next;
    return next;
  });

  return { soundOn, bgmOn, vibrationOn, toggleSound, toggleBgm, toggleVibration };
};
