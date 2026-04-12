import { useDashboardStore } from '../store/useDashboardStore';
import {
  POWER_THRESHOLDS,
  COOLING_THRESHOLDS,
  GPU_THRESHOLDS,
  WORKLOAD_THRESHOLDS,
  LOCATION_THRESHOLDS,
} from '@izakaya/shared';
import type { ThresholdRange, Alert, Recommendation } from '@izakaya/shared';
import { SensorRow } from './SensorRow';
import { RecommendationCard } from './AlertPanel';

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

const LAYER_CONFIG: Record<string, {
  label: string;
  description: string;
  thresholds: Record<string, ThresholdRange>;
  metrics: Array<{ id: string; label: string; unit: string; criticalLimit?: number }>;
}> = {
  power: {
    label: 'Power',
    description: 'PDU cabinets distributing power across the facility',
    thresholds: POWER_THRESHOLDS,
    metrics: [
      { id: 'totalFacilityPower', label: 'Total Facility Power', unit: 'kW', criticalLimit: 1200 },
      { id: 'itEquipmentPower', label: 'IT Equipment Power', unit: 'kW', criticalLimit: 900 },
      { id: 'coolingPower', label: 'Cooling Power', unit: 'kW' },
      { id: 'pue', label: 'PUE', unit: '', criticalLimit: 2.0 },
      { id: 'gridCarbonIntensity', label: 'Grid Carbon Intensity', unit: 'gCO\u2082/kWh', criticalLimit: 600 },
      { id: 'renewableEnergyFraction', label: 'Renewable Fraction', unit: '%' },
    ],
  },
  cooling: {
    label: 'Cooling',
    description: 'Evaporative cooling towers managing thermal load',
    thresholds: COOLING_THRESHOLDS,
    metrics: [
      { id: 'coolingSetpoint', label: 'Cooling Setpoint', unit: '\u00b0C' },
      { id: 'waterUsageRate', label: 'Water Usage Rate', unit: 'L/hr', criticalLimit: 1500 },
      { id: 'wue', label: 'WUE', unit: 'L/kWh', criticalLimit: 2.5 },
      { id: 'ambientTemperature', label: 'Ambient Temperature', unit: '\u00b0C', criticalLimit: 45 },
      { id: 'coolantSupplyTemperature', label: 'Coolant Supply Temp', unit: '\u00b0C', criticalLimit: 30 },
    ],
  },
  gpu: {
    label: 'GPU Fleet',
    description: '10 racks \u00d7 24 NVIDIA H100 GPUs',
    thresholds: GPU_THRESHOLDS,
    metrics: [
      { id: 'averageGpuTemperature', label: 'Avg GPU Temperature', unit: '\u00b0C', criticalLimit: 95 },
      { id: 'gpuUtilizationRate', label: 'GPU Utilization', unit: '%' },
      { id: 'activeGpuCount', label: 'Active GPUs', unit: '' },
      { id: 'gpuIdlePowerWaste', label: 'Idle Power Waste', unit: 'kW', criticalLimit: 80 },
      { id: 'hardwareFailureRate', label: 'HW Failure Rate', unit: '/day' },
    ],
  },
  workload: {
    label: 'Workload',
    description: 'Inference request ingress, processing, and egress',
    thresholds: WORKLOAD_THRESHOLDS,
    metrics: [
      { id: 'requestVolume', label: 'Request Volume', unit: 'req/hr', criticalLimit: 16000 },
      { id: 'averageInferenceLatency', label: 'Inference Latency', unit: 'ms', criticalLimit: 300 },
      { id: 'queueDepth', label: 'Queue Depth', unit: '', criticalLimit: 300 },
      { id: 'requestDropRate', label: 'Drop Rate', unit: '%' },
      { id: 'batchEfficiency', label: 'Batch Efficiency', unit: '%' },
    ],
  },
  location: {
    label: 'Location',
    description: 'Umatilla County, Oregon \u2014 environmental conditions',
    thresholds: LOCATION_THRESHOLDS,
    metrics: [
      { id: 'ambientTemperature', label: 'Ambient Temperature', unit: '\u00b0C', criticalLimit: 45 },
      { id: 'gridCarbonIntensity', label: 'Grid Carbon Intensity', unit: 'gCO\u2082/kWh' },
      { id: 'renewableEnergyFraction', label: 'Renewable Fraction', unit: '%' },
      { id: 'waterStressIndex', label: 'Water Stress Index', unit: '', criticalLimit: 1.0 },
      { id: 'localAirQualityIndex', label: 'Air Quality Index', unit: 'AQI', criticalLimit: 200 },
    ],
  },
};

