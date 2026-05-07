import { useState, useEffect, useContext, createContext } from 'react';
import { closeView } from '@apps-in-toss/web-framework';
import type { AuthState, User } from '../types';
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

type AuthContextValue = {
  user: User | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  guestToken: string | null;
  profileId: string | null;
  linkAccount: (email: string, nickname?: string) => Promise<void>;
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
    // #region agent log
    fetch('http://127.0.0.1:7590/ingest/ef3a8cbf-b212-49a0-ae61-c5cbc95ccee0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dbe8c'},body:JSON.stringify({sessionId:'5dbe8c',runId:'pre-fix',hypothesisId:'E',location:'src/hooks/useAuth.tsx:initAuth',message:'initAuth start',data:{},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // 1. Supabase 세션 확인 (이메일 OTP 로그인 상태)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // #region agent log
      fetch('http://127.0.0.1:7590/ingest/ef3a8cbf-b212-49a0-ae61-c5cbc95ccee0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dbe8c'},body:JSON.stringify({sessionId:'5dbe8c',runId:'pre-fix',hypothesisId:'E',location:'src/hooks/useAuth.tsx:initAuth',message:'supabase session exists',data:{hasEmail:!!session.user.email},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7590/ingest/ef3a8cbf-b212-49a0-ae61-c5cbc95ccee0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dbe8c'},body:JSON.stringify({sessionId:'5dbe8c',runId:'pre-fix',hypothesisId:'E',location:'src/hooks/useAuth.tsx:initAuth',message:'stored profile restored',data:{isGuest:stored.isGuest,hasEmail:!!stored.email},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7590/ingest/ef3a8cbf-b212-49a0-ae61-c5cbc95ccee0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dbe8c'},body:JSON.stringify({sessionId:'5dbe8c',runId:'pre-fix',hypothesisId:'E',location:'src/hooks/useAuth.tsx:initAuth',message:'guest profile created',data:{},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7590/ingest/ef3a8cbf-b212-49a0-ae61-c5cbc95ccee0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5dbe8c'},body:JSON.stringify({sessionId:'5dbe8c',runId:'pre-fix',hypothesisId:'E',location:'src/hooks/useAuth.tsx:initAuth',message:'offline fallback profile',data:{},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
      linkAccount,
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
