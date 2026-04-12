import { useDashboardStore } from '../store/useDashboardStore';

// Status helpers ---------------------------------------------------------
type StatusLevel = 'good' | 'monitor' | 'warn' | 'critical';

function getLevel(
  value: number,
  thresholds: { good: number; monitor: number; warn: number },
  higherIsWorse: boolean
): StatusLevel {
  if (higherIsWorse) {
    if (value <= thresholds.good)    return 'good';
    if (value <= thresholds.monitor) return 'monitor';
    if (value <= thresholds.warn)    return 'warn';
    return 'critical';
  } else {
    if (value >= thresholds.good)    return 'good';
    if (value >= thresholds.monitor) return 'monitor';
    if (value >= thresholds.warn)    return 'warn';
    return 'critical';
  }
}

const LEVEL_VALUE_COLOR: Record<StatusLevel, string> = {
  good:     '#4ADE80',
  monitor:  '#FACC15',
  warn:     '#FB923C',
  critical: '#F87171',
};

const LEVEL_BAR_COLOR: Record<StatusLevel, string> = {
  good:     '#22C55E',
  monitor:  '#EAB308',
  warn:     '#F97316',
  critical: '#EF4444',
};

const LEVEL_LABEL: Record<StatusLevel, string> = {
  good:     'Good',
  monitor:  'Monitor',
  warn:     'Action',
  critical: 'Critical',
};

// KPI Tile ---------------------------------------------------------------
function KPITile({
  label,
  formattedValue,
  unit,
  level,
  barPercent,
  isLast = false,
}: {
  label: string;
  formattedValue: string;
  unit: string;
  level: StatusLevel;
  barPercent: number;
  isLast?: boolean;
}) {
  const valueColor = LEVEL_VALUE_COLOR[level];
  const barColor   = LEVEL_BAR_COLOR[level];
  const labelText  = LEVEL_LABEL[level];

  return (
    <div
      className="flex-1 min-w-[110px] flex flex-col justify-center px-3 py-2"
      style={{
        borderRight: isLast ? 'none' : '1px solid #1E3A5F',
      }}
    >
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap mb-0.5">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="text-[17px] font-mono font-bold leading-none"
          style={{
            color: valueColor,
            textShadow: level === 'critical' ? `0 0 8px ${valueColor}88` : 'none',
          }}
        >
          {formattedValue}
        </span>
        <span className="text-[10px] text-slate-500 whitespace-nowrap">{unit}</span>
      </div>
      {/* Progress bar */}
      <div className="h-[2px] bg-[#1E3A5F] rounded-full mt-1.5 w-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.min(100, Math.max(0, barPercent))}%`, background: barColor }}
        />
      </div>
      <div
        className="text-[9px] font-semibold mt-0.5 uppercase tracking-wider"
        style={{ color: level === 'good' ? '#22C55E66' : valueColor }}
      >
        {labelText}
      </div>
    </div>
  );
}

// Main -------------------------------------------------------------------
export function AssetKPIBar() {
  const state   = useDashboardStore((s) => s.simulationState);
  const pue     = state.derivedMetrics.pue;
  const wue     = state.derivedMetrics.wue;
  const gpuTemp = state.layers.gpu.averageGpuTemperature;
  const gpuUtil = state.layers.gpu.gpuUtilizationRate * 100;
  const latency = state.layers.workload.averageInferenceLatency;
  const carbon  = state.derivedMetrics.carbonOutputKgPerHr;

  return (
    <div
      className="flex-shrink-0 flex items-stretch overflow-x-auto"
      style={{ background: '#111827', borderBottom: '1px solid #1E3A5F', height: 72 }}
    >
      {/* Asset Nameplate */}
      <div
        className="flex items-center gap-3 px-4 flex-shrink-0"
        style={{ minWidth: 200, borderRight: '1px solid #1E3A5F' }}
      >
        <div>
          <div className="text-white font-mono font-bold text-sm tracking-tight">DC-001</div>
          <div className="flex gap-1 mt-0.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ background: '#1E3A5F', color: '#7DD3FC' }}>240× H100</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ background: '#1E293B', color: '#94A3B8' }}>10 Racks</span>
          </div>
          <div className="text-[9px] text-slate-600 mt-0.5">Umatilla County, Oregon, USA</div>
        </div>
      </div>

      {/* KPI Tiles */}
      <KPITile
        label="PUE"
        formattedValue={pue.toFixed(2)}
        unit="ratio"
        level={getLevel(pue, { good: 1.3, monitor: 1.5, warn: 1.8 }, true)}
        barPercent={(pue - 1) / (2.0 - 1) * 100}
      />
      <KPITile
        label="WUE"
        formattedValue={wue.toFixed(2)}
        unit="L/kWh"
        level={getLevel(wue, { good: 1.5, monitor: 2.0, warn: 2.5 }, true)}
        barPercent={wue / 3.0 * 100}
      />
      <KPITile
        label="GPU Temp"
        formattedValue={gpuTemp.toFixed(1)}
        unit="°C"
        level={getLevel(gpuTemp, { good: 72, monitor: 78, warn: 83 }, true)}
        barPercent={(gpuTemp - 40) / (95 - 40) * 100}
      />
      <KPITile
        label="GPU Util"
        formattedValue={gpuUtil.toFixed(0)}
        unit="%"
        level={getLevel(gpuUtil, { good: 70, monitor: 50, warn: 30 }, false)}
        barPercent={gpuUtil}
      />
      <KPITile
        label="Latency"
        formattedValue={latency.toFixed(0)}
        unit="ms"
        level={getLevel(latency, { good: 100, monitor: 150, warn: 200 }, true)}
        barPercent={latency / 300 * 100}
      />
      <KPITile
        label="Carbon"
        formattedValue={carbon.toFixed(0)}
        unit="kg/hr"
        level={getLevel(carbon, { good: 150, monitor: 250, warn: 400 }, true)}
        barPercent={carbon / 500 * 100}
        isLast
      />
    </div>
  );
}
