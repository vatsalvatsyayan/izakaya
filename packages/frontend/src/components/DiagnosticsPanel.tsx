import { useDashboardStore } from '../store/useDashboardStore';

export function DiagnosticsPanel() {
  const gpu = useDashboardStore((s) => s.simulationState.layers.gpu);
  const rackShutdowns = gpu.levers.gracefulRackShutdown;

  return (
    <div className="p-3 space-y-3">
      {/* GPU Fleet Status */}
      <div className="bg-[#252840] rounded-md p-3">
        <div className="text-[11px] text-slate-500 uppercase mb-2">GPU Fleet Status</div>
        <div className="grid grid-cols-5 gap-1">
          {(Array.isArray(rackShutdowns) ? rackShutdowns : Array(10).fill(false)).map((shutdown: boolean, i: number) => (
            <div key={i} className={`rounded p-2 text-center text-[10px] font-mono ${
              shutdown ? 'bg-slate-800 text-slate-600' : 'bg-[#1e2133] text-slate-300'
            }`}>
              <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${shutdown ? 'bg-slate-600' : 'bg-green-500'}`} />
              R{i}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          Active: {gpu.activeGpuCount}/240 GPUs | Failure Rate: {gpu.hardwareFailureRate.toFixed(1)}/day
        </div>
      </div>

      {/* Thermal Summary */}
      <div className="bg-[#252840] rounded-md p-3">
        <div className="text-[11px] text-slate-500 uppercase mb-2">Thermal Summary</div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Avg GPU Temp</span>
            <span className="font-mono text-slate-200">{gpu.averageGpuTemperature.toFixed(1)}°C</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Throttle Threshold</span>
            <span className="font-mono text-slate-200">{gpu.levers.thermalThrottleThreshold}°C</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Thermal Headroom</span>
            <span className={`font-mono ${
              (gpu.levers.thermalThrottleThreshold - gpu.averageGpuTemperature) < 5
                ? 'text-red-400'
                : (gpu.levers.thermalThrottleThreshold - gpu.averageGpuTemperature) < 10
                  ? 'text-yellow-400'
                  : 'text-green-400'
            }`}>
              {(gpu.levers.thermalThrottleThreshold - gpu.averageGpuTemperature).toFixed(1)}°C
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">GPU Utilization</span>
            <span className="font-mono text-slate-200">{(gpu.gpuUtilizationRate * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Idle Power Waste */}
      <div className="bg-[#252840] rounded-md p-3">
        <div className="text-[11px] text-slate-500 uppercase mb-2">Idle Power Analysis</div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Idle Power Waste</span>
            <span className={`font-mono ${gpu.gpuIdlePowerWaste > 50 ? 'text-orange-400' : 'text-slate-200'}`}>
              {gpu.gpuIdlePowerWaste.toFixed(1)} kW
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Power Limit</span>
            <span className="font-mono text-slate-200">{gpu.levers.gpuPowerLimit} W/GPU</span>
          </div>
        </div>
      </div>
    </div>
  );
}
