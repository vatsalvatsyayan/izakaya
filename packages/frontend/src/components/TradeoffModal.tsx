import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStore } from '../store/useDashboardStore';
import { useToastStore } from '../store/useToastStore';
import { computeCommunityBurden, LEVER_DEFINITIONS } from '@izakaya/shared';

export function TradeoffModal() {
  const show = useDashboardStore((s) => s.showTradeoffModal);
  const setShow = useDashboardStore((s) => s.setShowTradeoffModal);
  const pending = useDashboardStore((s) => s.pendingLeverChanges);
  const clearPending = useDashboardStore((s) => s.clearPendingLeverChanges);
  const state = useDashboardStore((s) => s.simulationState);
  const selectedLayer = useDashboardStore((s) => s.selectedLayer);
  const addToast = useToastStore((s) => s.addToast);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (show) {
      setChecked(false);
      setTimeout(() => closeRef.current?.focus(), 100);
    }
  }, [show]);

  // Prevent escape key
  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') e.preventDefault(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show]);

  if (!show || !selectedLayer) return null;

  const entries = Object.entries(pending);
  const burden = computeCommunityBurden(state.layers.location, state.layers.cooling.waterUsageRate);

  // Generate texts
  const actionText = entries.map(([leverId, val]: [string, number]) => {
    const lever = LEVER_DEFINITIONS.find((l: { id: string }) => l.id === leverId);
    return `${lever?.name || leverId}: ${val}${lever?.unit || ''}`;
  }).join(', ');

  const tradeoffText = entries.map(([leverId]: [string, number]) => {
    const lever = LEVER_DEFINITIONS.find((l: { id: string }) => l.id === leverId);
    return lever?.effectMap.map((e: { description: string }) => e.description).join('. ') || '';
  }).filter(Boolean).join(' ');

  const communityText = `${burden.communityName}: Water stress is ${burden.waterStressLevel} (${burden.waterStressIndex.toFixed(2)}). Facility draws ${Math.round(burden.facilityWaterDrawLitersPerDay).toLocaleString()} L/day (${burden.communityWaterBudgetPercent}% of community budget).`;

  const endUserText = `Changes may affect inference latency and throughput for ${Math.round(state.layers.workload.requestVolume).toLocaleString()} req/hr of active traffic.`;

  async function handleConfirm() {
    setSubmitting(true);
    for (const [leverId, newValue] of entries) {
      const lever = LEVER_DEFINITIONS.find((l: { id: string }) => l.id === leverId);
      const layerState = state.layers[selectedLayer as keyof typeof state.layers];
      const currentValue = (layerState as any)?.levers?.[leverId] ?? lever?.currentValue ?? 0;

      try {
        const res = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            layerId: selectedLayer,
            leverId,
            previousValue: currentValue,
            newValue,
            tradeoffAcknowledgment: {
              tradeoffText,
              communityImpactText: communityText,
              endUserImpactText: endUserText,
              acknowledged: true,
            },
          }),
        });
        if (res.ok) {
          addToast({ type: 'success', title: 'Action committed', body: actionText });
        } else {
          addToast({ type: 'error', title: 'Action failed', body: 'Backend not available' });
        }
      } catch {
        addToast({ type: 'error', title: 'Action failed', body: 'Backend not available' });
      }
    }
    clearPending();
    setShow(false);
    setSubmitting(false);
  }

  function handleCancel() {
    clearPending();
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--modal-backdrop)',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
            style={{
              width: 560,
              maxHeight: '80vh',
              overflow: 'auto',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              padding: 24,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--warning)', fontSize: 20 }}>{'\u26A0'}</span>
                <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Action Impact Acknowledgment
                </span>
              </div>
              <button
                ref={closeRef}
                onClick={handleCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  fontSize: 16,
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                {'\u2715'}
              </button>
            </div>

            {/* ACTION */}
            <Section title="ACTION">
              <p>{actionText}</p>
            </Section>

            {/* TRADEOFF */}
            <Section title="TRADEOFF">
              <p>{tradeoffText || 'No significant tradeoffs identified.'}</p>
            </Section>

            {/* COMMUNITY IMPACT */}
            <Section title="COMMUNITY IMPACT">
              <p>{communityText}</p>
            </Section>

            {/* END USER IMPACT */}
            <Section title="END USER IMPACT">
              <p>{endUserText}</p>
            </Section>

            {/* Checkbox */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: 16,
              borderRadius: 6,
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
            }} onClick={() => setChecked(!checked)}>
              <div style={{
                width: 18,
                height: 18,
                border: `2px solid ${checked ? 'var(--action-primary)' : 'var(--border-default)'}`,
                borderRadius: 4,
                background: checked ? 'var(--action-primary)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 150ms',
              }}>
                {checked && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{'\u2713'}</span>}
              </div>
              <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                I acknowledge the tradeoffs and community impact of this action
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button
                onClick={handleCancel}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                  fontWeight: 600,
                  height: 40,
                  padding: '0 24px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!checked || submitting}
                style={{
                  background: checked ? 'var(--action-primary)' : 'var(--bg-elevated)',
                  border: 'none',
                  color: checked ? 'white' : 'var(--text-disabled)',
                  fontSize: 14,
                  fontWeight: 600,
                  height: 40,
                  padding: '0 24px',
                  borderRadius: 6,
                  cursor: checked ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {submitting ? 'Committing...' : 'Confirm & Commit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div style={{
        borderTop: '1px solid var(--border-default)',
        margin: '16px 0',
      }} />
      <div style={{
        fontSize: 11,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--text-secondary)',
        marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: '20px' }}>
        {children}
      </div>
    </>
  );
}
