import { useMemo } from 'react';
import type { HealthStatus } from '@izakaya/shared';
import { useDashboardStore } from '../store/useDashboardStore';

export interface LayerHealthInfo {
  layerId: string;
  layerName: string;
  health: HealthStatus;
  icon: string;
  keyMetrics: { label: string; value: string }[];
}

export function useLayerHealth(): LayerHealthInfo[] {
  const state = useDashboardStore((s) => s.simulationState);

  return useMemo(() => {
    const { layers } = state;
    return [
      {
        layerId: 'power',
        layerName: 'Power',
        health: layers.power.health,
        icon: '\u26A1',
        keyMetrics: [
          { label: 'PUE', value: layers.power.pue.toFixed(2) },
          { label: 'Total Power', value: `${Math.round(layers.power.totalFacilityPower)} kW` },
        ],
      },
      {
        layerId: 'cooling',
        layerName: 'Cooling',
        health: layers.cooling.health,
        icon: '\u2744\uFE0F',
        keyMetrics: [
          { label: 'WUE', value: layers.cooling.wue.toFixed(2) },
          { label: 'Water', value: `${Math.round(layers.cooling.waterUsageRate)} L/hr` },
        ],
      },
      {
        layerId: 'gpu',
        layerName: 'GPU',
        health: layers.gpu.health,
        icon: '\uD83D\uDDA5\uFE0F',
        keyMetrics: [
          { label: 'Temp', value: `${Math.round(layers.gpu.averageGpuTemperature)}\u00B0C` },
          { label: 'Util', value: `${Math.round(layers.gpu.gpuUtilizationRate * 100)}%` },
        ],
      },
      {
        layerId: 'workload',
        layerName: 'Workload',
        health: layers.workload.health,
        icon: '\uD83D\uDCCA',
        keyMetrics: [
          { label: 'Latency', value: `${Math.round(layers.workload.averageInferenceLatency)} ms` },
          { label: 'Requests', value: `${Math.round(layers.workload.requestVolume).toLocaleString()} /hr` },
        ],
      },
      {
        layerId: 'location',
        layerName: 'Location',
        health: layers.location.health,
        icon: '\uD83C\uDF0D',
        keyMetrics: [
          { label: 'Ambient', value: `${Math.round(layers.location.ambientTemperature)}\u00B0C` },
          { label: 'Water Stress', value: layers.location.waterStressIndex.toFixed(2) },
        ],
      },
    ];
  }, [state]);
}
