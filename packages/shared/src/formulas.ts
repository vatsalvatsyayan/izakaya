import type { HealthStatus, LocationLayerState, CommunityBurden } from './types';
import type { ThresholdRange } from './constants';
import { BASE_COOLING_POWER, BASE_INFERENCE_LATENCY, GPU_TDP } from './constants';

/**
 * PUE = totalFacilityPower / itEquipmentPower
 * Clamped to minimum 1.0 (physically impossible to be lower).
 */
export function computePUE(totalFacilityPower: number, itEquipmentPower: number): number {
  if (itEquipmentPower <= 0) return 1.0;
  return Math.max(1.0, totalFacilityPower / itEquipmentPower);
}

/**
 * WUE = waterUsageRate / itEquipmentPower
 * Unit: L/kWh. waterUsageRate is L/hr, itEquipmentPower is kW.
 * Clamped to minimum 0.
 */
export function computeWUE(waterUsageRate: number, itEquipmentPower: number): number {
  if (itEquipmentPower <= 0) return 0;
  return Math.max(0, waterUsageRate / itEquipmentPower);
}

/**
 * CUE = (totalFacilityPower × gridCarbonIntensity) / (itEquipmentPower × 1000)
 * Unit: kgCO2/kWh (the ×1000 converts gCO2 to kgCO2).
 * Clamped to minimum 0.
 */
export function computeCUE(
  totalFacilityPower: number,
  itEquipmentPower: number,
  gridCarbonIntensity: number,
): number {
  if (itEquipmentPower <= 0) return 0;
  return Math.max(0, (totalFacilityPower * gridCarbonIntensity) / (itEquipmentPower * 1000));
}

/**
 * Carbon output per interval.
 * carbonOutput = totalFacilityPower × gridCarbonIntensity × timeIntervalHours / 1000
 * Unit: kgCO2.
 */
export function computeCarbonOutput(
  totalFacilityPower: number,
  gridCarbonIntensity: number,
  timeIntervalHours: number,
): number {
  return Math.max(0, (totalFacilityPower * gridCarbonIntensity * timeIntervalHours) / 1000);
}

/**
 * GPU idle power waste = (1 - gpuUtilization) × GPU_TDP × activeGpuCount / 1000
 * Unit: kW.
 */
export function computeGpuIdlePowerWaste(
  gpuUtilization: number,
  activeGpuCount: number,
): number {
  return Math.max(0, (1 - gpuUtilization) * GPU_TDP * activeGpuCount / 1000);
}

/**
 * Inference latency model:
 *   baseLatency = 45 ms
 *   temperaturePenalty = max(0, (avgGpuTemp - 72) × 2.5)
 *   queuePenalty = queueDepth × 0.8
 *   batchPenalty = (batchSize - 1) × 1.2
 *   total = base + temp + queue + batch
 * Unit: ms. Clamped to minimum BASE_INFERENCE_LATENCY.
 */
export function computeInferenceLatency(
  avgGpuTemp: number,
  queueDepth: number,
  batchSize: number,
): number {
  const temperaturePenalty = Math.max(0, (avgGpuTemp - 72) * 2.5);
  const queuePenalty = queueDepth * 0.8;
  const batchPenalty = (batchSize - 1) * 1.2;
  return Math.max(BASE_INFERENCE_LATENCY, BASE_INFERENCE_LATENCY + temperaturePenalty + queuePenalty + batchPenalty);
}

/**
 * Cooling power model:
 *   coolingPower = baseCoolingPower × (1 + (ambientTemp - 20) × 0.04) × fanSpeedPercent × (waterRecircMode ? 1.15 : 1.0)
 * fanSpeedPercent is 0–1 (not 0–100).
 * Unit: kW.
 */
export function computeCoolingPower(
  baseCoolingPower: number,
  ambientTemp: number,
  fanSpeedPercent: number,
  waterRecircMode: boolean,
): number {
  return Math.max(
    0,
    baseCoolingPower *
      (1 + (ambientTemp - 20) * 0.04) *
      fanSpeedPercent *
      (waterRecircMode ? 1.15 : 1.0),
  );
}

/**
 * Water usage rate model:
 * Derived from cooling power and conditions.
 * waterUsageRate = coolingPower × (1 + (ambientTemp - coolingSetpoint) × 0.03) × (waterRecircMode ? 0.7 : 1.0)
 * The 0.7 multiplier represents 30% water reduction from recirculation.
 * Unit: L/hr.
 */
export function computeWaterUsageRate(
  coolingPower: number,
  coolingSetpoint: number,
  ambientTemp: number,
  waterRecircMode: boolean,
): number {
  return Math.max(
    0,
    coolingPower *
      (1 + (ambientTemp - coolingSetpoint) * 0.03) *
      (waterRecircMode ? 0.7 : 1.0),
  );
}

/**
 * IT equipment power = activeGpuCount × gpuPowerLimit × gpuUtilization / 1000
 * Plus a base load of idle GPUs at 10% TDP.
 * Unit: kW.
 */
export function computeITEquipmentPower(
  activeGpuCount: number,
  gpuPowerLimit: number,
  gpuUtilization: number,
): number {
  const activePower = activeGpuCount * gpuPowerLimit * gpuUtilization / 1000;
  const idlePower = activeGpuCount * gpuPowerLimit * (1 - gpuUtilization) * 0.1 / 1000;
  return Math.max(0, activePower + idlePower);
}

