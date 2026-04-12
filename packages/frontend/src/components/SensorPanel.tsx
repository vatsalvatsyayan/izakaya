import { useDashboardStore } from '../store/useDashboardStore';
import {
  POWER_THRESHOLDS,
  COOLING_THRESHOLDS,
  GPU_THRESHOLDS,
  WORKLOAD_THRESHOLDS,
  LOCATION_THRESHOLDS,
} from '@izakaya/shared';
import type { ThresholdRange } from '@izakaya/shared';
import { SensorRow } from './SensorRow';

function getHealthStatus(value: number, threshold: ThresholdRange | undefined): string {
  if (!threshold) return 'healthy';
  if (threshold.higherIsWorse) {
    if (value <= threshold.healthyMax) return 'healthy';
    if (value <= threshold.warningMax) return 'warning';
    return 'critical';
  } else {
    if (value >= threshold.healthyMin) return 'healthy';
    if (value >= threshold.warningMin) return 'warning';
    return 'critical';
  }
}

const SENSOR_GROUPS = [
  {
    label: 'Power',
    key: 'power',
    thresholds: POWER_THRESHOLDS,
    metrics: [
      { id: 'totalFacilityPower', label: 'Total Facility Power', unit: 'kW', criticalLimit: 1200 },
      { id: 'itEquipmentPower', label: 'IT Equipment Power', unit: 'kW', criticalLimit: 900 },
      { id: 'coolingPower', label: 'Cooling Power', unit: 'kW' },
      { id: 'pue', label: 'PUE', unit: '', criticalLimit: 2.0 },
      { id: 'gridCarbonIntensity', label: 'Grid Carbon Intensity', unit: 'gCO₂/kWh', criticalLimit: 600 },
      { id: 'renewableEnergyFraction', label: 'Renewable Fraction', unit: '%' },
    ],
  },
  {
    label: 'Cooling',
    key: 'cooling',
    thresholds: COOLING_THRESHOLDS,
    metrics: [
      { id: 'coolingSetpoint', label: 'Cooling Setpoint', unit: '°C' },
      { id: 'waterUsageRate', label: 'Water Usage Rate', unit: 'L/hr', criticalLimit: 1500 },
      { id: 'wue', label: 'WUE', unit: 'L/kWh', criticalLimit: 2.5 },
      { id: 'ambientTemperature', label: 'Ambient Temperature', unit: '°C', criticalLimit: 45 },
      { id: 'coolantSupplyTemperature', label: 'Coolant Supply Temp', unit: '°C', criticalLimit: 30 },
    ],
  },
  {
    label: 'GPU',
    key: 'gpu',
    thresholds: GPU_THRESHOLDS,
    metrics: [
      { id: 'averageGpuTemperature', label: 'Avg GPU Temperature', unit: '°C', criticalLimit: 95 },
      { id: 'gpuUtilizationRate', label: 'GPU Utilization', unit: '%' },
      { id: 'activeGpuCount', label: 'Active GPUs', unit: '' },
      { id: 'gpuIdlePowerWaste', label: 'Idle Power Waste', unit: 'kW', criticalLimit: 80 },
      { id: 'hardwareFailureRate', label: 'HW Failure Rate', unit: '/day' },
    ],
  },
  {
    label: 'Workload',
    key: 'workload',
    thresholds: WORKLOAD_THRESHOLDS,
    metrics: [
      { id: 'requestVolume', label: 'Request Volume', unit: 'req/hr', criticalLimit: 16000 },
      { id: 'averageInferenceLatency', label: 'Inference Latency', unit: 'ms', criticalLimit: 300 },
      { id: 'queueDepth', label: 'Queue Depth', unit: '', criticalLimit: 300 },
      { id: 'requestDropRate', label: 'Drop Rate', unit: '%' },
      { id: 'batchEfficiency', label: 'Batch Efficiency', unit: '%' },
    ],
  },
  {
    label: 'Location',
    key: 'location',
    thresholds: LOCATION_THRESHOLDS,
    metrics: [
      { id: 'ambientTemperature', label: 'Ambient Temperature', unit: '°C', criticalLimit: 45 },
      { id: 'gridCarbonIntensity', label: 'Grid Carbon Intensity', unit: 'gCO₂/kWh' },
      { id: 'renewableEnergyFraction', label: 'Renewable Fraction', unit: '%' },
      { id: 'waterStressIndex', label: 'Water Stress Index', unit: '', criticalLimit: 1.0 },
      { id: 'localAirQualityIndex', label: 'Air Quality Index', unit: 'AQI', criticalLimit: 200 },
    ],
  },
];

export function SensorPanel() {
  const layers = useDashboardStore((s) => s.simulationState.layers);
  const history = useDashboardStore((s) => s.metricHistory);

  return (
    <div className="divide-y divide-[#2d3148]">
      {SENSOR_GROUPS.map((group) => {
        const layerState = ((layers as unknown) as Record<string, Record<string, unknown>>)[group.key] || {};
        const layerHealth = (layerState as { health?: string }).health || 'healthy';
        const dotColor = layerHealth === 'healthy' ? 'bg-green-500'
          : layerHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500';

        return (
          <div key={group.key}>
            {/* Group header */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e2133] sticky top-0 z-10">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{group.label}</span>
            </div>

            {/* Sensor rows */}
            {group.metrics.map((metric) => {
              const rawVal = layerState[metric.id];
              const value = typeof rawVal === 'number' ? rawVal : 0;
              const threshold = group.thresholds[metric.id];
              const status = getHealthStatus(value, threshold);
              const hist = history[metric.id] || [];

              return (
                <SensorRow
                  key={metric.id}
                  label={metric.label}
                  value={value}
                  unit={metric.unit}
                  status={status}
                  history={hist}
                  criticalLimit={(metric as { criticalLimit?: number }).criticalLimit}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
