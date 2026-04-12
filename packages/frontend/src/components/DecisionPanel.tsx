import { useDashboardStore } from '../store/useDashboardStore';
import { RecommendationCard } from './AlertPanel';
import type { Recommendation } from '@izakaya/shared';

export function DecisionPanel() {
  const state = useDashboardStore((s) => s.simulationState);
  const recs = state.activeRecommendations.filter((r: Recommendation) => r.status === 'active');
  const location = state.layers.location;
  const derived = state.derivedMetrics;

  return (
    <div className="p-3 space-y-3">
      {/* Community Impact */}
      <div className="bg-[#252840] rounded-md p-3">
        <div className="text-[11px] text-slate-500 uppercase mb-2">
          Community Impact — {location.communityName}
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Water Stress Index</span>
            <span className={`font-mono ${
              location.waterStressIndex > 0.6 ? 'text-red-400'
                : location.waterStressIndex > 0.3 ? 'text-yellow-400'
                : 'text-green-400'
            }`}>
              {location.waterStressIndex.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Air Quality Index</span>
            <span className={`font-mono ${
              location.localAirQualityIndex > 150 ? 'text-red-400'
                : location.localAirQualityIndex > 100 ? 'text-yellow-400'
                : 'text-slate-200'
            }`}>
              {location.localAirQualityIndex}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">CO₂ Output</span>
            <span className="font-mono text-slate-200">{Math.round(derived.carbonOutputKgPerHr)} kg/hr</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Cumulative CO₂</span>
            <span className="font-mono text-slate-200">{Math.round(derived.totalCarbonEmittedKg)} kg</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Cumulative Water</span>
            <span className="font-mono text-slate-200">{Math.round(derived.totalWaterConsumedLiters)} L</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Renewable Fraction</span>
            <span className={`font-mono ${
              location.renewableEnergyFraction > 0.6 ? 'text-green-400'
                : location.renewableEnergyFraction > 0.3 ? 'text-yellow-400'
                : 'text-red-400'
            }`}>
              {(location.renewableEnergyFraction * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Active Recommendations */}
      <div className="text-[11px] text-slate-500 uppercase">Recommendations ({recs.length})</div>
      {recs.map((rec: Recommendation) => (
        <RecommendationCard key={rec.id} rec={rec} />
      ))}
      {recs.length === 0 && (
        <p className="text-slate-500 text-xs text-center py-4">No active recommendations</p>
      )}
    </div>
  );
}
