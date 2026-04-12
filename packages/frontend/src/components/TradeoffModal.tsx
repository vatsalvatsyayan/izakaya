import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStore } from '../store/useDashboardStore';
import { useToastStore } from '../store/useToastStore';
import { computeCommunityBurden, LEVER_DEFINITIONS } from '@izakaya/shared';

// Car-miles per kgCO2 equivalent (EPA: ~0.404 kg CO2/mile)
function carbonToCarMiles(kgPerHr: number) {
  return Math.round(kgPerHr / 0.404);
}

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

  useEffect(() => {
    if (show) setChecked(false);
  }, [show]);

  // Prevent escape key and clicking outside from dismissing
  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') e.preventDefault(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show]);

  if (!show || !selectedLayer) return null;

  const entries = Object.entries(pending);
  const burden = computeCommunityBurden(state.layers.location, state.layers.cooling.waterUsageRate);
  const carbonKgHr = state.derivedMetrics.carbonOutputKgPerHr;
  const carMiles = carbonToCarMiles(carbonKgHr);

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
        /* Spec §2.1: full-screen overlay rgba(0,0,0,0.75), clicking outside does nothing */
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            style={{
              width: 600,
              maxHeight: '85vh',
              overflow: 'auto',
              /* Spec §2.1: bg #1E293B, border #334155, radius 12px */
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: 28,
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#F59E0B', fontSize: 22 }}>{'\u26A0'}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>
                  Action Impact Acknowledgment
                </span>
              </div>
              {/* X closes = Cancel — spec §2.5 */}
              <button
                onClick={handleCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: 18,
                  cursor: 'pointer',
                  padding: 4,
                  lineHeight: 1,
                }}
                title="Cancel"
              >
                {'\u2715'}
              </button>
            </div>

            {/* Section 1 — ACTION */}
            <ModalSection title="ACTION">
              <p style={{ color: '#E2E8F0', fontSize: 15, fontWeight: 600 }}>{actionText}</p>
            </ModalSection>

            {/* Section 2 — TRADEOFF */}
            <ModalSection title="TRADEOFF">
              <p style={{ color: '#CBD5E1', lineHeight: 1.6 }}>
                {tradeoffText || 'No significant tradeoffs identified.'}
              </p>
            </ModalSection>

            {/* Section 3 — COMMUNITY IMPACT — key numbers in accent color */}
            <ModalSection title="COMMUNITY IMPACT">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: '#94A3B8', fontSize: 13 }}>Community</span>
                  {/* Spec §2.3: community name in accent color, 18px+ */}
                  <span style={{ color: '#38BDF8', fontSize: 18, fontWeight: 700 }}>{burden.communityName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: '#94A3B8', fontSize: 13 }}>Water Stress Index</span>
                  <span style={{ color: '#38BDF8', fontSize: 18, fontWeight: 700 }}>
                    {burden.waterStressIndex.toFixed(2)}
                    <span style={{ fontSize: 13, color: '#64748B', fontWeight: 400, marginLeft: 6 }}>
                      ({burden.waterStressLevel})
                    </span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: '#94A3B8', fontSize: 13 }}>Facility water draw</span>
                  <span style={{ color: '#38BDF8', fontSize: 18, fontWeight: 700 }}>
                    {Math.round(burden.facilityWaterDrawLitersPerDay).toLocaleString()} L/day
                    <span style={{ fontSize: 13, color: '#64748B', fontWeight: 400, marginLeft: 6 }}>
                      ({burden.communityWaterBudgetPercent}% of community budget)
                    </span>
                  </span>
                </div>
              </div>
            </ModalSection>

            {/* Section 4 — END USER IMPACT */}
            <ModalSection title="END USER IMPACT">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: '#94A3B8', fontSize: 13 }}>Active traffic affected</span>
                  <span style={{ color: '#38BDF8', fontSize: 18, fontWeight: 700 }}>
                    {Math.round(state.layers.workload.requestVolume).toLocaleString()} req/hr
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: '#94A3B8', fontSize: 13 }}>Current inference latency</span>
                  <span style={{ color: '#38BDF8', fontSize: 18, fontWeight: 700 }}>
                    {Math.round(state.layers.workload.averageInferenceLatency)} ms
                  </span>
                </div>
                <div style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
                  Carbon output: {carbonKgHr.toFixed(1)} kgCO₂/hr ≈ {carMiles} car-miles/hr
                </div>
              </div>
            </ModalSection>

            {/* Acknowledgment checkbox — spec §2.4 */}
            <div
              onClick={() => setChecked(!checked)}
              style={{
                background: '#0F172A',
                border: `1px solid ${checked ? '#3B82F6' : '#334155'}`,
                padding: '14px 16px',
                borderRadius: 8,
                marginTop: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'border-color 150ms',
              }}
            >
              <div style={{
                width: 20,
                height: 20,
                border: `2px solid ${checked ? '#3B82F6' : '#475569'}`,
                borderRadius: 4,
                background: checked ? '#3B82F6' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 150ms',
              }}>
                {checked && <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{'\u2713'}</span>}
              </div>
              <span style={{ fontSize: 14, color: '#E2E8F0', lineHeight: 1.4 }}>
                I acknowledge the tradeoffs, community burden, and end-user impact of this action
              </span>
            </div>

            {/* Buttons — spec §2.4 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button
                onClick={handleCancel}
                style={{
                  background: 'none',
                  border: '1px solid #334155',
                  color: '#94A3B8',
                  fontSize: 14,
                  fontWeight: 600,
                  height: 44,
                  padding: '0 28px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={checked && !submitting ? handleConfirm : undefined}
                style={{
                  /* Spec §2.4: disabled opacity 0.4, cursor not-allowed; active color #3B82F6 */
                  background: '#3B82F6',
                  border: 'none',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 700,
                  height: 44,
                  padding: '0 28px',
                  borderRadius: 8,
                  cursor: checked && !submitting ? 'pointer' : 'not-allowed',
                  opacity: checked && !submitting ? 1 : 0.4,
                  transition: 'opacity 200ms',
                  fontFamily: 'inherit',
                }}
              >
                {submitting ? 'Committing…' : 'Confirm & Commit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ModalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div style={{ borderTop: '1px solid #1E3A5F', margin: '18px 0 12px' }} />
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#64748B',
        marginBottom: 10,
      }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: '#CBD5E1', lineHeight: '22px' }}>
        {children}
      </div>
    </>
  );
}