/**
 * Batch efficiency = min(1, (gpuUtilization × 0.5) + (batchSize / 64) × 0.5)
 * Efficiency improves with both utilization and batch size.
 */
export function computeBatchEfficiency(batchSize: number, gpuUtilization: number): number {
  return Math.min(1, Math.max(0, gpuUtilization * 0.5 + (batchSize / 64) * 0.5));
}

/**
 * GPU temperature model:
 *   gpuTemp = coolingSetpoint + (gpuPowerLimit / GPU_TDP) × 40 × gpuUtilization + (ambientTemp - 20) × 0.3
 * Unit: °C.
 */
export function computeGpuTemperature(
  coolingSetpoint: number,
  gpuPowerLimit: number,
  gpuUtilization: number,
  ambientTemp: number,
): number {
  return coolingSetpoint +
    (gpuPowerLimit / GPU_TDP) * 40 * gpuUtilization +
    (ambientTemp - 20) * 0.3;
}

/**
 * Request drop rate model:
 * Requests are dropped when volume exceeds capacity (rate limit and GPU throughput).
 * dropRate = max(0, 1 - (effectiveCapacity / requestVolume))
 * where effectiveCapacity = min(requestRateLimit, activeGpuCount × gpuUtilization × 50)
 * The 50 factor: each active GPU at full utilization can handle ~50 req/hr.
 */
export function computeRequestDropRate(
  requestVolume: number,
  requestRateLimit: number,
  activeGpuCount: number,
  gpuUtilization: number,
): number {
  if (requestVolume <= 0) return 0;
  const gpuCapacity = activeGpuCount * gpuUtilization * 50;
  const effectiveCapacity = Math.min(requestRateLimit, gpuCapacity);
  return Math.max(0, Math.min(1, 1 - effectiveCapacity / requestVolume));
}

/**
 * Queue depth model:
 * queueDepth = max(0, (requestVolume - effectiveThroughput) / 3600 × avgProcessingTimeSec)
 * Simplified: excess requests accumulate in the queue.
 */
export function computeQueueDepth(
  requestVolume: number,
  activeGpuCount: number,
  gpuUtilization: number,
  batchSize: number,
): number {
  const throughputPerGpu = gpuUtilization * 50 * Math.min(batchSize / 16, 2);
  const totalThroughput = activeGpuCount * throughputPerGpu;
  const excessRate = Math.max(0, requestVolume - totalThroughput);
  return Math.max(0, Math.round(excessRate / 360));
}

/**
 * Generic threshold evaluator.
 * For metrics where higher is worse (higherIsWorse = true):
 *   value <= healthyMax → healthy, value <= warningMax → warning, else critical
 * For metrics where lower is worse (higherIsWorse = false):
 *   value >= healthyMin → healthy, value >= warningMin → warning, else critical
 */
export function determineHealthStatus(
  value: number,
  thresholds: ThresholdRange,
): HealthStatus {
  if (thresholds.higherIsWorse) {
    if (value <= thresholds.healthyMax) return 'healthy';
    if (value <= thresholds.warningMax) return 'warning';
    return 'critical';
  } else {
    if (value >= thresholds.healthyMin) return 'healthy';
    if (value >= thresholds.warningMin) return 'warning';
    return 'critical';
  }
}

/**
 * Compute community burden from location state and water usage rate.
 */
export function computeCommunityBurden(
  locationState: LocationLayerState,
  waterUsageRate: number,
): CommunityBurden {
  const facilityWaterDrawLitersPerDay = waterUsageRate * 24;

  let waterStressLevel: CommunityBurden['waterStressLevel'];
  if (locationState.waterStressIndex < 0.3) waterStressLevel = 'low';
  else if (locationState.waterStressIndex < 0.6) waterStressLevel = 'moderate';
  else if (locationState.waterStressIndex < 0.8) waterStressLevel = 'high';
  else waterStressLevel = 'critical';

  // Assume community industrial water budget of ~200,000 L/day for context
  const communityWaterBudgetPercent = (facilityWaterDrawLitersPerDay / 200000) * 100;

  // Carbon context: ~0.21 kgCO2/km for a passenger car
  // carbonOutputKgPerDay / 0.21 = equivalent km
  // We approximate: totalFacilityPower isn't available here, so use water as proxy
  const carbonFootprintContext = `Facility water draw of ${Math.round(facilityWaterDrawLitersPerDay).toLocaleString()} L/day`;

  let airQualityImpact: string;
  if (locationState.localAirQualityIndex < 50) {
    airQualityImpact = 'Good — no significant air quality impact from facility operations.';
  } else if (locationState.localAirQualityIndex < 100) {
    airQualityImpact = 'Moderate — facility backup generators should remain offline to avoid worsening local air quality.';
  } else {
    airQualityImpact = 'Poor — local air quality is degraded. Minimize any combustion-based backup power usage.';
  }

  return {
    communityName: `${locationState.communityName}, ${locationState.region}`,
    waterStressIndex: locationState.waterStressIndex,
    waterStressLevel,
    facilityWaterDrawLitersPerDay,
    communityWaterBudgetPercent: Math.round(communityWaterBudgetPercent * 10) / 10,
    carbonFootprintContext,
    airQualityImpact,
  };
}
