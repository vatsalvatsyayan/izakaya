import type { SimulationState, ScenarioDefinition, ScenarioEvent } from '@izakaya/shared';

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: 'heatwave-001',
    name: 'Heatwave Stress Event',
    description: 'An extreme heatwave drives ambient temperature to 42°C over 20 ticks, overwhelming the cooling system and stressing GPUs.',
    affectedLayers: ['location', 'cooling', 'gpu', 'power'],
    triggerType: 'manual',
    autoTriggerCondition: 'Ambient Temperature > 35°C for 5 consecutive ticks',
    totalDurationTicks: 20,
    events: [
      { tickOffset: 0, layerAffected: 'location', metricAffected: 'ambientTemperature', operation: 'add', value: 1, durationTicks: 20 },
      { tickOffset: 5, layerAffected: 'location', metricAffected: 'ambientTemperature', operation: 'add', value: 1, durationTicks: 15 },
      { tickOffset: 10, layerAffected: 'location', metricAffected: 'ambientTemperature', operation: 'add', value: 1, durationTicks: 10 },
      { tickOffset: 15, layerAffected: 'location', metricAffected: 'ambientTemperature', operation: 'add', value: 1, durationTicks: 5 },
    ],
    recommendationTriggers: [
      { tickOffset: 5, recommendationTemplateId: 'rec-gpu-temp-warning' },
      { tickOffset: 10, recommendationTemplateId: 'rec-wue-warning' },
      { tickOffset: 15, recommendationTemplateId: 'rec-gpu-temp-critical' },
    ],
    resolution: 'Reduce GPU load and increase cooling to bring GPU temperatures below 80°C.',
    endUserImpactSummary: 'Inference latency increases from 55ms to 180ms during peak stress. Rate limiting may drop ~2,000 requests/hr.',
    ethicalDimension: 'Water usage increases during a heatwave when residential demand is also high — community resource conflict.',
  },
  {
    id: 'demand-spike-001',
    name: 'Demand Spike',
    description: 'A viral event causes request volume to triple over 10 ticks, overwhelming GPU capacity and creating queuing delays.',
    affectedLayers: ['workload', 'gpu', 'power', 'cooling'],
    triggerType: 'manual',
    autoTriggerCondition: 'Request Volume > 12,000 req/hr for 3 consecutive ticks',
    totalDurationTicks: 10,
    events: [
      { tickOffset: 0, layerAffected: 'workload', metricAffected: 'requestVolume', operation: 'add', value: 1500, durationTicks: 10 },
      { tickOffset: 3, layerAffected: 'workload', metricAffected: 'requestVolume', operation: 'add', value: 2000, durationTicks: 7 },
      { tickOffset: 6, layerAffected: 'workload', metricAffected: 'requestVolume', operation: 'add', value: 3000, durationTicks: 4 },
    ],
    recommendationTriggers: [
      { tickOffset: 3, recommendationTemplateId: 'rec-drop-rate-warning' },
      { tickOffset: 6, recommendationTemplateId: 'rec-drop-rate-critical' },
    ],
    resolution: 'Rate-limit to ~10,000 req/hr, increase batch size to 32, increase Priority Queue Weight to protect premium users.',
    endUserImpactSummary: 'At peak, 67% of free-tier requests dropped or experience >5s latency. Premium users see 120ms latency.',
    ethicalDimension: 'Priority Queue Weight protects paying customers at direct expense of free-tier users, disproportionately affecting less affluent demographics.',
  },
  {
    id: 'carbon-spike-001',
    name: 'Grid Carbon Intensity Spike',
    description: 'A grid event causes carbon intensity to spike to 600 gCO2/kWh, tripling the data center\'s carbon footprint.',
    affectedLayers: ['location', 'power'],
    triggerType: 'manual',
    autoTriggerCondition: 'Grid Carbon Intensity > 350 gCO2/kWh',
    totalDurationTicks: 15,
    events: [
      { tickOffset: 0, layerAffected: 'location', metricAffected: 'gridCarbonIntensity', operation: 'add', value: 30, durationTicks: 15 },
      { tickOffset: 5, layerAffected: 'location', metricAffected: 'gridCarbonIntensity', operation: 'add', value: 30, durationTicks: 10 },
      { tickOffset: 10, layerAffected: 'location', metricAffected: 'renewableEnergyFraction', operation: 'multiply', value: 0.5, durationTicks: 5 },
    ],
    recommendationTriggers: [
      { tickOffset: 5, recommendationTemplateId: 'rec-carbon-warning' },
      { tickOffset: 10, recommendationTemplateId: 'rec-pue-critical' },
    ],
    resolution: 'Enable Renewable Priority Mode and reduce Power Cap to 800kW. Reduces throughput ~20% but cuts carbon output ~35%.',
    endUserImpactSummary: 'Renewable Priority Mode defers 20% of requests, adding 10-30 min latency for batch workloads.',
    ethicalDimension: 'Each hour of inaction emits an additional 335 kgCO2 — equivalent to driving a passenger car 1,350 km.',
  },
  {
    id: 'gpu-degradation-001',
    name: 'GPU Fleet Degradation',
    description: 'An aging firmware bug causes accelerating GPU failures, dropping active GPU count from 240 to below 160.',
    affectedLayers: ['gpu', 'workload', 'power'],
    triggerType: 'manual',
    autoTriggerCondition: 'Hardware Failure Rate > 2/day',
    totalDurationTicks: 20,
    events: [
      { tickOffset: 5, layerAffected: 'gpu', metricAffected: 'activeGpuCount', operation: 'add', value: -2, durationTicks: 15 },
      { tickOffset: 10, layerAffected: 'gpu', metricAffected: 'activeGpuCount', operation: 'add', value: -3, durationTicks: 10 },
      { tickOffset: 15, layerAffected: 'gpu', metricAffected: 'activeGpuCount', operation: 'add', value: -5, durationTicks: 5 },
    ],
    recommendationTriggers: [
      { tickOffset: 10, recommendationTemplateId: 'rec-drop-rate-warning' },
      { tickOffset: 15, recommendationTemplateId: 'rec-drop-rate-critical' },
    ],
    resolution: 'Shut down failing racks to consolidate, reduce rate limit to 5,000 req/hr, increase batch size to 48.',
    endUserImpactSummary: 'At worst, 12% of requests dropped. Service effectively degraded for all users.',
    ethicalDimension: 'Maintain high throughput (risking cascading failures/total outage) vs proactively reduce capacity (immediate degradation but prevents catastrophe).',
  },
  {
    id: 'water-scarcity-001',
    name: 'Water Scarcity Alert',
    description: 'A regional drought causes the Water Stress Index to spike from 0.3 to 0.8, making the data center\'s water consumption a community concern.',
    affectedLayers: ['location', 'cooling', 'gpu'],
    triggerType: 'manual',
    autoTriggerCondition: 'Water Stress Index > 0.5',
    totalDurationTicks: 15,
    events: [
      { tickOffset: 0, layerAffected: 'location', metricAffected: 'waterStressIndex', operation: 'add', value: 0.033, durationTicks: 15 },
    ],
    recommendationTriggers: [
      { tickOffset: 5, recommendationTemplateId: 'rec-wue-warning' },
      { tickOffset: 10, recommendationTemplateId: 'rec-wue-critical' },
    ],
    resolution: 'Enable Water Recirculation Mode and raise cooling setpoint to minimize water draw.',
    endUserImpactSummary: 'If cooling is reduced, GPU temperatures rise and latency may increase by 10-20ms.',
    ethicalDimension: 'The same water consumption that was acceptable at low stress becomes ethically problematic during a drought affecting the local community.',
  },
];

