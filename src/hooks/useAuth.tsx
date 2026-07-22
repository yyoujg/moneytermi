import { useState, useEffect, useContext, createContext } from 'react';
import { closeView, getAnonymousKey } from '@apps-in-toss/web-framework';
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
  tossAnonymousKey?: string;
};

// 토스 익명 키(getAnonymousKey hash) 조회. undefined(구 앱버전) / 'ERROR' / 예외 전부 null 폴백.
// 브라우저(localhost)엔 브리지가 없어 null → 기존 게스트 생성 경로로 흐른다.
const fetchTossKey = async (): Promise<string | null> => {
  try {
    const r = await getAnonymousKey();
    if (!r || typeof r === 'string') return null;
    return r.type === 'HASH' && r.hash ? r.hash : null;
  } catch {
    return null;
  }
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
    const restoreStored = (sp: StoredProfile) => {
      setProfileId(sp.profileId);
      setGuestToken(sp.guestToken);
      setAuthState({
        user: { id: sp.profileId, nickname: sp.nickname, isGuest: sp.isGuest, leagueTier: sp.leagueTier },
        accessToken: null, refreshToken: null, isAuthenticated: true,
      });
    };

    const stored = await loadStoredProfile();

    // 토스 익명 키 조회 (로컬 브리지, 네트워크 없음)
    const tossKey = await fetchTossKey();

    // 저장된 프로필이 이미 이 토스 키로 확정돼 있으면 RPC 없이 즉시 복원 (부팅 성능 유지)
    if (stored?.tossAnonymousKey && stored.tossAnonymousKey === tossKey) {
      restoreStored(stored);
      return;
    }

    // 토스 키가 있으면 서버에서 프로필 조회(기존)/승격/생성. 재설치·기기변경해도 같은 프로필로 복구.
    if (tossKey) {
      try {
        const { data, error } = await supabase.rpc('resolve_profile_by_toss_key', {
          p_toss_key: tossKey,
          p_guest_token: stored?.guestToken ?? null,
        });
        const row = data?.[0];
        if (!error && row) {
          const toStore: StoredProfile = {
            profileId: row.out_id,
            guestToken: row.out_guest_token,
            nickname: row.out_nickname,
            isGuest: row.out_is_guest,
            leagueTier: row.out_league_tier,
            tossAnonymousKey: tossKey,
          };
          try {
            await Storage.setItem(STORAGE_KEY, JSON.stringify(toStore));
          } catch (err) {
            console.warn('토스 키 프로필 저장 실패:', err);
          }
          restoreStored(toStore);
          return;
        }
        console.warn('resolve_profile_by_toss_key 실패, 게스트 경로로 폴백:', error);
      } catch (err) {
        console.warn('resolve_profile_by_toss_key 예외, 게스트 경로로 폴백:', err);
      }
    }

    // 토스 키 없음(브라우저/구버전) 또는 RPC 실패 → 기존 게스트 로직
    // 1. 저장된 프로필 있으면 복원
    if (stored) {
      restoreStored(stored);
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
