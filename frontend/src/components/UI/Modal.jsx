import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'default',
  className = '',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    default: '',
    large: 'large',
  };

  const panelClass = `modal-panel ${sizes[size] || ''} ${className}`.trim();

  const modalContent = (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()} aria-hidden="false">
      <div className={panelClass} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          Close
        </button>
        <div className="section-heading">
          <h3 id="modal-title">{title}</h3>
          {subtitle && <span className="section-note">{subtitle}</span>}
        </div>
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}