import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShareNetwork, DownloadSimple, LinkSimple } from '@phosphor-icons/react';
import { X } from './ui/OtterIcons';
import { createAchievementImage, saveAchievementImage, shareAchievementImage, type AchievementCard, type AchievementImage } from '../lib/achievementImage';
import { logClick } from '../lib/analytics';
import { achievementShareMessage, shareTossLink } from '../lib/share';
import './AchievementShareButton.css';

// 이미지 공유와 링크 공유(종류별 OG·메시지)를 나란히 둔다. linkMessage가 없으면 카드로 메시지를 만든다
export const AchievementShareButton = ({ card, label = '이미지로 공유', className = '', linkMessage }: {
  card: AchievementCard; label?: string; className?: string; linkMessage?: string;
}) => {
  const [preview, setPreview] = useState<AchievementCard | null>(null);
  // 링크 공유 시트가 뜨는 동안 다시 눌러 시트가 연달아 뜨지 않게 한다
  const linkSharing = useRef(false);
  return <span className={`achievement-share-row ${className}`}>
    <button type="button" className="achievement-share-trigger" onClick={() => {
      setPreview(card);
      logClick('achievement_image_preview', { kind: card.kind });
    }}><ShareNetwork size={18} aria-hidden="true" />{label}</button>
    <button type="button" className="achievement-share-trigger" onClick={() => {
      if (linkSharing.current) return;
      linkSharing.current = true;
      logClick('achievement_link_share', { kind: card.kind });
      void shareTossLink(card.kind, linkMessage ?? achievementShareMessage(card)).finally(() => { linkSharing.current = false; });
    }}><LinkSimple size={18} aria-hidden="true" />친구에게 공유</button>
    {preview && createPortal(<AchievementShareDialog card={preview} message={linkMessage ?? achievementShareMessage(card)} onClose={() => setPreview(null)} />, document.body)}
  </span>;
};

const AchievementShareDialog = ({ card, message, onClose }: { card: AchievementCard; message: string; onClose: () => void }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [image, setImage] = useState<AchievementImage | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const sharing = useRef(false);
  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    // showModal은 첫 버튼(X)에 초점을 줘 초점 링이 테두리처럼 보인다. 열 때는 모달 자체에 초점을 둔다
    dialog?.focus();
    return () => { dialog?.close(); if (trigger?.isConnected) trigger.focus({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    createAchievementImage(card).then(result => {
      if (!cancelled) setImage(result);
    }).catch(() => { if (!cancelled) setError('이미지를 만들지 못했어요. 다시 시도해 주세요.'); });
    return () => { cancelled = true; };
  }, [card, attempt]);
  // 저장·공유 중 하나만 돌게 막는다
  const run = async (task: () => Promise<void>) => {
    if (!image || sharing.current) return;
    sharing.current = true;
    setBusy(true); setError(''); setStatus('');
    try { await task(); } catch { setError('처리하지 못했어요. 다시 시도해 주세요.'); }
    finally { sharing.current = false; setBusy(false); }
  };
  const save = () => run(async () => {
    const result = await saveAchievementImage(image!);
    if (result === 'unsupported') { setError('이 토스 앱 버전에서는 이미지를 저장할 수 없어요. 토스 앱을 업데이트해 주세요.'); return; }
    setStatus(result === 'saved' ? '이미지를 저장했어요.' : '이미지를 다운로드했어요.');
    logClick('achievement_image_save', { kind: card.kind, method: result });
  });
  const share = () => run(async () => {
    const result = await shareAchievementImage(image!, message);
    if (result === 'unsupported') await shareTossLink(card.kind, message);
    if (result !== 'cancelled') logClick('achievement_image_share', { kind: card.kind, method: result === 'unsupported' ? 'link' : 'image' });
  });
  return <dialog ref={dialogRef} tabIndex={-1} className="achievement-share-dialog" aria-labelledby={titleId} data-achievement-share-modal
    onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => event.stopPropagation()}
    onClick={event => { event.stopPropagation(); if (event.target === event.currentTarget) onClose(); }}>
    <div className="achievement-share-shell">
      <header className="achievement-share-header">
        <div><h2 id={titleId}>기록 공유하기</h2><p>오늘의 성취를 한 장에 담았어요</p></div>
        <button type="button" className="achievement-share-close" aria-label="공유 미리보기 닫기" onClick={onClose}><X size={22} /></button>
      </header>
      <div className="achievement-share-preview" aria-busy={!image && !error}>
        {image ? <img src={image.dataUrl} alt={`${card.title}. ${card.value} ${card.unit}. ${card.description}${card.stats ? '. ' + card.stats.map(stat => `${stat.label} ${stat.value}`).join(', ') : ''}`} />
          : <p role="status">{error ? '이미지 준비 실패' : '기록을 담고 있어요…'}</p>}
      </div>
      <footer className="achievement-share-footer">
        {error && <p className="achievement-share-error" role="alert">{error}</p>}
        {status && <p role="status">{status}</p>}
        {!image && error ? <button type="button" className="action-button w-full" onClick={() => { setError(''); setAttempt(value => value + 1); }}>다시 만들기</button>
          : <div className="achievement-share-actions">
            <button type="button" className="action-button" data-tone="soft" disabled={!image || busy} onClick={() => void save()}>
              <DownloadSimple size={20} aria-hidden="true" />이미지 저장
            </button>
            <button type="button" className="action-button" disabled={!image || busy} onClick={() => void share()}>
              <ShareNetwork size={20} aria-hidden="true" />{busy ? '처리 중…' : '공유하기'}
            </button>
          </div>}
      </footer>
    </div>
  </dialog>;
};
