import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidthStyles[maxWidth]} bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden transform transition-all animate-scale-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {Boolean(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            {title ? (
              <h3 className="text-lg font-semibold text-neutral-900 font-serif">{title}</h3>
            ) : (
              <div />
            )}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
