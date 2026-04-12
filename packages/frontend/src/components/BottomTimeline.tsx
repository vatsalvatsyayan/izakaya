import { useDashboardStore } from '../store/useDashboardStore';

export function BottomTimeline() {
  // Use reactive selectors — never call .getState() inside JSX, as it won't re-render
  const simTime = useDashboardStore((s) => s.simulationState.simulatedTimeSeconds);
  const mode = useDashboardStore((s) => s.simulationState.mode);
  const connectionStatus = useDashboardStore((s) => s.connectionStatus);
  const timestamp = useDashboardStore((s) => s.simulationState.timestamp);
  const tick = useDashboardStore((s) => s.simulationState.tick);
  const totalCarbonEmittedKg = useDashboardStore((s) => s.simulationState.derivedMetrics.totalCarbonEmittedKg);
  const totalWaterConsumedLiters = useDashboardStore((s) => s.simulationState.derivedMetrics.totalWaterConsumedLiters);

  const hours = Math.floor(simTime / 3600);
  const minutes = Math.floor((simTime % 3600) / 60);
  const seconds = Math.floor(simTime % 60);
  const timeStr = `T+${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="h-12 flex-shrink-0 bg-[#1a1d27] border-t border-[#2d3148] flex items-center px-4 gap-4">
      {/* LIVE / mode indicator */}
      <div className="flex items-center gap-1.5">
        {mode === 'live' && connectionStatus === 'connected' ? (
          <>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400 font-bold">LIVE</span>
          </>
        ) : mode === 'simulation' ? (
          <span className="text-xs text-blue-400 font-bold">SIMULATION</span>
        ) : (
          <span className="text-xs text-slate-500">OFFLINE</span>
        )}
      </div>

      {/* Simulated elapsed time */}
      <span className="font-mono text-slate-400 text-xs">{timeStr}</span>

      {/* Wall-clock timestamp */}
      <span className="text-[10px] text-slate-600">
        {new Date(timestamp).toLocaleTimeString()}
      </span>

      <div className="flex-1" />

      {/* Tick counter */}
      <span className="text-[10px] text-slate-600 font-mono">Tick {tick}</span>

      {/* Cumulative environmental metrics */}
      <span className="text-[10px] text-slate-500">
        CO₂: {Math.round(totalCarbonEmittedKg)} kg
      </span>
      <span className="text-[10px] text-slate-500">
        H₂O: {Math.round(totalWaterConsumedLiters)} L
      </span>
    </div>
  );
}
