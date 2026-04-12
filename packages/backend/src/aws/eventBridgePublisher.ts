import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import type { Alert, SimulationState } from '@izakaya/shared';

function ebClient() { return new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' }); }

function isEnabled(): boolean {
  return process.env.AWS_INTEGRATION_ENABLED === 'true';
}

/**
 * Publish a critical alert event to EventBridge.
 * EventBridge routes this to the SNS topic → email/SMS to operator.
 */
export async function publishCriticalAlertEvent(
  alert: Alert,
  state: SimulationState,
): Promise<void> {
  if (!isEnabled()) return;

  const detail = {
    alertId: alert.id,
    severity: alert.severity,
    layerId: alert.layerId,
    metricId: alert.metricId,
    metricName: alert.metricName,
    currentValue: alert.currentValue,
    threshold: alert.threshold,
    message: alert.message,
    timestamp: alert.timestamp,
    facilityContext: {
      region: state.layers.location.region,
      communityName: state.layers.location.communityName,
      waterStressIndex: state.layers.location.waterStressIndex,
      currentCarbonOutput: state.derivedMetrics.carbonOutputKgPerHr,
      currentPUE: state.derivedMetrics.pue,
      activeScenario: state.activeScenario,
    },
    humanReadableSummary: buildAlertEmailBody(alert, state),
  };

  try {
    await ebClient().send(new PutEventsCommand({
      Entries: [{
        EventBusName: process.env.EVENTBRIDGE_BUS_NAME || 'digital-twin-events',
        Source: 'digital-twin.sustainability',
        DetailType: 'CriticalAlertFired',
        Detail: JSON.stringify(detail),
        Time: new Date(),
      }],
    }));
    console.log(`[EventBridge] Critical alert published: ${alert.id} (${alert.metricName})`);
  } catch (err) {
    console.error('[EventBridge] Failed to publish event (non-fatal):', err);
  }
}

function buildAlertEmailBody(alert: Alert, state: SimulationState): string {
  return `CRITICAL ALERT — AI Factory Digital Twin
Facility: ${state.layers.location.region} (${state.layers.location.communityName})
Time: ${alert.timestamp}

ALERT: ${alert.message}
Metric: ${alert.metricName} = ${alert.currentValue} (threshold: ${alert.threshold})
Layer: ${alert.layerId.toUpperCase()}

Current facility state:
  PUE: ${state.derivedMetrics.pue.toFixed(2)}
  Carbon output: ${state.derivedMetrics.carbonOutputKgPerHr.toFixed(1)} kgCO2/hr
  Water usage: ${state.layers.cooling.waterUsageRate} L/hr
  Community water stress: ${state.layers.location.waterStressIndex}
  Active scenario: ${state.activeScenario || 'None'}

Action required: Open the dashboard immediately to assess and respond.
Dashboard URL: ${process.env.DASHBOARD_URL || 'http://localhost:5173'}

This notification was sent via AWS EventBridge + SNS.`.trim();
}
