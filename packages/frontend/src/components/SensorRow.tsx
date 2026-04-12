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

export function SensorRow({ label, value, unit, status, history, isBoolean, criticalLimit }: SensorRowProps) {
  const statusDot = status === 'healthy' ? 'bg-green-500'
    : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500';
  const statusStroke = status === 'healthy' ? '#22c55e'
    : status === 'warning' ? '#eab308' : '#ef4444';

  const trend = history.length >= 4
    ? history[history.length - 1] - history[history.length - 4]
    : 0;
  const trendIcon = trend > 0.5 ? '↑' : trend < -0.5 ? '↓' : '→';
  const trendColor = (trend > 0.5 && status !== 'healthy') ? 'text-orange-400'
    : trend < -0.5 ? 'text-slate-500' : 'text-slate-700';

  const barPercent = criticalLimit ? Math.min(100, (value / criticalLimit) * 100) : 0;

  const displayValue = isBoolean
    ? null
    : (typeof value === 'number' && value < 1 && value > 0)
      ? (value * 100).toFixed(1)
      : (typeof value === 'number' && value % 1 !== 0)
        ? value.toFixed(2)
        : String(Math.round(value));

  return (
    <div className="flex items-center gap-2 px-3 py-1 hover:bg-[#252840] transition-colors cursor-default">
      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${statusDot}`} />
      <span className="text-[11px] text-slate-300 flex-1 truncate">{label}</span>
      <span className={`text-[11px] ${trendColor}`}>{trendIcon}</span>
      {isBoolean ? (
        <span className={`text-xs font-mono ${value ? 'text-green-400' : 'text-slate-500'}`}>
          {value ? 'ON' : 'OFF'}
        </span>
      ) : (
        <span className="text-xs font-mono text-slate-200 text-right w-16 tabular-nums">
          {displayValue}
        </span>
      )}
      <span className="text-[10px] text-slate-500 w-10 text-right flex-shrink-0">{unit}</span>
      {criticalLimit && (
        <div className="w-10 h-[3px] bg-[#252840] rounded-full overflow-hidden flex-shrink-0">
          <div className="h-full rounded-full" style={{ width: `${barPercent}%`, backgroundColor: statusStroke }} />
        </div>
      )}
      {history.length > 1 && (
        <div className="w-12 h-6 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history.slice(-60).map((v) => ({ v }))}>
              <Line type="monotone" dataKey="v" stroke={statusStroke}
                dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
