import { useDashboardStore } from '../store/useDashboardStore';
import { LEVER_DEFINITIONS } from '@izakaya/shared';
import type { Lever } from '@izakaya/shared';

export function ActionPanel() {
  const selectedLayer = useDashboardStore((s) => s.selectedLayer);
  const state = useDashboardStore((s) => s.simulationState);
  const pending = useDashboardStore((s) => s.pendingLeverChanges);
  const setPending = useDashboardStore((s) => s.setPendingLeverChange);
  const setShowModal = useDashboardStore((s) => s.setShowTradeoffModal);

  if (!selectedLayer) return null;

  const levers = LEVER_DEFINITIONS.filter((l: Lever) => l.layerId === selectedLayer);

  // Get current lever values from simulation state
  const layerState = state.layers[selectedLayer as keyof typeof state.layers];
  const layerLevers = (layerState as any)?.levers || {};

  const hasPending = Object.keys(pending).length > 0;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--text-secondary)',
      }}>
        Controls — {selectedLayer}
      </div>

      {levers.map((lever: Lever) => {
        const rawVal = pending[lever.id] ?? layerLevers[lever.id] ?? lever.currentValue;
        const currentVal = typeof rawVal === 'boolean' ? (rawVal ? 1 : 0) : rawVal;
        const isToggle = lever.type === 'toggle';

        if (isToggle) {
          // Special handling for gracefulRackShutdown (array type) - skip for simplicity
          if (lever.id === 'gracefulRackShutdown') return null;

          const boolVal = currentVal === 1;
          return (
            <div key={lever.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{lever.name}</span>
              <button
                onClick={() => setPending(lever.id, boolVal ? 0 : 1)}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  border: 'none',
                  background: boolVal ? 'var(--action-primary)' : 'var(--bg-elevated)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 150ms',
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: 2,
                  left: boolVal ? 18 : 2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#F8FAFC',
                  transition: 'left 150ms',
                }} />
              </button>
            </div>
          );
        }

        return (
          <div key={lever.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{lever.name}</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                {typeof currentVal === 'number' ? (currentVal % 1 !== 0 ? currentVal.toFixed(2) : currentVal) : currentVal}
                {lever.unit ? ` ${lever.unit}` : ''}
              </span>
            </div>
            <input
              type="range"
              min={lever.minValue}
              max={lever.maxValue}
              step={lever.step}
              value={currentVal as number}
              onChange={(e) => setPending(lever.id, parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--action-primary)',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
              <span>{lever.minValue}{lever.unit}</span>
              <span>{lever.maxValue}{lever.unit}</span>
            </div>
            {/* Projected impact hints */}
            {lever.effectMap.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {lever.effectMap.map((eff: Lever['effectMap'][number], idx: number) => (
                  <span key={idx}>
                    {idx > 0 ? ', ' : 'Affects: '}
                    {eff.description.slice(0, 50)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={() => setShowModal(true)}
        disabled={!hasPending}
        style={{
          width: '100%',
          height: 40,
          background: hasPending ? 'var(--action-primary)' : 'var(--bg-elevated)',
          color: hasPending ? 'white' : 'var(--text-disabled)',
          border: 'none',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          cursor: hasPending ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-sans)',
          marginTop: 8,
        }}
      >
        Commit Action
      </button>
    </div>
  );
}