// Track active scenario effects
let activeEffects: Array<{
  event: ScenarioEvent;
  appliedAtTick: number;
  originalValue?: number;
}> = [];

export function activateScenario(
  state: SimulationState,
  scenarioId: string,
  mode: 'live' | 'simulation',
): SimulationState | null {
  const scenario = SCENARIO_DEFINITIONS.find(s => s.id === scenarioId);
  if (!scenario) return null;

  state.activeScenario = scenarioId;
  state.mode = mode;
  activeEffects = [];

  if (mode === 'simulation') {
    return JSON.parse(JSON.stringify(state)) as SimulationState;
  }
  return null;
}

export function applyScenarioEvents(state: SimulationState, scenarioStartTick: number): void {
  const scenario = SCENARIO_DEFINITIONS.find(s => s.id === state.activeScenario);
  if (!scenario) return;

  const tickOffset = state.tick - scenarioStartTick;

  // Apply new events that should fire at this tick offset
  for (const event of scenario.events) {
    if (event.tickOffset === tickOffset) {
      activeEffects.push({ event, appliedAtTick: state.tick });
    }
  }

  // Apply all active effects
  for (const effect of activeEffects) {
    const elapsed = state.tick - effect.appliedAtTick;
    if (elapsed >= effect.event.durationTicks) continue;

    applyEventToState(state, effect.event);
  }

  // Clean up expired effects
  activeEffects = activeEffects.filter(
    e => (state.tick - e.appliedAtTick) < e.event.durationTicks,
  );

  // Check if scenario is complete
  if (tickOffset >= scenario.totalDurationTicks) {
    // Scenario auto-completes — engine handles deactivation
  }
}

function applyEventToState(state: SimulationState, event: ScenarioEvent): void {
  const layer = state.layers[event.layerAffected as keyof typeof state.layers];
  if (!layer) return;

  const key = event.metricAffected as keyof typeof layer;
  if (!(key in layer)) return;

  const current = (layer as Record<string, unknown>)[key];
  if (typeof current !== 'number') return;

  let newValue: number;
  switch (event.operation) {
    case 'set':
      newValue = event.value;
      break;
    case 'add':
      newValue = current + event.value;
      break;
    case 'multiply':
      newValue = current * event.value;
      break;
    default:
      return;
  }

  (layer as Record<string, unknown>)[key] = newValue;
}

export function deactivateScenario(state: SimulationState): void {
  state.activeScenario = null;
  state.mode = 'live';
  activeEffects = [];
}

export function isScenarioComplete(state: SimulationState, scenarioStartTick: number): boolean {
  const scenario = SCENARIO_DEFINITIONS.find(s => s.id === state.activeScenario);
  if (!scenario) return true;
  return (state.tick - scenarioStartTick) >= scenario.totalDurationTicks;
}
