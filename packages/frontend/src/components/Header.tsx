import { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { useToastStore } from '../store/useToastStore';
import { HealthGauge, computeOverallHealth } from './HealthGauge';
import { SpeedControl } from './SpeedControl';
import { AWSStatusBadge } from './AWSStatusBadge';
import type { ScenarioDefinition } from '@izakaya/shared';

const STATUS_CONFIG = {
  connected:    { dot: '#22C55E', text: '#4ADE80', label: 'LIVE',          glow: true  },
  reconnecting: { dot: '#FACC15', text: '#FDE68A', label: 'RECONNECTING',  glow: false },
  disconnected: { dot: '#F87171', text: '#FCA5A5', label: 'OFFLINE',       glow: false },
} as const;

export function Header() {
  const connectionStatus  = useDashboardStore((s) => s.connectionStatus);
  const simulationState   = useDashboardStore((s) => s.simulationState);
  const setMode           = useDashboardStore((s) => s.setMode);
  const addToast          = useToastStore((s) => s.addToast);
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>([]);
  const [loading, setLoading]     = useState(false);

  const activeScenario = simulationState.activeScenario;
  const healthScore    = computeOverallHealth(simulationState);
  const statusCfg      = STATUS_CONFIG[connectionStatus];

  const scoreColor = healthScore >= 80 ? '#4ADE80'
                   : healthScore >= 60 ? '#FACC15'
                   : healthScore >= 40 ? '#FB923C'
                   : '#F87171';

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

  return (
    <div
      className="flex-shrink-0 flex items-center px-4 gap-4"
      style={{
        height: 48,
        background: '#0B111E',
        borderBottom: '1px solid #1E3A5F',
      }}
    >
      {/* Logo / wordmark */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div style={{
          width: 22, height: 22, borderRadius: 4,
          background: 'linear-gradient(135deg, #1D4ED8, #0EA5E9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 900, color: 'white',
        }}>
          AI
        </div>
        <div>
          <span className="text-white font-bold text-[13px] tracking-tight">AI FACTORY</span>
          <span className="text-slate-600 text-[10px] ml-1.5 font-medium tracking-widest">DIGITAL TWIN</span>
        </div>
      </div>

      <div className="w-px h-5 bg-[#1E3A5F] flex-shrink-0" />

      {/* Scenario selector */}
      <select
        value={activeScenario || ''}
        onChange={(e) => activateScenario(e.target.value)}
        disabled={!!activeScenario || loading}
        className="text-[11px] rounded px-2 py-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed outline-none"
        style={{ background: '#1E293B', border: '1px solid #334155', color: '#CBD5E1', maxWidth: 180 }}
      >
        <option value="">Normal Operations</option>
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {activeScenario && (
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap"
          style={{
            background: 'rgba(59,130,246,0.15)',
            color: '#7DD3FC',
            border: '1px solid rgba(59,130,246,0.3)',
          }}
        >
          ▶ {activeScenario}
        </span>
      )}

      {/* Speed control */}
      <SpeedControl />

      <div className="flex-1" />

      {/* Overall health gauge */}
      <div className="flex items-center gap-2">
        <HealthGauge score={healthScore} size={32} />
        <span
          className="text-[13px] font-mono font-bold"
          style={{ color: scoreColor, textShadow: `0 0 8px ${scoreColor}55` }}
        >
          {Math.round(healthScore)}%
        </span>
      </div>

      <div className="w-px h-5 bg-[#1E3A5F] flex-shrink-0" />

      {/* AWS badge */}
      <AWSStatusBadge />

      <div className="w-px h-5 bg-[#1E3A5F] flex-shrink-0" />

      {/* Connection status */}
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded"
        style={{ background: '#111827', border: '1px solid #1E3A5F' }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: statusCfg.dot,
            boxShadow: statusCfg.glow ? `0 0 5px ${statusCfg.dot}` : 'none',
          }}
        />
        <span className="text-[10px] font-bold tracking-wider" style={{ color: statusCfg.text }}>
          {statusCfg.label}
        </span>
      </div>
    </div>
  );
}
