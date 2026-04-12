import type { SimulationState, Alert } from '@izakaya/shared';
import { LAYER_THRESHOLDS } from '@izakaya/shared';
import { v4 as uuid } from 'uuid';
import { publishCriticalAlertEvent } from '../aws/eventBridgePublisher';
import { persistCriticalAlertToS3 } from '../aws/s3AuditLogger';
import { emitCriticalAlertMetric } from '../aws/cloudWatchEmitter';

interface MetricCheck {
  layerId: string;
  metricId: string;
  metricName: string;
  getValue: (state: SimulationState) => number;
}

const METRIC_CHECKS: MetricCheck[] = [
  // Power
  { layerId: 'power', metricId: 'totalFacilityPower', metricName: 'Total Facility Power', getValue: s => s.layers.power.totalFacilityPower },
  { layerId: 'power', metricId: 'pue', metricName: 'Power Usage Effectiveness', getValue: s => s.layers.power.pue },
  { layerId: 'power', metricId: 'gridCarbonIntensity', metricName: 'Grid Carbon Intensity', getValue: s => s.layers.power.gridCarbonIntensity },
  // Cooling
  { layerId: 'cooling', metricId: 'wue', metricName: 'Water Usage Effectiveness', getValue: s => s.layers.cooling.wue },
  { layerId: 'cooling', metricId: 'waterUsageRate', metricName: 'Water Usage Rate', getValue: s => s.layers.cooling.waterUsageRate },
  { layerId: 'cooling', metricId: 'ambientTemperature', metricName: 'Ambient Temperature', getValue: s => s.layers.cooling.ambientTemperature },
  { layerId: 'cooling', metricId: 'coolantSupplyTemperature', metricName: 'Coolant Supply Temperature', getValue: s => s.layers.cooling.coolantSupplyTemperature },
  // GPU
  { layerId: 'gpu', metricId: 'averageGpuTemperature', metricName: 'Average GPU Temperature', getValue: s => s.layers.gpu.averageGpuTemperature },
  { layerId: 'gpu', metricId: 'gpuUtilizationRate', metricName: 'GPU Utilization Rate', getValue: s => s.layers.gpu.gpuUtilizationRate },
  { layerId: 'gpu', metricId: 'activeGpuCount', metricName: 'Active GPU Count', getValue: s => s.layers.gpu.activeGpuCount },
  { layerId: 'gpu', metricId: 'hardwareFailureRate', metricName: 'Hardware Failure Rate', getValue: s => s.layers.gpu.hardwareFailureRate },
  // Workload
  { layerId: 'workload', metricId: 'averageInferenceLatency', metricName: 'Average Inference Latency', getValue: s => s.layers.workload.averageInferenceLatency },
  { layerId: 'workload', metricId: 'requestDropRate', metricName: 'Request Drop Rate', getValue: s => s.layers.workload.requestDropRate },
  { layerId: 'workload', metricId: 'queueDepth', metricName: 'Queue Depth', getValue: s => s.layers.workload.queueDepth },
  // Location
  { layerId: 'location', metricId: 'waterStressIndex', metricName: 'Water Stress Index', getValue: s => s.layers.location.waterStressIndex },
  { layerId: 'location', metricId: 'localAirQualityIndex', metricName: 'Local Air Quality Index', getValue: s => s.layers.location.localAirQualityIndex },
];

export function evaluateAlerts(
  state: SimulationState,
  alertHistory: Alert[],
  broadcast: (event: string, data: unknown) => void,
): void {
  const now = state.timestamp;

  for (const check of METRIC_CHECKS) {
    const thresholds = LAYER_THRESHOLDS[check.layerId]?.[check.metricId];
    if (!thresholds) continue;

    const value = check.getValue(state);
    let severity: 'warning' | 'critical' | null = null;
    let threshold: number;
    let direction: 'above' | 'below';

    if (thresholds.higherIsWorse) {
      if (value > thresholds.warningMax) {
        severity = 'critical';
        threshold = thresholds.warningMax;
        direction = 'above';
      } else if (value > thresholds.healthyMax) {
        severity = 'warning';
        threshold = thresholds.healthyMax;
        direction = 'above';
      } else {
        // Healthy — resolve any existing alerts
        resolveAlerts(state, check.layerId, check.metricId);
        continue;
      }
    } else {
      if (value < thresholds.warningMin) {
        severity = 'critical';
        threshold = thresholds.warningMin;
        direction = 'below';
      } else if (value < thresholds.healthyMin) {
        severity = 'warning';
        threshold = thresholds.healthyMin;
        direction = 'below';
      } else {
        resolveAlerts(state, check.layerId, check.metricId);
        continue;
      }
    }

    // Check deduplication
    const existing = state.activeAlerts.find(
      a => a.metricId === check.metricId && a.layerId === check.layerId && a.severity === severity,
    );
    if (existing) {
      // Update current value
      existing.currentValue = value;
      continue;
    }

    // Remove lesser severity alert if upgrading
    const lesserIdx = state.activeAlerts.findIndex(
      a => a.metricId === check.metricId && a.layerId === check.layerId,
    );
    if (lesserIdx >= 0) {
      state.activeAlerts.splice(lesserIdx, 1);
    }

    const alert: Alert = {
      id: uuid(),
      timestamp: now,
      severity: severity!,
      layerId: check.layerId,
      metricId: check.metricId,
      metricName: check.metricName,
      currentValue: value,
      threshold: threshold!,
      thresholdDirection: direction!,
      message: `${check.metricName} is ${direction!} ${threshold!} (current: ${Math.round(value * 100) / 100})`,
      acknowledged: false,
    };

    state.activeAlerts.push(alert);
    alertHistory.push(alert);
    broadcast('alert:new', alert);

    // AWS: fire-and-forget for critical alerts
    if (alert.severity === 'critical') {
      publishCriticalAlertEvent(alert, state).catch(() => {});
      persistCriticalAlertToS3(alert).catch(() => {});
      emitCriticalAlertMetric(alert.layerId, alert.metricId).catch(() => {});
    }
  }
}

function resolveAlerts(state: SimulationState, layerId: string, metricId: string): void {
  state.activeAlerts = state.activeAlerts.filter(
    a => !(a.layerId === layerId && a.metricId === metricId),
  );
}
