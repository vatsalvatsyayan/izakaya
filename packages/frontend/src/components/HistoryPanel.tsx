import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChangeLogEntry } from '@izakaya/shared';

export function HistoryPanel() {
  const [entries, setEntries] = useState<ChangeLogEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    function fetchLogs() {
      fetch('/api/logs')
        .then((r) => r.ok ? r.json() : { entries: [] })
        .then((data) => setEntries(data.entries || []))
        .catch(() => setEntries([]));
    }
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  function downloadLog() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Spec §7.3: filename includes timestamp
    a.download = `ai-factory-change-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Spec §7.2: Immutability indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0 4px',
        borderBottom: '1px solid #1E3A5F',
        marginBottom: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: 11 }}>
          <span>{'\uD83D\uDD12'}</span>
          <span>Append-only &bull; Cannot be edited or deleted</span>
        </div>
        {/* Spec §7.3: Download button */}
        <button
          onClick={downloadLog}
          style={{
            background: 'none',
            border: '1px solid #334155',
            color: '#94A3B8',
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Download Log (JSON)
        </button>
      </div>

      {entries.length === 0 && (
        <p style={{ color: '#475569', fontSize: 14, textAlign: 'center', padding: 20 }}>
          No actions recorded yet
        </p>
      )}

      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          style={{
            background: '#1E293B',
            border: '1px solid #334155',
            borderRadius: 6,
            padding: 12,
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.4 }}>
              {entry.operatorAction}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {entry.s3Key && (
                <span style={{
                  fontSize: 10,
                  color: '#F59E0B',
                  padding: '2px 6px',
                  border: '1px solid #F59E0B',
                  borderRadius: 4,
                }}>
                  S3
                </span>
              )}
              {/* Spec §7.1: ISO timestamp in monospace */}
              <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
                {new Date(entry.timestamp).toISOString()}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {expandedId === entry.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Spec §7.1: Full tradeoff statement */}
                  <LogField label="Tradeoff" value={entry.tradeoffAcknowledgment.tradeoffText} />
                  <LogField label="Community Impact" value={entry.tradeoffAcknowledgment.communityImpactText} />
                  <LogField label="End-User Impact" value={entry.tradeoffAcknowledgment.endUserImpactText} />

                  {/* Outcome after 5 min */}
                  {entry.outcomeAfterFiveMinutes && (
                    <div style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: '#0F172A',
                      border: '1px solid #1E3A5F',
                    }}>
                      <span style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        5-min Outcome
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          color: entry.outcomeAfterFiveMinutes.projectionAccuracy === 'better'
                            ? '#22C55E'
                            : entry.outcomeAfterFiveMinutes.projectionAccuracy === 'worse'
                            ? '#EF4444'
                            : '#94A3B8',
                          background: entry.outcomeAfterFiveMinutes.projectionAccuracy === 'better'
                            ? '#22C55E22'
                            : entry.outcomeAfterFiveMinutes.projectionAccuracy === 'worse'
                            ? '#EF444422'
                            : '#94A3B822',
                        }}>
                          {entry.outcomeAfterFiveMinutes.projectionAccuracy === 'better' ? 'Better' :
                           entry.outcomeAfterFiveMinutes.projectionAccuracy === 'worse' ? 'Worse' : 'Matched'}
                        </span>
                        <span style={{ fontSize: 11, color: '#64748B' }}>
                          {JSON.stringify(entry.outcomeAfterFiveMinutes.metrics)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Bedrock AI Narrative */}
                  {entry.bedrockNarrative && (
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      borderRadius: 6,
                      lineHeight: 1.5,
                      fontSize: 12,
                      color: '#CBD5E1',
                    }}>
                      <span style={{ fontSize: 10, color: '#6366F1', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                        ✦ AWS Bedrock · AI Impact Narrative
                      </span>
                      {entry.bedrockNarrative}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function LogField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
        {value}
      </span>
    </div>
  );
}
