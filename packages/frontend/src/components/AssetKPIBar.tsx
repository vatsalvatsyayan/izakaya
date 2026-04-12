import { useDashboardStore } from '../store/useDashboardStore';

function getStatusColor(value: number, thresholds: { green: number; yellow: number; orange: number }, higherIsWorse: boolean): string {
  if (higherIsWorse) {
    if (value <= thresholds.green) return 'text-green-400';
    if (value <= thresholds.yellow) return 'text-yellow-400';
    if (value <= thresholds.orange) return 'text-orange-400';
    return 'text-red-400';
  } else {
    if (value >= thresholds.green) return 'text-green-400';
    if (value >= thresholds.yellow) return 'text-yellow-400';
    if (value >= thresholds.orange) return 'text-orange-400';
    return 'text-red-400';
  }
}

function getStatusLabel(value: number, thresholds: { green: number; yellow: number; orange: number }, higherIsWorse: boolean): string {
  if (higherIsWorse) {
    if (value <= thresholds.green) return 'Good';
    if (value <= thresholds.yellow) return 'Monitor';
    if (value <= thresholds.orange) return 'Action Needed';
    return 'Critical';
  } else {
    if (value >= thresholds.green) return 'Good';
    if (value >= thresholds.yellow) return 'Monitor';
    if (value >= thresholds.orange) return 'Action Needed';
    return 'Critical';
  }
}

function KPITile({
  label, value, unit, formattedValue, percent, colorClass, statusLabel,
}: {
  label: string; value: number; unit: string; formattedValue: string;
  percent: number; colorClass: string; statusLabel: string;
}) {
  const barColor = colorClass.replace('text-', 'bg-');
  return (
    <div className="flex-1 flex flex-col justify-center px-3 border-r border-[#2d3148] min-w-0">
      <div className="text-[11px] text-slate-400 uppercase tracking-wider truncate">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-[17px] font-mono font-bold ${colorClass}`}>{formattedValue}</span>
        <span className="text-[11px] text-slate-500">{unit}</span>
      </div>
      <div className="h-[2px] bg-[#2d3148] rounded-full mt-1 w-full">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, percent)}%`, transition: 'width 0.5s' }} />
      </div>
      <div className="text-[11px] text-slate-400 mt-0.5">{statusLabel}</div>
    </div>
  );
}

export function AssetKPIBar() {
  const state = useDashboardStore((s) => s.simulationState);
  const pue = state.derivedMetrics.pue;
  const gpuTemp = state.layers.gpu.averageGpuTemperature;
  const gpuUtil = state.layers.gpu.gpuUtilizationRate * 100;
  const latency = state.layers.workload.averageInferenceLatency;
  const carbon = state.derivedMetrics.carbonOutputKgPerHr;

  return (
    <div className="h-16 flex-shrink-0 bg-[#1a1d27] border-b border-[#2d3148] flex items-center">
      {/* Asset Nameplate */}
      <div className="flex items-center gap-3 px-4 min-w-[220px] border-r border-[#2d3148] h-full">
        <div>
          <div className="text-white font-mono font-bold text-base">DC-001</div>
          <div className="flex gap-1.5 mt-0.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300">240× H100</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300">10 Racks</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Umatilla County, Oregon, USA</div>
        </div>
      </div>

      {/* KPI Tiles */}
      <KPITile
        label="PUE"
        value={pue}
        unit="ratio"
        formattedValue={pue.toFixed(2)}
        percent={Math.max(0, Math.min(100, (pue - 1) / (2.0 - 1) * 100))}
        colorClass={getStatusColor(pue, { green: 1.3, yellow: 1.5, orange: 1.8 }, true)}
        statusLabel={getStatusLabel(pue, { green: 1.3, yellow: 1.5, orange: 1.8 }, true)}
      />
      <KPITile
        label="GPU Temp"
        value={gpuTemp}
        unit="°C"
        formattedValue={gpuTemp.toFixed(1)}
        percent={Math.max(0, Math.min(100, (gpuTemp - 40) / (95 - 40) * 100))}
        colorClass={getStatusColor(gpuTemp, { green: 72, yellow: 78, orange: 83 }, true)}
        statusLabel={getStatusLabel(gpuTemp, { green: 72, yellow: 78, orange: 83 }, true)}
      />
      <KPITile
        label="GPU Util"
        value={gpuUtil}
        unit="%"
        formattedValue={gpuUtil.toFixed(1)}
        percent={gpuUtil}
        colorClass={getStatusColor(gpuUtil, { green: 70, yellow: 50, orange: 30 }, false)}
        statusLabel={getStatusLabel(gpuUtil, { green: 70, yellow: 50, orange: 30 }, false)}
      />
      <KPITile
        label="Latency"
        value={latency}
        unit="ms"
        formattedValue={latency.toFixed(0)}
        percent={Math.max(0, Math.min(100, latency / 300 * 100))}
        colorClass={getStatusColor(latency, { green: 100, yellow: 150, orange: 200 }, true)}
        statusLabel={getStatusLabel(latency, { green: 100, yellow: 150, orange: 200 }, true)}
      />
      <KPITile
        label="Carbon"
        value={carbon}
        unit="kg/hr"
        formattedValue={carbon.toFixed(0)}
        percent={Math.max(0, Math.min(100, carbon / 400 * 100))}
        colorClass={getStatusColor(carbon, { green: 150, yellow: 250, orange: 400 }, true)}
        statusLabel={getStatusLabel(carbon, { green: 150, yellow: 250, orange: 400 }, true)}
      />

      {/* Standards badge */}
      <div className="hidden xl:flex items-center px-3 h-full border-l border-[#2d3148]">
        <div className="text-[9px] text-slate-700 text-center">
          <div>ISO 50001</div>
          <div>ASHRAE A1</div>
        </div>
      </div>
    </div>
  );
}
