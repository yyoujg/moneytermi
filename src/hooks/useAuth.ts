import { useState, useEffect } from 'react';
import type { AuthState } from '../types';
import { supabase } from '../lib/supabase';
import { Storage } from '../lib/storage';

const STORAGE_KEY = 'moneytermi_auth';

type StoredProfile = {
  profileId: string;
  guestToken: string;
  nickname: string;
  isGuest: boolean;
  leagueTier: string;
  email?: string;
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
        guestToken: p._guestToken ?? crypto.randomUUID(),
        nickname: p.user.nickname,
        isGuest: p.user.isGuest,
        leagueTier: p.user.leagueTier ?? 'bronze',
        email: p.user.email,
      };
    }
    return p as StoredProfile;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null, accessToken: null, refreshToken: null, isAuthenticated: false,
  });
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();

        if (profile) {
          setProfileId(profile.id);
          setAuthState({
            user: {
              id: profile.id,
              nickname: profile.nickname,
              email: session.user.email ?? undefined,
              isGuest: false,
              leagueTier: profile.league_tier,
            },
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            isAuthenticated: true,
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initAuth = async () => {
    // 1. Supabase 세션 확인 (이메일 OTP 로그인 상태)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();

      if (profile) {
        setProfileId(profile.id);
        setAuthState({
          user: {
            id: profile.id,
            nickname: profile.nickname,
            email: session.user.email ?? undefined,
            isGuest: false,
            leagueTier: profile.league_tier,
          },
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          isAuthenticated: true,
        });
        return;
      }
    }

    // 2. 저장된 프로필 있으면 복원
    const stored = await loadStoredProfile();
    if (stored) {
      setProfileId(stored.profileId);
      setGuestToken(stored.guestToken);
      setAuthState({
        user: {
          id: stored.profileId,
          nickname: stored.nickname,
          email: stored.email,
          isGuest: stored.isGuest,
          leagueTier: stored.leagueTier,
        },
        accessToken: null, refreshToken: null, isAuthenticated: true,
      });
      return;
    }

    // 3. 첫 방문: Supabase에 게스트 프로필 생성
    try {
      const newGuestToken = crypto.randomUUID();
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

    // 4. 오프라인 폴백
    const id = crypto.randomUUID();
    const token = crypto.randomUUID();
    const toStore: StoredProfile = {
      profileId: id, guestToken: token,
      nickname: '예비슈퍼개미', isGuest: true, leagueTier: 'bronze',
    };
    await Storage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    setProfileId(id);
    setGuestToken(token);
    setAuthState({
      user: { id, nickname: '예비슈퍼개미', isGuest: true, leagueTier: 'bronze' },
      accessToken: null, refreshToken: null, isAuthenticated: true,
    });
  };

  const linkAccount = async (email: string, nickname?: string) => {
    const stored = await loadStoredProfile();
    if (stored) {
      await Storage.setItem(STORAGE_KEY, JSON.stringify({
        ...stored, email, isGuest: false, nickname: nickname ?? stored.nickname,
      }));
    }
    setAuthState(prev => {
      if (!prev.user) return prev;
      return {
        user: { ...prev.user, email, nickname: nickname ?? prev.user.nickname, isGuest: false },
        accessToken: prev.accessToken, refreshToken: prev.refreshToken, isAuthenticated: true,
      };
    });
  };

  const logout = async () => {
    await Storage.removeItem(STORAGE_KEY);
    await supabase.auth.signOut();
    window.location.reload();
  };

  return {
    user: authState.user,
    isGuest: authState.user?.isGuest ?? true,
    isAuthenticated: authState.isAuthenticated,
    guestToken,
    profileId,
    linkAccount,
    logout,
  };
};
