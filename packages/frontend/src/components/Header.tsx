import { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { useToastStore } from '../store/useToastStore';
import { HealthGauge, computeOverallHealth } from './HealthGauge';
import { SpeedControl } from './SpeedControl';
import type { ScenarioDefinition } from '@izakaya/shared';

export function Header() {
  const connectionStatus = useDashboardStore((s) => s.connectionStatus);
  const simulationState = useDashboardStore((s) => s.simulationState);
  const setMode = useDashboardStore((s) => s.setMode);
  const addToast = useToastStore((s) => s.addToast);
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>([]);
  const [loading, setLoading] = useState(false);

  const activeScenario = simulationState.activeScenario;
  const healthScore = computeOverallHealth(simulationState);

  useEffect(() => {
    fetch('/api/scenarios')
      .then((r) => r.ok ? r.json() : { scenarios: [] })
      .then((data) => setScenarios(data.scenarios || []))
      .catch(() => setScenarios([]));
  }, []);

  async function activateScenario(id: string) {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/scenarios/${id}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'simulation' }),
      });
      if (res.ok) {
        setMode('simulation');
        addToast({ type: 'success', title: `Scenario "${id}" activated` });
      } else {
        addToast({ type: 'error', title: 'Failed to activate scenario' });
      }
    } catch {
      addToast({ type: 'error', title: 'Failed to activate scenario' });
    }
    setLoading(false);
  }

  const scoreColor = healthScore >= 80 ? 'text-green-400' : healthScore >= 60 ? 'text-yellow-400' : healthScore >= 40 ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="h-14 flex-shrink-0 bg-[#1a1d27] border-b border-[#2d3148] flex items-center px-4 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-white font-bold text-base tracking-tight">AI FACTORY</span>
        <span className="text-slate-500 text-xs ml-1">DIGITAL TWIN</span>
      </div>

      <div className="w-px h-6 bg-[#2d3148]" />

      {/* Scenario selector */}
      <select
        value={activeScenario || ''}
        onChange={(e) => activateScenario(e.target.value)}
        disabled={!!activeScenario || loading}
        className="bg-[#252840] border border-[#3d4168] text-slate-300 text-xs rounded px-2 py-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Normal Operations</option>
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {activeScenario && (
        <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-700/30">
          ACTIVE: {activeScenario}
        </span>
      )}

      {/* Speed control */}
      <SpeedControl />

      <div className="flex-1" />

      {/* Health gauge */}
      <div className="flex items-center gap-2">
        <HealthGauge score={healthScore} size={36} />
        <span className={`text-sm font-mono font-bold ${scoreColor}`}>
          {Math.round(healthScore)}%
        </span>
      </div>

      <div className="w-px h-6 bg-[#2d3148]" />

      {/* Connection indicator */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#252840]">
        <span className={`w-1.5 h-1.5 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
          connectionStatus === 'reconnecting' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="text-[11px] text-slate-400">
          {connectionStatus === 'connected' ? 'LIVE' : connectionStatus === 'reconnecting' ? 'RECONNECTING' : 'OFFLINE'}
        </span>
      </div>
    </div>
  );
}
