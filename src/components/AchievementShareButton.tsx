import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShareNetwork, DownloadSimple, LinkSimple } from '@phosphor-icons/react';
import { X } from './ui/OtterIcons';
import { createAchievementImage, canShareAchievementImage, shareAchievementImage, downloadAchievementImage, supportsTossImageShare, type AchievementCard, type AchievementImage } from '../lib/achievementImage';
import { logClick } from '../lib/analytics';
import { achievementShareMessage, shareTossLink } from '../lib/share';
import './AchievementShareButton.css';

// 이미지 공유와 링크 공유(종류별 OG·메시지)를 나란히 둔다. linkMessage가 없으면 카드로 메시지를 만든다
export const AchievementShareButton = ({ card, label = '이미지로 공유', className = '', linkMessage }: {
  card: AchievementCard; label?: string; className?: string; linkMessage?: string;
}) => {
  const [preview, setPreview] = useState<AchievementCard | null>(null);
  return <span className={`achievement-share-row ${className}`}>
    <button type="button" className="achievement-share-trigger" onClick={() => {
      setPreview(card);
      logClick('achievement_image_preview', { kind: card.kind });
    }}><ShareNetwork size={18} aria-hidden="true" />{label}</button>
    <button type="button" className="achievement-share-trigger" onClick={() => {
      logClick('achievement_link_share', { kind: card.kind });
      void shareTossLink(card.kind, linkMessage ?? achievementShareMessage(card));
    }}><LinkSimple size={18} aria-hidden="true" />친구에게 공유</button>
    {preview && createPortal(<AchievementShareDialog card={preview} onClose={() => setPreview(null)} />, document.body)}
  </span>;
};

const AchievementShareDialog = ({ card, onClose }: { card: AchievementCard; onClose: () => void }) => {
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
    return () => { dialog?.close(); if (trigger?.isConnected) trigger.focus({ preventScroll: true }); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    createAchievementImage(card).then(result => {
      if (!cancelled) setImage(result);
    }).catch(() => { if (!cancelled) setError('이미지를 만들지 못했어요. 다시 시도해 주세요.'); });
    return () => { cancelled = true; };
  }, [card, attempt]);
  const share = async () => {
    if (!image || sharing.current) return;
    sharing.current = true;
    setBusy(true); setError(''); setStatus('');
    try {
      const result = await shareAchievementImage(image);
      if (result === 'downloaded') setStatus('이미지를 다운로드했어요. 저장한 파일을 공유해 주세요.');
      if (result !== 'cancelled') logClick('achievement_image_share', { kind: card.kind, method: result });
    } catch { setError('공유하지 못했어요. 다시 시도해 주세요.'); }
    finally { sharing.current = false; setBusy(false); }
  };
  const nativeShare = image ? canShareAchievementImage(image) : true;
  return <dialog ref={dialogRef} className="achievement-share-dialog" aria-labelledby={titleId} data-achievement-share-modal
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
          : <button type="button" className="action-button w-full" disabled={!image || busy} onClick={() => void share()}>
            {nativeShare ? <ShareNetwork size={20} aria-hidden="true" /> : <DownloadSimple size={20} aria-hidden="true" />}
            {busy ? '공유하는 중…' : nativeShare ? '이미지 공유하기' : '이미지 저장하기'}
          </button>}
        {image && nativeShare && !supportsTossImageShare() && <button type="button" className="achievement-share-trigger" disabled={busy} onClick={() => {
          downloadAchievementImage(image);
          setStatus('이미지를 다운로드했어요. 저장한 파일을 공유해 주세요.');
        }}><DownloadSimple size={18} aria-hidden="true" />이미지 저장하기</button>}
      </footer>
    </div>
  </dialog>;
};
