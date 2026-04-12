import { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import type { Alert, Recommendation } from '@izakaya/shared';

// ── Alert Card ─────────────────────────────────────────────────────────────
function AlertCard({ alert }: { alert: Alert }) {
  const [expanded, setExpanded] = useState(false);
  const acknowledgeAlert = useDashboardStore((s) => s.acknowledgeAlert);
  const setActiveTab     = useDashboardStore((s) => s.setActiveTab);
  const selectLayer      = useDashboardStore((s) => s.selectLayer);

  const isCritical  = alert.severity === 'critical';
  const accentColor = isCritical ? '#F87171' : '#FB923C';
  const bgColor     = isCritical ? 'rgba(239,68,68,0.06)' : 'rgba(249,115,22,0.06)';
  const badgeBg     = isCritical ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)';

  return (
    <div
      style={{
        borderLeft: `3px solid ${accentColor}`,
        background: alert.acknowledged ? '#111827' : bgColor,
        borderRadius: '0 6px 6px 0',
        marginBottom: 6,
        opacity: alert.acknowledged ? 0.45 : 1,
        transition: 'opacity 0.3s',
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: accentColor, boxShadow: `0 0 5px ${accentColor}` }}
          />
          <span className="text-[12px] font-semibold text-slate-200 truncate">{alert.metricName}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{ background: badgeBg, color: accentColor }}
          >
            {alert.severity}
          </span>
          <span className="text-[10px] text-slate-600 font-mono">
            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-slate-600 text-[10px]">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{alert.message}</p>
          <div className="flex items-center gap-2">
            <button
              className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors"
              onClick={(e) => { e.stopPropagation(); selectLayer(alert.layerId); setActiveTab('controls'); }}
            >
              → Open {alert.layerId} controls
            </button>
            {!alert.acknowledged && (
              <button
                onClick={(e) => { e.stopPropagation(); acknowledgeAlert(alert.id); }}
                className="text-[10px] text-slate-500 hover:text-slate-300 border border-[#334155] rounded px-2 py-0.5 ml-auto transition-colors"
              >
                Acknowledge
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Recommendation Card ────────────────────────────────────────────────────
export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = useState(false);
  const selectLayer          = useDashboardStore((s) => s.selectLayer);
  const setPendingLeverChange = useDashboardStore((s) => s.setPendingLeverChange);
  const setActiveTab         = useDashboardStore((s) => s.setActiveTab);

  return (
    <div
      style={{
        borderLeft: '3px solid #38BDF8',
        background: 'rgba(56,189,248,0.05)',
        borderRadius: '0 6px 6px 0',
        marginBottom: 6,
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-sky-400" style={{ boxShadow: '0 0 5px #38BDF8' }} />
          <span className="text-[12px] font-semibold text-slate-200 truncate">{rec.title}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-sky-400"
            style={{ background: 'rgba(56,189,248,0.15)' }}>
            Rec
          </span>
          <span className="text-slate-600 text-[10px]">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          <p className="text-[11px] text-slate-400 leading-relaxed mb-1">{rec.body}</p>
          {rec.confidenceNote && (
            <p className="text-[10px] italic text-slate-600 mb-3">{rec.confidenceNote}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetch(`/api/recommendations/${rec.id}/dismiss`, { method: 'POST' });
              }}
              className="text-[11px] font-semibold text-slate-400 border border-[#334155] rounded px-3 py-1 hover:text-slate-200 hover:border-[#475569] transition-colors"
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
              className="text-[11px] font-bold text-white rounded px-3 py-1 transition-colors"
              style={{ background: '#0EA5E9' }}
            >
              Apply Suggestion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Alert Panel ────────────────────────────────────────────────────────────
export function AlertPanel() {
  const alerts    = useDashboardStore((s) => s.simulationState.activeAlerts);
  const recs      = useDashboardStore((s) => s.simulationState.activeRecommendations);
  const activeRecs = recs.filter((r: Recommendation) => r.status === 'active');
  const isEmpty   = alerts.length === 0 && activeRecs.length === 0;

  return (
    <div className="p-3">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            ✓
          </div>
          <span className="text-slate-500 text-[12px]">All systems nominal</span>
        </div>
      ) : (
        <>
          {activeRecs.length > 0 && (
            <div className="mb-1">
              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-1 mb-2">
                Recommendations
              </div>
              {activeRecs.map((rec: Recommendation) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
          )}
          {alerts.length > 0 && (
            <div>
              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-1 mb-2">
                Active Alerts
              </div>
              {alerts.map((alert: Alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
