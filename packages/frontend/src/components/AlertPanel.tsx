import { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import type { Alert, Recommendation } from '@izakaya/shared';

function AlertCard({ alert }: { alert: Alert }) {
  const [expanded, setExpanded] = useState(false);
  const acknowledgeAlert = useDashboardStore((s) => s.acknowledgeAlert);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);
  const selectLayer = useDashboardStore((s) => s.selectLayer);

  const isCritical = alert.severity === 'critical';
  const severityBorder = isCritical ? 'border-red-500' : 'border-orange-500';
  const severityDot = isCritical ? 'bg-red-500' : 'bg-orange-500';
  const severityBadge = isCritical ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300';

  return (
    <div className={`border-l-2 ${severityBorder} bg-[#252840] rounded-r-md mb-1 hover:bg-[#2a2e48] transition-colors ${alert.acknowledged ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between px-3 py-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${severityDot}`} />
          <span className="text-sm text-white truncate">{alert.metricName}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${severityBadge}`}>
            {alert.severity.toUpperCase()}
          </span>
          <span className="text-[10px] text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          <p className="text-xs text-slate-400">{alert.message}</p>
          <div className="mt-2">
            <div className="text-[11px] text-slate-500 uppercase mb-1">Recommended Actions</div>
            <button
              className="text-xs text-blue-400 hover:text-blue-300"
              onClick={(e) => { e.stopPropagation(); selectLayer(alert.layerId); setActiveTab('controls'); }}
            >
              → View {alert.layerId} layer controls
            </button>
          </div>
          {!alert.acknowledged && (
            <button
              onClick={(e) => { e.stopPropagation(); acknowledgeAlert(alert.id); }}
              className="text-[10px] text-slate-500 hover:text-slate-300 border border-[#3d4168] rounded px-2 py-0.5 mt-2"
            >
              Acknowledge
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = useState(false);
  const selectLayer = useDashboardStore((s) => s.selectLayer);
  const setPendingLeverChange = useDashboardStore((s) => s.setPendingLeverChange);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);

  return (
    <div className="border-l-2 border-blue-500 bg-[#252840] rounded-r-md mb-1 hover:bg-[#2a2e48] transition-colors">
      <div className="flex items-center justify-between px-3 py-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-500" />
          <span className="text-sm text-white truncate">{rec.title}</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 flex-shrink-0 ml-2">
          REC
        </span>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          <p className="text-xs text-slate-400 mb-2">{rec.body}</p>
          <p className="text-[11px] italic text-slate-500 mb-3">{rec.confidenceNote}</p>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetch(`/api/recommendations/${rec.id}/dismiss`, { method: 'POST' });
              }}
              className="text-[11px] text-slate-400 border border-[#3d4168] rounded px-3 py-1 hover:text-slate-200"
            >
              Dismiss
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                selectLayer(rec.layerAffected);
                setPendingLeverChange(rec.suggestedAction.lever, rec.suggestedAction.suggestedValue);
                setActiveTab('controls');
              }}
              className="text-[11px] text-white bg-blue-600 hover:bg-blue-700 rounded px-3 py-1"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AlertPanel() {
  const alerts = useDashboardStore((s) => s.simulationState.activeAlerts);
  const recs = useDashboardStore((s) => s.simulationState.activeRecommendations);
  const activeRecs = recs.filter((r: Recommendation) => r.status === 'active');

  const isEmpty = alerts.length === 0 && activeRecs.length === 0;

  return (
    <div className="p-3">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-slate-700 text-4xl mb-3">🛡</div>
          <span className="text-slate-500 text-sm">No active alerts</span>
        </div>
      ) : (
        <>
          {activeRecs.map((rec: Recommendation) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
          {alerts.map((alert: Alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </>
      )}
    </div>
  );
}
