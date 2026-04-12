import { useDashboardStore } from '../store/useDashboardStore';
import { computeCommunityBurden } from '@izakaya/shared';

type WsiLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

function getWsiLevel(wsi: number): { label: WsiLevel; color: string; pulse: boolean } {
  if (wsi > 0.8)  return { label: 'Critical', color: '#F87171', pulse: true  };
  if (wsi >= 0.6) return { label: 'High',     color: '#FB923C', pulse: false };
  if (wsi >= 0.3) return { label: 'Moderate', color: '#FACC15', pulse: false };
  return           { label: 'Low',      color: '#4ADE80', pulse: false };
}

function carbonToCarMiles(kgPerHr: number) {
  return Math.round(kgPerHr / 0.404);
}

export function CommunityBurdenIndicator() {
  const state     = useDashboardStore((s) => s.simulationState);
  const burden    = computeCommunityBurden(state.layers.location, state.layers.cooling.waterUsageRate);
  const carbonKgHr = state.derivedMetrics.carbonOutputKgPerHr;
  const carMiles  = carbonToCarMiles(carbonKgHr);
  const wsi       = getWsiLevel(burden.waterStressIndex);

  return (
    <div style={{
      flexShrink: 0,
      background: '#080E1A',
      borderTop: '2px solid #1E3A5F',
      padding: '8px 12px 10px',
    }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{
          fontSize: 9,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#334155',
        }}>
          Community Burden
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#7DD3FC', letterSpacing: '0.01em' }}>
          {burden.communityName}
        </span>
      </div>

      {/* Three metric rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* WSI row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#475569' }}>Water Stress Index</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#E2E8F0' }}>
              {burden.waterStressIndex.toFixed(2)}
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: 3,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: wsi.color,
              background: wsi.color + '18',
              border: `1px solid ${wsi.color}40`,
              animation: wsi.pulse ? 'wsi-pulse 1s ease-in-out infinite' : 'none',
            }}>
              {wsi.label}
            </span>
          </div>
        </div>

        {/* Water row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#475569' }}>Water draw</span>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'monospace',
            color: '#38BDF8',
          }}>
            {Math.round(burden.facilityWaterDrawLitersPerDay).toLocaleString()} L/day
          </span>
        </div>

        {/* Carbon row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: '#475569' }}>Carbon output</span>
          <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: '#94A3B8' }}>
            {carbonKgHr.toFixed(1)} kgCO₂/hr
            <span style={{ fontSize: 9, color: '#334155', marginLeft: 4 }}>≈ {carMiles} car-mi</span>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes wsi-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}
