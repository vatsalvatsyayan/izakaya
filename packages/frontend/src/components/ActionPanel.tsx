import { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { LEVER_DEFINITIONS } from '@izakaya/shared';
import type { Lever } from '@izakaya/shared';

const LAYER_OPTIONS = [
  { id: 'power', label: 'Power' },
  { id: 'cooling', label: 'Cooling' },
  { id: 'gpu', label: 'GPU' },
  { id: 'workload', label: 'Workload' },
];

export function ActionPanel() {
  const state = useDashboardStore((s) => s.simulationState);
  const selectedLayer = useDashboardStore((s) => s.selectedLayer);
  const selectLayer = useDashboardStore((s) => s.selectLayer);
  const pending = useDashboardStore((s) => s.pendingLeverChanges);
  const setPending = useDashboardStore((s) => s.setPendingLeverChange);
  const setShowModal = useDashboardStore((s) => s.setShowTradeoffModal);

  const [localLayer, setLocalLayer] = useState<string>(selectedLayer || 'power');
  const activeLayer = selectedLayer || localLayer;

  const levers = LEVER_DEFINITIONS.filter((l: Lever) => l.layerId === activeLayer);
  const layerState = state.layers[activeLayer as keyof typeof state.layers];
  const layerLevers = (layerState as { levers?: Record<string, unknown> })?.levers || {};
  const hasPending = Object.keys(pending).length > 0;

  function handleLayerChange(id: string) {
    setLocalLayer(id);
    selectLayer(id);
  }

  return (
    <div className="p-3 flex flex-col gap-4">
      {/* Layer selector */}
      <div className="flex gap-1 flex-wrap">
        {LAYER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleLayerChange(opt.id)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              activeLayer === opt.id
                ? 'bg-blue-600 text-white'
                : 'bg-[#252840] text-slate-400 hover:bg-[#2d3148]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Lever controls */}
      <div className="space-y-4">
        {levers.map((lever: Lever) => {
          if (lever.id === 'gracefulRackShutdown') return null;
          const rawVal = pending[lever.id] ?? layerLevers[lever.id] ?? lever.currentValue;
          const currentVal = typeof rawVal === 'boolean' ? (rawVal ? 1 : 0) : (rawVal as number);
          const isToggle = lever.type === 'toggle';

          if (isToggle) {
            const boolVal = currentVal === 1;
            return (
              <div key={lever.id} className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide">{lever.name}</span>
                <button
                  onClick={() => setPending(lever.id, boolVal ? 0 : 1)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${boolVal ? 'bg-blue-600' : 'bg-[#3d4168]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${boolVal ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
            );
          }

          return (
            <div key={lever.id}>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wide">{lever.name}</span>
                <span className="font-mono text-slate-200 text-xs">
                  {typeof currentVal === 'number' ? (currentVal % 1 !== 0 ? currentVal.toFixed(2) : currentVal) : currentVal}
                  {lever.unit ? ` ${lever.unit}` : ''}
                </span>
              </div>
              <input
                type="range"
                min={lever.minValue}
                max={lever.maxValue}
                step={lever.step}
                value={currentVal}
                onChange={(e) => setPending(lever.id, parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                <span>{lever.minValue}{lever.unit}</span>
                <span>{lever.maxValue}{lever.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setShowModal(true)}
        disabled={!hasPending}
        className={`w-full py-2 rounded font-bold text-sm transition-colors ${
          hasPending
            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
            : 'bg-[#252840] text-slate-600 cursor-not-allowed'
        }`}
      >
        Commit Action
      </button>
    </div>
  );
}
