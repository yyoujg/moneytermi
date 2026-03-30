import React, { useState } from 'react';
import { X, Shield, ArrowLeft, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadStoredProfile } from '../hooks/useAuth';

type Props = {
  onClose: () => void;
  onLink: (email: string) => void;
};

const GuestLinkSheet = ({ onClose, onLink }: Props) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [linkError, setLinkError] = useState('');

  const isEmailValid = email.includes('@') && email.includes('.');

  const handleSendCode = async () => {
    if (!isEmailValid || loading) return;
    setLoading(true);
    setSendError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setLoading(false);
    if (error) {
      console.error('[OTP 발송 실패]', error.message, error);
      setSendError(`이메일 발송에 실패했습니다. (${error.message})`);
      return;
    }
    setStep('otp');
  };

  const handleVerify = async () => {
    if (otp.length !== 6 || loading) return;
    setLoading(true);
    setOtpError(false);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error || !data.session) {
      setLoading(false);
      setOtpError(true);
      return;
    }

    // 게스트 프로필 → 인증 계정으로 승격
    const stored = await loadStoredProfile();
    if (stored?.guestToken) {
      const { error: rpcError } = await supabase.rpc('link_guest_to_auth', {
        p_guest_token: stored.guestToken,
        p_auth_user_id: data.session.user.id,
        p_email: email,
      });
      if (rpcError) {
        console.warn('link_guest_to_auth 실패:', rpcError);
        setLoading(false);
        setOtpError(false);
        setLinkError('계정 연결 중 오류가 발생했습니다. 다시 시도해주세요.');
        return;
      }
    }

    setLoading(false);
    onLink(email);
  };

  const handleOtpChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    setOtpError(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70" onClick={onClose} />

      <div
        className="fixed bottom-0 z-[60] w-full"
        style={{ maxWidth: '28rem', left: '50%', transform: 'translateX(-50%)' }}
      >
        <div className="bg-white rounded-t-3xl px-5 pt-6 pb-10 flex flex-col gap-5">

          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step === 'otp' && (
                <button
                  onClick={() => { setStep('email'); setOtp(''); setOtpError(false); }}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-[#F0F0F0] mr-1"
                >
                  <ArrowLeft size={14} className="text-[#888888]" />
                </button>
              )}
              <p className="text-base font-bold text-[#111111]">
                {step === 'email' ? '이메일로 계정 연결' : '인증 코드 입력'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0F0F0]"
            >
              <X size={15} className="text-[#888888]" />
            </button>
          </div>

          {/* 설명 카드 */}
          <div className="bg-[#F0F0F0] rounded-2xl p-4 flex gap-3">
            <Shield size={18} className="text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#111111] mb-0.5">지금까지의 기록을 지키세요</p>
              <p className="text-xs text-[#888888] leading-relaxed">
                이메일 인증만으로 계정을 연결하고<br />
                학습 기록·포인트를 안전하게 보관합니다.
              </p>
            </div>
          </div>

          {/* Step 1: 이메일 입력 */}
          {step === 'email' && (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-[#AAAAAA] mb-2">이메일 주소</p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSendError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3.5 rounded-xl text-sm text-[#111111] placeholder-[#BBBBBB] outline-none"
                  style={{ backgroundColor: '#F0F0F0' }}
                  autoFocus
                />
                {sendError && (
                  <p className="text-xs text-red-400 mt-1.5">{sendError}</p>
                )}
              </div>
              <button
                onClick={handleSendCode}
                disabled={!isEmailValid || loading}
                className="w-full py-4 rounded-2xl bg-orange-500 text-sm font-bold text-white disabled:opacity-30 active:opacity-90 flex items-center justify-center gap-2"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : '인증 코드 받기'}
              </button>
              <button onClick={onClose} className="text-xs text-[#AAAAAA] text-center py-1 active:opacity-70">
                나중에 하기
              </button>
            </div>
          )}

          {/* Step 2: OTP 입력 */}
          {step === 'otp' && (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-[#888888] mb-3">
                  <span className="text-[#111111] font-medium">{email}</span>로<br />
                  6자리 인증 코드를 발송했습니다.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="6자리 코드 입력"
                  className={`w-full px-4 py-3.5 rounded-xl text-sm text-[#111111] placeholder-[#BBBBBB] outline-none text-center ${otpError ? 'ring-1 ring-red-500/60' : ''}`}
                  style={{ backgroundColor: '#F0F0F0', letterSpacing: otp ? '0.3em' : undefined }}
                  autoFocus
                />
                {otpError && (
                  <p className="text-xs text-red-400 mt-1.5 text-center">코드가 올바르지 않습니다</p>
                )}
              </div>
              <button
                onClick={handleVerify}
                disabled={otp.length !== 6 || loading}
                className="w-full py-4 rounded-2xl bg-orange-500 text-sm font-bold text-white disabled:opacity-30 active:opacity-90 flex items-center justify-center gap-2"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : '인증 완료'}
              </button>
              {linkError && (
                <p className="text-xs text-red-400 text-center">{linkError}</p>
              )}
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="text-xs text-[#AAAAAA] text-center py-1 active:opacity-70 disabled:opacity-30"
              >
                코드 재발송
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GuestLinkSheet;
