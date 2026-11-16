import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from '../ui/OtterIcons';
import './WordResourcesDialog.css';

export type WordResource = { id: string; label: string; content: ReactNode };

export const WordResourcesDialog = ({ resources, onClose }: {
  resources: WordResource[];
  onClose: () => void;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    titleRef.current?.focus({ preventScroll: true });
    return () => {
      dialog?.close();
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return <dialog
    ref={dialogRef}
    role="dialog"
    aria-modal="true"
    aria-labelledby={titleId}
    data-word-resources-modal
    className="word-resources-dialog"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}
  >
    <div className="word-resources-shell">
      <span className="word-resources-handle" aria-hidden="true" />
      <header className="word-resources-header">
        <div className="word-resources-toolbar">
          <h2 ref={titleRef} id={titleId} tabIndex={-1} className="word-resources-title type-page-title">더 알아보기</h2>
          <button type="button" className="word-resources-close press-fade" aria-label="더 알아보기 닫기" onClick={onClose}><X size={24} /></button>
        </div>
      </header>
      <div className="word-resources-body">
        {resources.map(resource => <section key={resource.id} data-resource-unit={resource.id} className="word-resources-section" aria-labelledby={`${titleId}-${resource.id}`}>
          <h3 id={`${titleId}-${resource.id}`} className="type-section-title">{resource.label}</h3>
          <div className="word-resource-content">{resource.content}</div>
        </section>)}
      </div>
    </div>
  </dialog>;
};
