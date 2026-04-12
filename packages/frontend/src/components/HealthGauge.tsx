export function HealthGauge({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const stroke = 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#2d3148" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s' }}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.28} fontWeight="bold"
        fontFamily="var(--font-mono)"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}

export function computeOverallHealth(state: {
  layers: {
    power: { pue: number };
    cooling: { wue: number };
    gpu: { averageGpuTemperature: number };
    workload: { averageInferenceLatency: number };
    location: { waterStressIndex: number };
  };
}): number {
  const layers = state.layers;
  const scores: number[] = [];
  scores.push(Math.max(0, Math.min(100, 100 - (layers.power.pue - 1.0) * 100)));
  scores.push(Math.max(0, Math.min(100, 100 - layers.cooling.wue * 33)));
  scores.push(Math.max(0, Math.min(100, 100 - Math.max(0, layers.gpu.averageGpuTemperature - 60) * 2.85)));
  scores.push(Math.max(0, Math.min(100, 100 - Math.max(0, layers.workload.averageInferenceLatency - 45) * 0.22)));
  scores.push(Math.max(0, Math.min(100, 100 - layers.location.waterStressIndex * 100)));
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
