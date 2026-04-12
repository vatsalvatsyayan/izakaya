import { motion } from 'framer-motion';

export function SimulationBanner() {
  return (
    <motion.div
      initial={{ y: -36 }}
      animate={{ y: 0 }}
      exit={{ y: -36 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 36,
        background: 'rgba(59, 130, 246, 0.9)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        zIndex: 10,
      }}
    >
      <span style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'white',
        animation: 'sim-pulse 2s ease-in-out infinite',
      }} />
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'white',
      }}>
        SIMULATION MODE — changes are hypothetical
      </span>
      <style>{`
        @keyframes sim-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
}
