import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} bg-white dark:bg-ink-900 rounded-t-2xl sm:rounded-2xl shadow-xl border border-ink-200 dark:border-ink-800 animate-slide-up max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200 dark:border-ink-800 sticky top-0 bg-white dark:bg-ink-900 z-10">
            <h2 className="font-semibold text-lg">{title}</h2>
            <button onClick={onClose} className="btn-ghost p-1.5 -mr-1.5"><X className="w-5 h-5" /></button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
