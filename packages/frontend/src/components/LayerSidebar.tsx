import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStore } from '../store/useDashboardStore';
import { useLayerHealth } from '../hooks/useLayerHealth';
import { CommunityBurden } from './CommunityBurden';
import type { HealthStatus } from '@izakaya/shared';

const healthColor: Record<HealthStatus, string> = {
  healthy: 'var(--healthy)',
  warning: 'var(--warning)',
  critical: 'var(--critical)',
};

export function LayerSidebar() {
  const layers = useLayerHealth();
  const selectedLayer = useDashboardStore((s) => s.selectedLayer);
  const selectLayer = useDashboardStore((s) => s.selectLayer);
  const state = useDashboardStore((s) => s.simulationState);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {layers.map((layer) => {
        const isSelected = selectedLayer === layer.layerId;
        const allMetrics = getLayerMetrics(layer.layerId, state);

        return (
          <motion.div
            key={layer.layerId}
            onClick={() => selectLayer(layer.layerId)}
            style={{
              background: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: 6,
              cursor: 'pointer',
              overflow: 'hidden',
              borderLeft: isSelected ? `3px solid ${healthColor[layer.health]}` : '1px solid var(--border-default)',
              transition: 'background 150ms',
            }}
            whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            {/* Collapsed header - always visible */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: 12,
              height: 56,
              gap: 8,
            }}>
              <span style={{ fontSize: 20 }}>{layer.icon}</span>
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)',
                flex: 1,
              }}>
                {layer.layerName}
              </span>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: healthColor[layer.health],
                flexShrink: 0,
              }} />
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 2,
              }}>
                {layer.keyMetrics.map((m) => (
                  <span key={m.label} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14,
                    color: 'var(--text-secondary)',
                  }}>
                    {m.value}
                  </span>
                ))}
              </div>
            </div>

            {/* Expanded metrics */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    padding: '0 12px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    borderTop: '1px solid var(--border-default)',
                    paddingTop: 8,
                  }}>
                    {allMetrics.map((m) => (
                      <div key={m.label} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: 32,
                      }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: 'var(--text-secondary)',
                        }}>
                          {m.label}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 16,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <CommunityBurden />
    </div>
  );
}

function getLayerMetrics(layerId: string, state: { layers: Record<string, Record<string, unknown>> }) {
  const layerData = state.layers[layerId as keyof typeof state.layers];
  if (!layerData) return [];
  const skip = ['levers', 'health'];
  return Object.entries(layerData as Record<string, unknown>)
    .filter(([k]) => !skip.includes(k))
    .map(([k, v]) => ({
      label: k.replace(/([A-Z])/g, ' $1').trim(),
      value: typeof v === 'number'
        ? v < 1 && v > 0 ? `${(v * 100).toFixed(1)}%` : v % 1 !== 0 ? v.toFixed(2) : v.toLocaleString()
        : String(v),
    }));
}