export function ComponentDetailPanel() {
  const selectedComponent = useDashboardStore((s) => s.selectedHealthComponent);
  const layers = useDashboardStore((s) => s.simulationState.layers);
  const alerts = useDashboardStore((s) => s.simulationState.activeAlerts);
  const recs = useDashboardStore((s) => s.simulationState.activeRecommendations);
  const history = useDashboardStore((s) => s.metricHistory);
  const setSelected = useDashboardStore((s) => s.setSelectedHealthComponent);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);
  const acknowledgeAlert = useDashboardStore((s) => s.acknowledgeAlert);

  if (!selectedComponent) return null;

  const config = LAYER_CONFIG[selectedComponent];
  if (!config) return null;

  const layerState = (layers as unknown as Record<string, Record<string, unknown>>)[selectedComponent] || {};
  const layerHealth = (layerState.health as string) || 'healthy';

  const layerAlerts = alerts.filter((a: Alert) => a.layerId === selectedComponent);
  const layerRecs = recs.filter((r: Recommendation) => r.layerAffected === selectedComponent && r.status === 'active');

  const dotColor = layerHealth === 'healthy' ? 'bg-green-500'
    : layerHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="border-b border-[#2d3148] overflow-y-auto max-h-[55vh]">
      {/* Header — matches SensorPanel group header style */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e2133] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">{config.label}</span>
          <span className="text-[10px] text-slate-600">{config.description}</span>
        </div>
        <button
          onClick={() => setSelected(null)}
          className="text-slate-500 hover:text-white text-sm leading-none px-1"
        >
          &times;
        </button>
      </div>

      {/* Sensor rows — reusing exact SensorRow component */}
      {config.metrics.map((metric) => {
        const rawVal = layerState[metric.id];
        const value = typeof rawVal === 'number' ? rawVal : 0;
        const threshold = config.thresholds[metric.id];
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
            criticalLimit={metric.criticalLimit}
          />
        );
      })}

      {/* Alerts for this layer */}
      {layerAlerts.length > 0 && (
        <div className="px-3 py-2 border-t border-[#2d3148]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              Active Alerts
            </span>
            <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 leading-tight">
              {layerAlerts.length}
            </span>
          </div>
          {layerAlerts.map((alert: Alert) => {
            const isCritical = alert.severity === 'critical';
            const severityBorder = isCritical ? 'border-red-500' : 'border-orange-500';
            const severityDot = isCritical ? 'bg-red-500' : 'bg-orange-500';
            const severityBadge = isCritical ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300';

            return (
              <div key={alert.id} className={`border-l-2 ${severityBorder} bg-[#252840] rounded-r-md mb-1 ${alert.acknowledged ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${severityDot}`} />
                    <span className="text-sm text-white truncate">{alert.metricName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${severityBadge}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-[10px] text-slate-500 hover:text-slate-300 border border-[#3d4168] rounded px-2 py-0.5 flex-shrink-0 ml-2"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400 px-3 pb-2">{alert.message}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations for this layer */}
      {layerRecs.length > 0 && (
        <div className="px-3 py-2 border-t border-[#2d3148]">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
            Recommendations
          </div>
          {layerRecs.map((rec: Recommendation) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}

      {/* Footer action */}
      <div className="px-3 py-2 border-t border-[#2d3148]">
        {layerAlerts.length > 0 || layerRecs.length > 0 ? (
          <button
            onClick={() => setActiveTab('controls')}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            &rarr; View {config.label.toLowerCase()} controls
          </button>
        ) : (
          <span className="text-[11px] text-slate-600">All metrics within healthy range</span>
        )}
      </div>
    </div>
  );
}
