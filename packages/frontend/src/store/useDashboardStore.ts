import { create } from 'zustand';
import type { SimulationState, ScenarioProgress } from '@izakaya/shared';
import { SEED_STATE } from '@izakaya/shared';

export interface DashboardStore {
  simulationState: SimulationState;
  selectedLayer: string | null;
  mode: 'live' | 'simulation';
  activePanel: 'alerts' | 'scenarios' | 'history';
  pendingLeverChanges: Record<string, number>;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  metricHistory: Record<string, number[]>;
  showTradeoffModal: boolean;
  // New fields for enhanced UI
  activeTab: string;
  selectedHealthComponent: string | null;
  speedMultiplier: number;
  scenarioProgress: ScenarioProgress | null;

  setSimulationState: (state: SimulationState) => void;
  selectLayer: (layerId: string | null) => void;
  setMode: (mode: 'live' | 'simulation') => void;
  setActivePanel: (panel: 'alerts' | 'scenarios' | 'history') => void;
  setPendingLeverChange: (leverId: string, value: number) => void;
  clearPendingLeverChanges: () => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
  setShowTradeoffModal: (show: boolean) => void;
  // New actions for enhanced UI
  setActiveTab: (tab: string) => void;
  setSelectedHealthComponent: (key: string | null) => void;
  setSpeedMultiplier: (speed: number) => void;
  setScenarioProgress: (progress: ScenarioProgress | null) => void;
  acknowledgeAlert: (id: string) => void;
}

function buildInitialHistory(): Record<string, number[]> {
  const s = SEED_STATE;
  return {
    // Power
    totalFacilityPower: [s.layers.power.totalFacilityPower],
    itEquipmentPower: [s.layers.power.itEquipmentPower],
    coolingPower: [s.layers.power.coolingPower],
    gridCarbonIntensity: [s.layers.power.gridCarbonIntensity],
    renewableEnergyFraction: [s.layers.power.renewableEnergyFraction],
    // Cooling
    coolingSetpoint: [s.layers.cooling.coolingSetpoint],
    waterUsageRate: [s.layers.cooling.waterUsageRate],
    ambientTemperature: [s.layers.cooling.ambientTemperature],
    coolantSupplyTemperature: [s.layers.cooling.coolantSupplyTemperature],
    // GPU
    averageGpuTemperature: [s.layers.gpu.averageGpuTemperature],
    gpuUtilizationRate: [s.layers.gpu.gpuUtilizationRate],
    activeGpuCount: [s.layers.gpu.activeGpuCount],
    gpuIdlePowerWaste: [s.layers.gpu.gpuIdlePowerWaste],
    hardwareFailureRate: [s.layers.gpu.hardwareFailureRate],
    // Workload
    requestVolume: [s.layers.workload.requestVolume],
    averageInferenceLatency: [s.layers.workload.averageInferenceLatency],
    queueDepth: [s.layers.workload.queueDepth],
    requestDropRate: [s.layers.workload.requestDropRate],
    batchEfficiency: [s.layers.workload.batchEfficiency],
    // Location
    waterStressIndex: [s.layers.location.waterStressIndex],
    localAirQualityIndex: [s.layers.location.localAirQualityIndex],
    // Derived
    pue: [s.derivedMetrics.pue],
    wue: [s.derivedMetrics.wue],
    cue: [s.derivedMetrics.cue],
    carbonOutputKgPerHr: [s.derivedMetrics.carbonOutputKgPerHr],
  };
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  simulationState: SEED_STATE,
  selectedLayer: null,
  mode: 'live',
  activePanel: 'alerts',
  pendingLeverChanges: {},
  connectionStatus: 'disconnected',
  metricHistory: buildInitialHistory(),
  showTradeoffModal: false,
  activeTab: 'sensors',
  selectedHealthComponent: null,
  speedMultiplier: 1,
  scenarioProgress: null,

  setSimulationState: (state) =>
    set((prev) => {
      const history = { ...prev.metricHistory };
      const append = (key: string, val: number) => {
        const arr = [...(history[key] || []), val];
        history[key] = arr.length > 60 ? arr.slice(-60) : arr;
      };
      // Power
      append('totalFacilityPower', state.layers.power.totalFacilityPower);
      append('itEquipmentPower', state.layers.power.itEquipmentPower);
      append('coolingPower', state.layers.power.coolingPower);
      append('gridCarbonIntensity', state.layers.power.gridCarbonIntensity);
      append('renewableEnergyFraction', state.layers.power.renewableEnergyFraction);
      // Cooling
      append('coolingSetpoint', state.layers.cooling.coolingSetpoint);
      append('waterUsageRate', state.layers.cooling.waterUsageRate);
      append('ambientTemperature', state.layers.cooling.ambientTemperature);
      append('coolantSupplyTemperature', state.layers.cooling.coolantSupplyTemperature);
      // GPU
      append('averageGpuTemperature', state.layers.gpu.averageGpuTemperature);
      append('gpuUtilizationRate', state.layers.gpu.gpuUtilizationRate);
      append('activeGpuCount', state.layers.gpu.activeGpuCount);
      append('gpuIdlePowerWaste', state.layers.gpu.gpuIdlePowerWaste);
      append('hardwareFailureRate', state.layers.gpu.hardwareFailureRate);
      // Workload
      append('requestVolume', state.layers.workload.requestVolume);
      append('averageInferenceLatency', state.layers.workload.averageInferenceLatency);
      append('queueDepth', state.layers.workload.queueDepth);
      append('requestDropRate', state.layers.workload.requestDropRate);
      append('batchEfficiency', state.layers.workload.batchEfficiency);
      // Location
      append('waterStressIndex', state.layers.location.waterStressIndex);
      append('localAirQualityIndex', state.layers.location.localAirQualityIndex);
      // Derived
      append('pue', state.derivedMetrics.pue);
      append('wue', state.derivedMetrics.wue);
      append('cue', state.derivedMetrics.cue);
      append('carbonOutputKgPerHr', state.derivedMetrics.carbonOutputKgPerHr);
      return { simulationState: state, metricHistory: history, mode: state.mode };
    }),

  selectLayer: (layerId) =>
    set((prev) => ({
      selectedLayer: prev.selectedLayer === layerId ? null : layerId,
    })),

  setMode: (mode) => set({ mode }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setPendingLeverChange: (leverId, value) =>
    set((prev) => ({
      pendingLeverChanges: { ...prev.pendingLeverChanges, [leverId]: value },
    })),
  clearPendingLeverChanges: () => set({ pendingLeverChanges: {} }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setShowTradeoffModal: (show) => set({ showTradeoffModal: show }),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedHealthComponent: (key) =>
    set((prev) => ({
      selectedHealthComponent: prev.selectedHealthComponent === key ? null : key,
    })),
  setSpeedMultiplier: (speed) => set({ speedMultiplier: speed }),
  setScenarioProgress: (progress) => set({ scenarioProgress: progress }),
  acknowledgeAlert: (id) =>
    set((prev) => ({
      simulationState: {
        ...prev.simulationState,
        activeAlerts: prev.simulationState.activeAlerts.map((a) =>
          a.id === id ? { ...a, acknowledged: true } : a
        ),
      },
    })),
}));
