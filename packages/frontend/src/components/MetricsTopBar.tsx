import { useDashboardStore } from '../store/useDashboardStore';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MetricTile {
  label: string;
  key: string;
  getValue: () => string;
  unit: string;
}

export function MetricsTopBar() {
  const state = useDashboardStore((s) => s.simulationState);
  const history = useDashboardStore((s) => s.metricHistory);

  const tiles: MetricTile[] = [
    { label: 'PUE', key: 'pue', getValue: () => state.derivedMetrics.pue.toFixed(2), unit: '' },
    { label: 'WUE', key: 'wue', getValue: () => state.derivedMetrics.wue.toFixed(2), unit: 'L/kWh' },
    { label: 'CUE', key: 'cue', getValue: () => state.derivedMetrics.cue.toFixed(2), unit: 'kgCO\u2082/kWh' },
    { label: 'GPU UTILIZATION', key: 'gpuUtilizationRate', getValue: () => `${Math.round(state.layers.gpu.gpuUtilizationRate * 100)}`, unit: '%' },
    { label: 'CARBON OUTPUT', key: 'carbonOutputKgPerHr', getValue: () => Math.round(state.derivedMetrics.carbonOutputKgPerHr).toString(), unit: 'kgCO\u2082/hr' },
    { label: 'THROUGHPUT', key: 'requestVolume', getValue: () => Math.round(state.layers.workload.requestVolume).toLocaleString(), unit: 'req/hr' },
  ];

  return (
    <div style={{
      display: 'flex',
      height: 64,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-default)',
    }}>
      {tiles.map((tile, i) => {
        const data = (history[tile.key] || []).map((v) => ({ v }));
        const arr = history[tile.key] || [];
        const trend = arr.length >= 2 ? arr[arr.length - 1] - arr[arr.length - 2] : 0;

        return (
          <div
            key={tile.key}
            style={{
              flex: '1 1 0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '8px 12px',
              borderRight: i < tiles.length - 1 ? '1px solid var(--border-default)' : undefined,
              minWidth: 0,
            }}
          >
            <div style={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              lineHeight: '16px',
            }}>
              {tile.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: '32px',
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums',
                transition: 'color 150ms ease-out',
              }}>
                {tile.getValue()}
              </span>
              {tile.unit && (
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{tile.unit}</span>
              )}
              <span style={{
                fontSize: 12,
                color: trend > 0 ? 'var(--critical)' : trend < 0 ? 'var(--healthy)' : 'var(--text-tertiary)',
              }}>
                {trend > 0 ? '\u2191' : trend < 0 ? '\u2193' : '\u2192'}
              </span>
              {data.length > 1 && (
                <div style={{ width: 50, height: 24, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke="var(--text-tertiary)"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
