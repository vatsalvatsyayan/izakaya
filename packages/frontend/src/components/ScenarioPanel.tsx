import { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { useToastStore } from '../store/useToastStore';
import type { ScenarioDefinition } from '@izakaya/shared';

export function ScenarioPanel() {
  const activeScenario = useDashboardStore((s) => s.simulationState.activeScenario);
  const setMode = useDashboardStore((s) => s.setMode);
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioDefinition[]>([]);

  useEffect(() => {
    fetch('/api/scenarios')
      .then((r) => r.ok ? r.json() : { scenarios: [] })
      .then((data) => setScenarios(data.scenarios || []))
      .catch(() => setScenarios([]));
  }, []);

  async function activateScenario(id: string) {
    setLoading(id);
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
        addToast({ type: 'error', title: 'Failed to activate scenario', body: 'Backend not available' });
      }
    } catch {
      addToast({ type: 'error', title: 'Failed to activate scenario', body: 'Backend not available' });
    }
    setLoading(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {scenarios.map((s) => (
        <div key={s.id} style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: 6,
          padding: 12,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            {s.name}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px' }}>
            {s.description}
          </p>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
            {s.affectedLayers.map((l: string) => (
              <span key={l} style={{
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                textTransform: 'capitalize',
              }}>
                {l}
              </span>
            ))}
          </div>
          {activeScenario === s.id ? (
            <div style={{
              height: 4,
              background: 'var(--bg-elevated)',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                background: 'var(--action-primary)',
                width: '50%',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
            </div>
          ) : (
            <button
              onClick={() => activateScenario(s.id)}
              disabled={!!loading || !!activeScenario}
              style={{
                background: activeScenario ? 'var(--bg-elevated)' : 'var(--action-primary)',
                border: 'none',
                color: activeScenario ? 'var(--text-disabled)' : 'white',
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 16px',
                borderRadius: 6,
                cursor: activeScenario ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {loading === s.id ? 'Activating...' : 'Simulate'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
