import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  className = '',
  filled = false,
  size,
}) => {
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'material-symbols-filled' : ''} ${className}`}
      style={size ? { fontSize: `${size}px` } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'w-full h-full object-contain',
  alt = 'Logo SmartTaksasi',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-light-primary/10 dark:bg-dark-primary/15 text-light-primary dark:text-dark-primary rounded-sm">
        <Icon name="two_wheeler" size={20} />
      </div>
    );
  }

  return (
    <img
      src="/assets/images/logo-smarttaksasi.png"
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidthClass = 'md:max-w-lg',
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Sheet / Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.6 }}
            transition={{ type: 'spring', damping: 30, stiffness: 360 }}
            className={`relative z-10 w-full ${maxWidthClass} max-h-[88dvh] flex flex-col rounded-t-3xl md:rounded-2xl bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant shadow-xl overflow-hidden`}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2.5 pb-1 md:hidden">
              <div className="w-10 h-1.5 rounded-full bg-light-outline-variant dark:bg-dark-outline-variant" />
            </div>

            <div className="px-4 py-3 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-title text-title-md text-light-on-surface dark:text-dark-on-surface truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="min-w-[40px] min-h-[40px] rounded-full bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-center text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container dark:hover:bg-dark-surface-container-high tactile-press shrink-0"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto pb-[max(20px,env(safe-area-inset-bottom))]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ContextualHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
}

export const ContextualHeader: React.FC<ContextualHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightSlot,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-light-surface-container-lowest/95 dark:bg-dark-surface-container-low/95 backdrop-blur-md border-b border-light-outline-variant dark:border-dark-outline-variant shadow-sm px-4 pt-safe pb-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali"
          className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] w-10 h-10 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant border-b-2 shadow-sm text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-high tactile-press shrink-0"
        >
          <Icon name="arrow_back" size={20} />
        </button>
        <div className="flex flex-col min-w-0">
          <h1 className="font-title text-title-md text-light-on-surface dark:text-dark-on-surface truncate">
            {title}
          </h1>
          <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
            {subtitle}
          </span>
        </div>
      </div>
      {rightSlot && <div className="flex items-center gap-1.5 shrink-0">{rightSlot}</div>}
    </header>
  );
};

interface ToastBannerProps {
  message: string | null;
  type?: 'success' | 'info' | 'warning';
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ message, type = 'success' }) => {
  const bgClass =
    type === 'warning'
      ? 'bg-warning text-on-warning'
      : type === 'info'
        ? 'bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary'
        : 'bg-success text-on-success';

  const iconName =
    type === 'warning' ? 'warning' : type === 'info' ? 'info' : 'check_circle';

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.96 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-[max(16px,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-[60] max-w-[90vw] pointer-events-none"
        >
          <div
            className={`rounded-full px-4 py-2 shadow-lg flex items-center gap-2 font-label text-label-md ${bgClass}`}
          >
            <Icon name={iconName} size={18} filled />
            <span className="truncate">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
