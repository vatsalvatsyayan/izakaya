import { create } from 'zustand';
import type { SimulationState } from '@izakaya/shared';
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

  setSimulationState: (state: SimulationState) => void;
  selectLayer: (layerId: string | null) => void;
  setMode: (mode: 'live' | 'simulation') => void;
  setActivePanel: (panel: 'alerts' | 'scenarios' | 'history') => void;
  setPendingLeverChange: (leverId: string, value: number) => void;
  clearPendingLeverChanges: () => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
  setShowTradeoffModal: (show: boolean) => void;
}

const initialHistory: Record<string, number[]> = {
  pue: [SEED_STATE.derivedMetrics.pue],
  wue: [SEED_STATE.derivedMetrics.wue],
  cue: [SEED_STATE.derivedMetrics.cue],
  gpuUtilizationRate: [SEED_STATE.layers.gpu.gpuUtilizationRate],
  carbonOutputKgPerHr: [SEED_STATE.derivedMetrics.carbonOutputKgPerHr],
  requestVolume: [SEED_STATE.layers.workload.requestVolume],
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  simulationState: SEED_STATE,
  selectedLayer: null,
  mode: 'live',
  activePanel: 'alerts',
  pendingLeverChanges: {},
  connectionStatus: 'disconnected',
  metricHistory: initialHistory,
  showTradeoffModal: false,

  setSimulationState: (state) =>
    set((prev) => {
      const history = { ...prev.metricHistory };
      const append = (key: string, val: number) => {
        const arr = [...(history[key] || []), val];
        history[key] = arr.length > 60 ? arr.slice(-60) : arr;
      };
      append('pue', state.derivedMetrics.pue);
      append('wue', state.derivedMetrics.wue);
      append('cue', state.derivedMetrics.cue);
      append('gpuUtilizationRate', state.layers.gpu.gpuUtilizationRate);
      append('carbonOutputKgPerHr', state.derivedMetrics.carbonOutputKgPerHr);
      append('requestVolume', state.layers.workload.requestVolume);
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
}));
