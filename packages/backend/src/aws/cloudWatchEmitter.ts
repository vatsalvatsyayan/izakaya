import { CloudWatchClient, PutMetricDataCommand, type MetricDatum } from '@aws-sdk/client-cloudwatch';
import type { SimulationState, ChangeLogEntry } from '@izakaya/shared';

function cwClient() { return new CloudWatchClient({ region: process.env.AWS_REGION || 'us-east-1' }); }
function NAMESPACE() { return process.env.CLOUDWATCH_NAMESPACE || 'DigitalTwin/Sustainability'; }
function REGION_DIMENSION() { return process.env.FACILITY_REGION || 'Oregon-USA'; }

let ticksSinceLastEmit = 0;

function isEnabled(): boolean {
  return process.env.AWS_INTEGRATION_ENABLED === 'true';
}

/**
 * Emit facility health metrics every 10 ticks (~20 seconds real-time).
 * Called on every simulation tick.
 */
export async function emitFacilityMetrics(state: SimulationState): Promise<void> {
  if (!isEnabled()) return;

  ticksSinceLastEmit++;
  if (ticksSinceLastEmit < 10) return;
  ticksSinceLastEmit = 0;

  const regionDim = [{ Name: 'Region', Value: REGION_DIMENSION() }];
  const timestamp = new Date();

  const metrics: MetricDatum[] = [
    { MetricName: 'CarbonOutputKgPerHr', Value: state.derivedMetrics.carbonOutputKgPerHr, Dimensions: regionDim, Timestamp: timestamp },
    { MetricName: 'WaterUsageRateLitersPerHr', Value: state.layers.cooling.waterUsageRate, Dimensions: regionDim, Timestamp: timestamp },
    { MetricName: 'PUE', Value: state.derivedMetrics.pue, Dimensions: regionDim, Timestamp: timestamp },
    { MetricName: 'TotalCarbonEmittedKg', Value: state.derivedMetrics.totalCarbonEmittedKg, Dimensions: regionDim, Timestamp: timestamp },
    { MetricName: 'GPUUtilizationPercent', Value: state.layers.gpu.gpuUtilizationRate * 100, Dimensions: regionDim, Timestamp: timestamp },
    { MetricName: 'AverageGPUTemperature', Value: state.layers.gpu.averageGpuTemperature, Dimensions: regionDim, Timestamp: timestamp },
  ];

  try {
    await cwClient().send(new PutMetricDataCommand({ Namespace: NAMESPACE(), MetricData: metrics }));
    console.log('[CloudWatch] Facility metrics emitted');
  } catch (err) {
    console.error('[CloudWatch] Failed to emit facility metrics (non-fatal):', err);
  }
}

/**
 * Emit a metric when an operator commits an action.
 */
export async function emitActionCommitMetric(entry: ChangeLogEntry): Promise<void> {
  if (!isEnabled()) return;

  try {
    await cwClient().send(new PutMetricDataCommand({
      Namespace: NAMESPACE(),
      MetricData: [{
        MetricName: 'EthicalActionsCommitted',
        Value: 1,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Layer', Value: entry.layerId },
          { Name: 'Lever', Value: entry.leverId },
        ],
        Timestamp: new Date(),
      }],
    }));
  } catch (err) {
    console.error('[CloudWatch] Action commit metric failed (non-fatal):', err);
  }
}

/**
 * Emit a metric when a critical alert fires.
 */
export async function emitCriticalAlertMetric(layerId: string, metricId: string): Promise<void> {
  if (!isEnabled()) return;

  try {
    await cwClient().send(new PutMetricDataCommand({
      Namespace: NAMESPACE(),
      MetricData: [{
        MetricName: 'CriticalAlertsTriggered',
        Value: 1,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Layer', Value: layerId },
          { Name: 'MetricId', Value: metricId },
        ],
        Timestamp: new Date(),
      }],
    }));
  } catch (err) {
    console.error('[CloudWatch] Critical alert metric failed (non-fatal):', err);
  }
}

/**
 * Emit a metric when a recommendation is dismissed.
 */
export async function emitRecommendationDismissedMetric(layerId: string, severity: string): Promise<void> {
  if (!isEnabled()) return;

  try {
    await cwClient().send(new PutMetricDataCommand({
      Namespace: NAMESPACE(),
      MetricData: [{
        MetricName: 'RecommendationsDismissed',
        Value: 1,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Layer', Value: layerId },
          { Name: 'Severity', Value: severity },
        ],
        Timestamp: new Date(),
      }],
    }));
  } catch (err) {
    console.error('[CloudWatch] Recommendation dismissed metric failed (non-fatal):', err);
  }
}
