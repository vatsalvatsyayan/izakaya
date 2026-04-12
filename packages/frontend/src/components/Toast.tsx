import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../store/useToastStore';

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
    }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
            style={{
              width: 320,
              minHeight: 48,
              padding: '12px 16px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderLeft: `3px solid ${toast.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
              borderRadius: 6,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
            onClick={() => removeToast(toast.id)}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {toast.title}
            </div>
            {toast.body && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {toast.body}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
