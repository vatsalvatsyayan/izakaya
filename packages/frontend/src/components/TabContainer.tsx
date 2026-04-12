import { useDashboardStore } from '../store/useDashboardStore';
import { AlertPanel } from './AlertPanel';
import { ActionPanel } from './ActionPanel';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { DecisionPanel } from './DecisionPanel';
import { TimelinePanel } from './TimelinePanel';
import { SensorPanel } from './SensorPanel';
import { ScenarioPanel } from './ScenarioPanel';

const TABS = [
  { id: 'sensors', label: 'Sensors' },
  { id: 'alerts', label: 'Alerts', badge: true },
  { id: 'controls', label: 'Controls' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'decision', label: 'Decision' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'timeline', label: 'Timeline' },
];

export function TabContainer() {
  const activeTab = useDashboardStore((s) => s.activeTab);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);
  const unackedAlerts = useDashboardStore(
    (s) => s.simulationState.activeAlerts.filter((a) => !a.acknowledged).length
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[#2d3148] overflow-x-auto flex-shrink-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.badge ? unackedAlerts : 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs whitespace-nowrap transition-colors flex items-center gap-1 ${
                isActive
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 leading-tight">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'sensors' && <SensorPanel />}
        {activeTab === 'alerts' && <AlertPanel />}
        {activeTab === 'controls' && <ActionPanel />}
        {activeTab === 'diagnostics' && <DiagnosticsPanel />}
        {activeTab === 'decision' && <DecisionPanel />}
        {activeTab === 'scenarios' && <ScenarioPanel />}
        {activeTab === 'timeline' && <TimelinePanel />}
      </div>
    </div>
  );
}
