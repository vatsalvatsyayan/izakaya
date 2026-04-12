import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStore } from '../store/useDashboardStore';
import type { Alert, Recommendation } from '@izakaya/shared';

function AlertCard({ alert }: { alert: Alert }) {
  const [expanded, setExpanded] = useState(false);
  const selectLayer = useDashboardStore((s) => s.selectLayer);
  const borderColor = alert.severity === 'critical' ? 'var(--critical)' : 'var(--warning)';

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 6,
        padding: '12px 12px 12px 16px',
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>{alert.severity === 'critical' ? '\u2716' : '\u26A0'}</span>
        <span style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-primary)',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {alert.metricName}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {alert.severity}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {expanded ? '\u25B2' : '\u25BC'}
        </span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '8px 0' }}>
              {alert.message}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); selectLayer(alert.layerId); }}
              style={{
                background: 'none',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              View Layer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = useState(false);
  const selectLayer = useDashboardStore((s) => s.selectLayer);
  const setPendingLeverChange = useDashboardStore((s) => s.setPendingLeverChange);

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        borderLeft: '3px solid var(--action-primary)',
        borderRadius: 6,
        padding: '12px 12px 12px 16px',
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, color: 'var(--action-primary)' }}>{'\uD83D\uDCA1'}</span>
        <span style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-primary)',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {rec.title}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          {expanded ? '\u25B2' : '\u25BC'}
        </span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '8px 0' }}>
              {rec.body}
            </p>
            <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text-tertiary)', margin: '4px 0' }}>
              {rec.confidenceNote}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetch(`/api/recommendations/${rec.id}/dismiss`, { method: 'POST' });
                }}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 16px',
                  height: 28,
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Dismiss
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectLayer(rec.layerAffected);
                  setPendingLeverChange(rec.suggestedAction.lever, rec.suggestedAction.suggestedValue);
                }}
                style={{
                  background: 'var(--action-primary)',
                  border: 'none',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 16px',
                  height: 28,
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AlertPanel() {
  const alerts = useDashboardStore((s) => s.simulationState.activeAlerts);
  const recs = useDashboardStore((s) => s.simulationState.activeRecommendations);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {recs.filter((r: Recommendation) => r.status === 'active').map((rec: Recommendation) => (
        <RecommendationCard key={rec.id} rec={rec} />
      ))}
      {alerts.map((alert: Alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
      {alerts.length === 0 && recs.filter((r: Recommendation) => r.status === 'active').length === 0 && (
        <p style={{ color: 'var(--text-tertiary)', fontSize: 14, textAlign: 'center', padding: 20 }}>
          No active alerts or recommendations
        </p>
      )}
    </div>
  );
}
