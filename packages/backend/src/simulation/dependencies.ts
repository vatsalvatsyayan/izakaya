import type { SimulationState } from '@izakaya/shared';
import {
  CONVERGENCE_FACTOR,
  BASE_COOLING_POWER,
  OVERHEAD_POWER,
  GPUS_PER_RACK,
  RACKS,
} from '@izakaya/shared';
import {
  computeCoolingPower,
  computeWaterUsageRate,
  computeGpuTemperature,
  computeITEquipmentPower,
  computeInferenceLatency,
  computeRequestDropRate,
  computeQueueDepth,
  computeBatchEfficiency,
  computeGpuIdlePowerWaste,
  computePUE,
  computeWUE,
  computeCUE,
  computeCarbonOutput,
  determineHealthStatus,
} from '@izakaya/shared';
import {
  POWER_THRESHOLDS,
  COOLING_THRESHOLDS,
  GPU_THRESHOLDS,
  WORKLOAD_THRESHOLDS,
  LOCATION_THRESHOLDS,
} from '@izakaya/shared';

// Track per-rack consecutive hot ticks for GPU degradation
const rackHotTickCounts: number[] = new Array(RACKS).fill(0);

function converge(current: number, target: number): number {
  return target + (current - target) * CONVERGENCE_FACTOR;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function propagateLayerDependencies(state: SimulationState): void {
  const { power, cooling, gpu, workload, location } = state.layers;

  // 1. Location → Cooling: ambient temp
  cooling.ambientTemperature = location.ambientTemperature;

  // 2. Cooling power calculation
  const targetCoolingPower = computeCoolingPower(
    BASE_COOLING_POWER,
    cooling.ambientTemperature,
    cooling.levers.fanSpeedOverride,
    cooling.levers.waterRecirculationMode,
  );
  cooling.coolingSetpoint = cooling.levers.coolingSetpoint;
  power.coolingPower = converge(power.coolingPower, targetCoolingPower);

  // Water usage
  const targetWaterUsage = computeWaterUsageRate(
    power.coolingPower,
    cooling.levers.coolingSetpoint,
    cooling.ambientTemperature,
    cooling.levers.waterRecirculationMode,
  );
  cooling.waterUsageRate = converge(cooling.waterUsageRate, targetWaterUsage);

  // Coolant supply temperature tracks setpoint with ambient influence
  const targetCoolantTemp = cooling.levers.coolingSetpoint - 6 + (cooling.ambientTemperature - 20) * 0.15;
  cooling.coolantSupplyTemperature = converge(cooling.coolantSupplyTemperature, targetCoolantTemp);

  // 3. Cooling → GPU: temperature
  // Count active GPUs based on rack shutdown levers
  let activeGpus = 0;
  for (let i = 0; i < RACKS; i++) {
    if (!gpu.levers.gracefulRackShutdown[i]) {
      activeGpus += GPUS_PER_RACK;
    }
  }
  // Subtract hardware failures (already tracked in activeGpuCount if below calculated)
  // Keep the lower of calculated vs current (failures persist)
  const maxPossibleGpus = activeGpus;
  if (gpu.activeGpuCount > maxPossibleGpus) {
    gpu.activeGpuCount = maxPossibleGpus;
  }

  const targetGpuTemp = computeGpuTemperature(
    cooling.levers.coolingSetpoint,
    gpu.levers.gpuPowerLimit,
    gpu.gpuUtilizationRate,
    cooling.ambientTemperature,
  );
  gpu.averageGpuTemperature = converge(gpu.averageGpuTemperature, targetGpuTemp);

  // GPU thermal throttling
  if (gpu.averageGpuTemperature > gpu.levers.thermalThrottleThreshold) {
    const throttleFactor = 1 - ((gpu.averageGpuTemperature - gpu.levers.thermalThrottleThreshold) * 0.05);
    gpu.gpuUtilizationRate = clamp(gpu.gpuUtilizationRate * Math.max(0.3, throttleFactor), 0, 1);
  }

  // GPU degradation: if avg temp > 85°C for 10+ consecutive ticks per rack
  for (let i = 0; i < RACKS; i++) {
    if (gpu.levers.gracefulRackShutdown[i]) {
      rackHotTickCounts[i] = 0;
      continue;
    }
    if (gpu.averageGpuTemperature > 85) {
      rackHotTickCounts[i]++;
      if (rackHotTickCounts[i] >= 10) {
        // One GPU fails in this rack
        if (gpu.activeGpuCount > 0) {
          gpu.activeGpuCount--;
          gpu.hardwareFailureRate += 0.1;
        }
        rackHotTickCounts[i] = 0; // Reset counter after failure
      }
    } else {
      rackHotTickCounts[i] = 0;
    }
  }

  // 4. GPU → Workload
  const targetLatency = computeInferenceLatency(
    gpu.averageGpuTemperature,
    workload.queueDepth,
    workload.levers.batchSize,
  );
  workload.averageInferenceLatency = converge(workload.averageInferenceLatency, targetLatency);

  const targetDropRate = computeRequestDropRate(
    workload.requestVolume,
    workload.levers.requestRateLimit,
    gpu.activeGpuCount,
    gpu.gpuUtilizationRate,
  );
  workload.requestDropRate = converge(workload.requestDropRate, targetDropRate);

  const targetQueueDepth = computeQueueDepth(
    workload.requestVolume,
    gpu.activeGpuCount,
    gpu.gpuUtilizationRate,
    workload.levers.batchSize,
  );
  workload.queueDepth = converge(workload.queueDepth, targetQueueDepth);

  workload.batchEfficiency = computeBatchEfficiency(
    workload.levers.batchSize,
    gpu.gpuUtilizationRate,
  );

  // 5. Workload → GPU → Power
  // GPU utilization driven by workload (if not throttled)
  if (gpu.averageGpuTemperature <= gpu.levers.thermalThrottleThreshold) {
    const gpuCapacity = gpu.activeGpuCount * 50; // 50 req/hr per GPU at full util
    const targetUtil = gpuCapacity > 0 ? clamp(workload.requestVolume / gpuCapacity, 0, 1) : 0;
    gpu.gpuUtilizationRate = converge(gpu.gpuUtilizationRate, targetUtil);
  }

  // IT equipment power
  const targetITPower = computeITEquipmentPower(
    gpu.activeGpuCount,
    gpu.levers.gpuPowerLimit,
    gpu.gpuUtilizationRate,
  );
  power.itEquipmentPower = converge(power.itEquipmentPower, targetITPower);

  // GPU idle power waste
  gpu.gpuIdlePowerWaste = computeGpuIdlePowerWaste(gpu.gpuUtilizationRate, gpu.activeGpuCount);

  // Total facility power (capped by power cap lever)
  const rawTotalPower = power.itEquipmentPower + power.coolingPower + OVERHEAD_POWER;
  power.totalFacilityPower = Math.min(rawTotalPower, power.levers.powerCap);
  power.overheadPower = OVERHEAD_POWER;

  // If power-capped, throttle IT power proportionally
  if (rawTotalPower > power.levers.powerCap) {
    const available = power.levers.powerCap - power.coolingPower - OVERHEAD_POWER;
    if (available < power.itEquipmentPower && available > 0) {
      const ratio = available / power.itEquipmentPower;
      gpu.gpuUtilizationRate *= ratio;
      power.itEquipmentPower = available;
    }
  }

  // 6. Derived metrics
  state.derivedMetrics.pue = computePUE(power.totalFacilityPower, power.itEquipmentPower);
  power.pue = state.derivedMetrics.pue;

  state.derivedMetrics.wue = computeWUE(cooling.waterUsageRate, power.itEquipmentPower);
  cooling.wue = state.derivedMetrics.wue;

  state.derivedMetrics.cue = computeCUE(
    power.totalFacilityPower,
    power.itEquipmentPower,
    location.gridCarbonIntensity,
  );

  state.derivedMetrics.carbonOutputKgPerHr = computeCarbonOutput(
    power.totalFacilityPower,
    location.gridCarbonIntensity,
    1, // per hour
  );

  state.derivedMetrics.gpuIdlePowerWasteKw = gpu.gpuIdlePowerWaste;

  // Renewable priority mode: add latency penalty
  if (power.levers.renewablePriorityMode) {
    if (location.renewableEnergyFraction < 0.5) {
      workload.averageInferenceLatency += 15;
    }
    state.derivedMetrics.carbonOutputKgPerHr *= 0.8;
  }

  // 7. Health statuses
  power.health = worstHealth([
    determineHealthStatus(power.pue, POWER_THRESHOLDS.pue),
    determineHealthStatus(power.totalFacilityPower, POWER_THRESHOLDS.totalFacilityPower),
    determineHealthStatus(power.gridCarbonIntensity, POWER_THRESHOLDS.gridCarbonIntensity),
  ]);

  cooling.health = worstHealth([
    determineHealthStatus(cooling.wue, COOLING_THRESHOLDS.wue),
    determineHealthStatus(cooling.waterUsageRate, COOLING_THRESHOLDS.waterUsageRate),
    determineHealthStatus(cooling.ambientTemperature, COOLING_THRESHOLDS.ambientTemperature),
  ]);

  gpu.health = worstHealth([
    determineHealthStatus(gpu.averageGpuTemperature, GPU_THRESHOLDS.averageGpuTemperature),
    determineHealthStatus(gpu.gpuUtilizationRate, GPU_THRESHOLDS.gpuUtilizationRate),
    determineHealthStatus(gpu.activeGpuCount, GPU_THRESHOLDS.activeGpuCount),
  ]);

  workload.health = worstHealth([
    determineHealthStatus(workload.averageInferenceLatency, WORKLOAD_THRESHOLDS.averageInferenceLatency),
    determineHealthStatus(workload.requestDropRate, WORKLOAD_THRESHOLDS.requestDropRate),
    determineHealthStatus(workload.queueDepth, WORKLOAD_THRESHOLDS.queueDepth),
  ]);

  location.health = worstHealth([
    determineHealthStatus(location.ambientTemperature, LOCATION_THRESHOLDS.ambientTemperature),
    determineHealthStatus(location.waterStressIndex, LOCATION_THRESHOLDS.waterStressIndex),
    determineHealthStatus(location.gridCarbonIntensity, LOCATION_THRESHOLDS.gridCarbonIntensity),
  ]);
}

function worstHealth(statuses: Array<'healthy' | 'warning' | 'critical'>): 'healthy' | 'warning' | 'critical' {
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  return 'healthy';
}
