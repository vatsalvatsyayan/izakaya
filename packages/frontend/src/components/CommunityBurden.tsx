import { useMemo } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { computeCommunityBurden } from '@izakaya/shared';

export function CommunityBurden() {
  const state = useDashboardStore((s) => s.simulationState);

  const burden = useMemo(
    () => computeCommunityBurden(state.layers.location, state.layers.cooling.waterUsageRate),
    [state.layers.location, state.layers.cooling.waterUsageRate],
  );

  const stressColor =
    burden.waterStressLevel === 'critical' ? 'var(--critical)'
    : burden.waterStressLevel === 'high' ? 'var(--warning)'
    : burden.waterStressLevel === 'moderate' ? 'var(--warning-text)'
    : 'var(--healthy)';

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-default)',
      borderRadius: 6,
      padding: 12,
      marginTop: 8,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--text-secondary)',
        marginBottom: 8,
      }}>
        Community Impact
      </div>
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 4,
      }}>
        {burden.communityName}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Water Stress</span>
          <span style={{ color: stressColor, fontWeight: 600, textTransform: 'capitalize' }}>
            {burden.waterStressLevel} ({burden.waterStressIndex.toFixed(2)})
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Water Draw</span>
          <span>{Math.round(burden.facilityWaterDrawLitersPerDay).toLocaleString()} L/day</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Community Budget</span>
          <span>{burden.communityWaterBudgetPercent}%</span>
        </div>
        <div style={{
          fontSize: 12,
          fontStyle: 'italic',
          color: 'var(--text-tertiary)',
          marginTop: 4,
        }}>
          {burden.airQualityImpact}
        </div>
      </div>
    </div>
  );
}
