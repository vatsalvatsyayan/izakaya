import type { SimulationState } from '@izakaya/shared';
import {
  DRIFT_CONFIG,
  GRID_CARBON_SINUSOIDAL_AMPLITUDE,
  SIMULATED_SECONDS_PER_TICK,
} from '@izakaya/shared';

const SECONDS_PER_DAY = 86400;
const TICKS_PER_DAY = SECONDS_PER_DAY / SIMULATED_SECONDS_PER_TICK; // 288

function noise(range: number): number {
  return (Math.random() * 2 - 1) * range;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getSimulatedHour(simulatedTimeSeconds: number): number {
  return ((simulatedTimeSeconds % SECONDS_PER_DAY) / 3600);
}

function isDaytime(simulatedTimeSeconds: number): boolean {
  const hour = getSimulatedHour(simulatedTimeSeconds);
  return hour >= 6 && hour < 18;
}

function isBusinessHours(simulatedTimeSeconds: number): boolean {
  const hour = getSimulatedHour(simulatedTimeSeconds);
  return hour >= 6 && hour < 18;
}

export function applyEnvironmentalDrift(state: SimulationState): void {
  const daytime = isDaytime(state.simulatedTimeSeconds);
  const businessHours = isBusinessHours(state.simulatedTimeSeconds);

  // Ambient Temperature
  const ambTempConfig = DRIFT_CONFIG.ambientTemperature;
  const ambDrift = daytime ? ambTempConfig.driftMagnitude : ambTempConfig.nightDriftMagnitude!;
  state.layers.location.ambientTemperature = clamp(
    state.layers.location.ambientTemperature + ambDrift + noise(ambTempConfig.noiseRange),
    -10, 55,
  );
  // Sync cooling ambient with location
  state.layers.cooling.ambientTemperature = state.layers.location.ambientTemperature;

  // GPU Temperature drift (proportional to utilization)
  const gpuTempConfig = DRIFT_CONFIG.averageGpuTemperature;
  const gpuDrift = gpuTempConfig.driftMagnitude * state.layers.gpu.gpuUtilizationRate;
  state.layers.gpu.averageGpuTemperature = clamp(
    state.layers.gpu.averageGpuTemperature + gpuDrift + noise(gpuTempConfig.noiseRange),
    20, 100,
  );

  // Grid Carbon Intensity (sinusoidal peaking at midday)
  const carbonConfig = DRIFT_CONFIG.gridCarbonIntensity;
  const hour = getSimulatedHour(state.simulatedTimeSeconds);
  // Sinusoidal: peak at hour 12, trough at hour 0/24
  const baseCarbonIntensity = 180; // seed baseline
  const sinValue = Math.sin(((hour - 6) / 12) * Math.PI); // peaks at hour 12
  const carbonTarget = baseCarbonIntensity + GRID_CARBON_SINUSOIDAL_AMPLITUDE * sinValue;
  state.layers.location.gridCarbonIntensity = clamp(
    carbonTarget + noise(carbonConfig.noiseRange),
    50, 800,
  );
  // Sync power layer
  state.layers.power.gridCarbonIntensity = state.layers.location.gridCarbonIntensity;

  // Renewable fraction inversely correlates with carbon intensity
  const renewableFraction = clamp(1 - (state.layers.location.gridCarbonIntensity / 600), 0, 1);
  state.layers.location.renewableEnergyFraction = renewableFraction;
  state.layers.power.renewableEnergyFraction = renewableFraction;

  // Request Volume
  const reqConfig = DRIFT_CONFIG.requestVolume;
  const reqDrift = businessHours ? reqConfig.driftMagnitude : reqConfig.nightDriftMagnitude!;
  state.layers.workload.requestVolume = clamp(
    state.layers.workload.requestVolume + reqDrift + noise(reqConfig.noiseRange),
    500, 30000,
  );

  // Water Stress Index
  const wsiConfig = DRIFT_CONFIG.waterStressIndex;
  state.layers.location.waterStressIndex = clamp(
    state.layers.location.waterStressIndex + noise(wsiConfig.noiseRange),
    0, 1,
  );
}
