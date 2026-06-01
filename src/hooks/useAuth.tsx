import { useState, useEffect, useContext, createContext } from 'react';
import { closeView } from '@apps-in-toss/web-framework';
import type { AuthState, AuthUser } from '../types';
import { supabase } from '../lib/supabase';
import { Storage } from '../lib/storage';

const STORAGE_KEY = 'moneytermi_auth';

// crypto.randomUUID는 secure context(HTTPS/localhost)에서만 동작.
// iOS 샌드박스는 http LAN IP로 로드되어 비보안 컨텍스트라 undefined → 폴백 필요.
const uuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

type StoredProfile = {
  profileId: string;
  guestToken: string;
  nickname: string;
  isGuest: boolean;
  leagueTier: string;
};

export const loadStoredProfile = async (): Promise<StoredProfile | null> => {
  try {
    const s = await Storage.getItem(STORAGE_KEY);
    if (!s) return null;
    const p = JSON.parse(s);
    // 구버전 포맷 호환
    if (p.user) {
      return {
        profileId: p.user.id,
        guestToken: p._guestToken ?? uuid(),
        nickname: p.user.nickname,
        isGuest: p.user.isGuest,
        leagueTier: p.user.leagueTier ?? 'bronze',
      };
    }
    return p as StoredProfile;
  } catch {
    return null;
  }
};

type AuthContextValue = {
  user: AuthUser | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  guestToken: string | null;
  profileId: string | null;
  updateNickname: (newNickname: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null, accessToken: null, refreshToken: null, isAuthenticated: false,
  });
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    // 1. 저장된 프로필 있으면 복원
    const stored = await loadStoredProfile();
    if (stored) {
      setProfileId(stored.profileId);
      setGuestToken(stored.guestToken);
      setAuthState({
        user: {
          id: stored.profileId,
          nickname: stored.nickname,
          isGuest: stored.isGuest,
          leagueTier: stored.leagueTier,
        },
        accessToken: null, refreshToken: null, isAuthenticated: true,
      });
      return;
    }

    // 2. 첫 방문: Supabase에 게스트 프로필 생성
    try {
      const newGuestToken = uuid();
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({ guest_token: newGuestToken })
        .select()
        .single();

      if (!error && profile) {
        const toStore: StoredProfile = {
          profileId: profile.id,
          guestToken: newGuestToken,
          nickname: profile.nickname,
          isGuest: true,
          leagueTier: profile.league_tier,
        };
        await Storage.setItem(STORAGE_KEY, JSON.stringify(toStore));
        setProfileId(profile.id);
        setGuestToken(newGuestToken);
        setAuthState({
          user: { id: profile.id, nickname: profile.nickname, isGuest: true, leagueTier: profile.league_tier },
          accessToken: null, refreshToken: null, isAuthenticated: true,
        });
        return;
      }
    } catch (err) {
      console.warn('Supabase 게스트 생성 실패, 오프라인 모드로 전환:', err);
    }

    // 3. 오프라인 폴백
    const id = uuid();
    const token = uuid();
    const toStore: StoredProfile = {
      profileId: id, guestToken: token,
      nickname: '예비슈퍼개미', isGuest: true, leagueTier: 'bronze',
    };
    try {
      await Storage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (err) {
      console.warn('오프라인 프로필 저장 실패:', err);
    }
    setProfileId(id);
    setGuestToken(token);
    setAuthState({
      user: { id, nickname: '예비슈퍼개미', isGuest: true, leagueTier: 'bronze' },
      accessToken: null, refreshToken: null, isAuthenticated: true,
    });
  };

  const updateNickname = async (newNickname: string): Promise<{ error: string | null }> => {
    const trimmed = newNickname.trim();
    if (!trimmed) return { error: '닉네임을 입력해주세요' };
    if (trimmed.length > 10) return { error: '닉네임은 10자 이내로 입력해주세요' };
    if (trimmed === authState.user?.nickname) return { error: '현재 닉네임과 동일해요' };

    if (profileId) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('nickname', trimmed)
        .neq('id', profileId)
        .maybeSingle();

      if (existing) return { error: '이미 사용 중인 닉네임이에요' };

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ nickname: trimmed })
        .eq('id', profileId);

      if (updateError) return { error: '닉네임 변경에 실패했어요' };
    }

    const stored = await loadStoredProfile();
    if (stored) {
      await Storage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, nickname: trimmed }));
    }

    setAuthState(prev => {
      if (!prev.user) return prev;
      return { ...prev, user: { ...prev.user, nickname: trimmed } };
    });

    return { error: null };
  };

  const logout = async () => {
    await Storage.removeItem(STORAGE_KEY);
    await supabase.auth.signOut();
    closeView();
  };

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      isGuest: authState.user?.isGuest ?? true,
      isAuthenticated: authState.isAuthenticated,
      guestToken,
      profileId,
      updateNickname,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
