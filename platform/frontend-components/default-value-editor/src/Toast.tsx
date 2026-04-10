import { useState, useEffect } from 'react';
import type { ToastProps } from './types';
import { DefaultIcons } from './DefaultIcons';

export function Toast({
  className,
  message,
  action,
  onAction,
  onDismiss,
  duration = 4000,
  closeIcon,
}: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) requestAnimationFrame(tick);
      else onDismiss();
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDismiss, duration]);

  const baseClass = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[slide-up_0.25s_ease-out]';

  return (
    <div className={[baseClass, className].filter(Boolean).join(' ')}>
      <div className="bg-slate-800 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] relative">
        <span className="text-sm flex-1">{message}</span>
        {action && (
          <button
            onClick={onAction}
            className="text-blue-400 hover:text-blue-300 text-sm font-semibold shrink-0 transition-colors"
          >
            {action}
          </button>
        )}
        <button onClick={onDismiss} className="text-slate-400 hover:text-white transition-colors">
          {closeIcon ?? DefaultIcons.close(14)}
        </button>
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-slate-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400 rounded-full"
            style={{ width: `${progress}%`, transition: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
