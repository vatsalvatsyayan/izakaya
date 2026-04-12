import { useDashboardStore } from '../store/useDashboardStore';
import { AlertPanel } from './AlertPanel';
import { ScenarioPanel } from './ScenarioPanel';
import { HistoryPanel } from './HistoryPanel';

const TABS = ['alerts', 'scenarios', 'history'] as const;

export function RightPanel() {
  const activePanel = useDashboardStore((s) => s.activePanel);
  const setActivePanel = useDashboardStore((s) => s.setActivePanel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        height: 40,
        borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-secondary)',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActivePanel(tab)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              borderBottom: activePanel === tab ? '2px solid var(--action-primary)' : '2px solid transparent',
              color: activePanel === tab ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 200ms ease-out',
              padding: '0 16px',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => {
              if (activePanel !== tab) e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              if (activePanel !== tab) e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {activePanel === 'alerts' && <AlertPanel />}
        {activePanel === 'scenarios' && <ScenarioPanel />}
        {activePanel === 'history' && <HistoryPanel />}
      </div>
    </div>
  );
}
