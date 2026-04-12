import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SensorRowProps {
  label: string;
  value: number;
  unit: string;
  status: string;
  history: number[];
  isBoolean?: boolean;
  criticalLimit?: number;
}

const STATUS_DOT: Record<string, string>    = { healthy: '#22C55E', warning: '#FACC15', critical: '#F87171' };
const STATUS_STROKE: Record<string, string> = { healthy: '#22C55E', warning: '#EAB308', critical: '#EF4444' };
const STATUS_VALUE: Record<string, string>  = { healthy: '#E2E8F0', warning: '#FDE68A', critical: '#FCA5A5' };

export function SensorRow({ label, value, unit, status, history, isBoolean, criticalLimit }: SensorRowProps) {
  const dotColor    = STATUS_DOT[status]    ?? STATUS_DOT.healthy;
  const strokeColor = STATUS_STROKE[status] ?? STATUS_STROKE.healthy;
  const valueColor  = STATUS_VALUE[status]  ?? STATUS_VALUE.healthy;

  // Trend arrow
  const trend = history.length >= 4 ? history[history.length - 1] - history[history.length - 4] : 0;
  const trendIcon  = trend > 0.5 ? '↑' : trend < -0.5 ? '↓' : '—';
  const trendColor = trend > 0.5 && status !== 'healthy' ? '#FB923C'
                   : trend < -0.5                         ? '#38BDF8'
                   : '#334155';

  // Mini bar fill
  const barPercent = criticalLimit ? Math.min(100, (value / criticalLimit) * 100) : 0;

  // Formatted value
  const displayValue = isBoolean
    ? null
    : (typeof value === 'number' && value < 1 && value > 0)
      ? (value * 100).toFixed(1)
      : (typeof value === 'number' && value % 1 !== 0)
        ? value.toFixed(2)
        : String(Math.round(value));

  return (
    <div
      className="flex items-center gap-2 px-3 py-[5px] hover:bg-[#1a2235] transition-colors cursor-default group"
      style={{ borderBottom: '1px solid #0F172A' }}
    >
      {/* Status dot */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: dotColor, boxShadow: status !== 'healthy' ? `0 0 4px ${dotColor}` : 'none' }}
      />

      {/* Metric label */}
      <span className="text-[11px] text-slate-400 flex-1 truncate group-hover:text-slate-200 transition-colors">
        {label}
      </span>

      {/* Trend */}
      <span className="text-[10px] font-mono w-3 text-center flex-shrink-0" style={{ color: trendColor }}>
        {trendIcon}
      </span>

      {/* Value */}
      {isBoolean ? (
        <span className="text-[11px] font-mono font-semibold w-14 text-right" style={{ color: value ? '#4ADE80' : '#475569' }}>
          {value ? 'ON' : 'OFF'}
        </span>
      ) : (
        <span
          className="text-[12px] font-mono font-semibold w-16 text-right tabular-nums transition-colors duration-200"
          style={{ color: valueColor }}
        >
          {displayValue}
        </span>
      )}

      {/* Unit */}
      <span className="text-[10px] text-slate-600 w-10 text-right flex-shrink-0 truncate">{unit}</span>

      {/* Mini fill bar */}
      {criticalLimit ? (
        <div className="w-8 h-[3px] rounded-full overflow-hidden flex-shrink-0" style={{ background: '#1E3A5F' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${barPercent}%`, background: strokeColor, transition: 'width 0.4s ease-out' }}
          />
        </div>
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      {/* Sparkline */}
      {history.length > 1 ? (
        <div className="w-14 h-6 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history.slice(-60).map((v) => ({ v }))}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={strokeColor}
                dot={false}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-14 flex-shrink-0" />
      )}
    </div>
  );
}
