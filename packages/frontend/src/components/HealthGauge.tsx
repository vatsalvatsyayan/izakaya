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

/**
 * Threshold-based metric scoring:
 * - Value in healthy range → 100
 * - Value in warning range → linearly 100 → 50
 * - Value in critical range → linearly 50 → 0
 */
function metricScore(value: number, healthyBound: number, warningBound: number, criticalBound: number, higherIsWorse: boolean): number {
  if (higherIsWorse) {
    if (value <= healthyBound) return 100;
    if (value <= warningBound) return 100 - ((value - healthyBound) / (warningBound - healthyBound)) * 50;
    if (value <= criticalBound) return 50 - ((value - warningBound) / (criticalBound - warningBound)) * 50;
    return 0;
  } else {
    if (value >= healthyBound) return 100;
    if (value >= warningBound) return 100 - ((healthyBound - value) / (healthyBound - warningBound)) * 50;
    if (value >= criticalBound) return 50 - ((warningBound - value) / (warningBound - criticalBound)) * 50;
    return 0;
  }
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
  // PUE: healthy ≤1.3, warning ≤1.5, critical >1.5 (higherIsWorse)
  scores.push(metricScore(layers.power.pue, 1.3, 1.5, 2.0, true));
  // WUE: healthy ≤1.0, warning ≤1.8, critical >1.8 (higherIsWorse)
  scores.push(metricScore(layers.cooling.wue, 1.0, 1.8, 3.0, true));
  // GPU Temp: healthy ≤72, warning ≤83, critical >83 (higherIsWorse)
  scores.push(metricScore(layers.gpu.averageGpuTemperature, 72, 83, 95, true));
  // Latency: healthy ≤100, warning ≤200, critical >200 (higherIsWorse)
  scores.push(metricScore(layers.workload.averageInferenceLatency, 100, 200, 400, true));
  // Water Stress: healthy ≤0.3, warning ≤0.6, critical >0.6 (higherIsWorse)
  scores.push(metricScore(layers.location.waterStressIndex, 0.3, 0.6, 1.0, true));
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
