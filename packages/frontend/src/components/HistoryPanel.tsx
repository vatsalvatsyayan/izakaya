import { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    a.download = 'change-log.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        onClick={downloadLog}
        style={{
          background: 'none',
          border: '1px solid var(--border-default)',
          color: 'var(--text-secondary)',
          fontSize: 12,
          fontWeight: 600,
          padding: '6px 16px',
          borderRadius: 6,
          cursor: 'pointer',
          alignSelf: 'flex-end',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Download Log
      </button>

      {entries.length === 0 && (
        <p style={{ color: 'var(--text-tertiary)', fontSize: 14, textAlign: 'center', padding: 20 }}>
          No actions recorded yet
        </p>
      )}

      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 6,
            padding: 12,
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {entry.operatorAction}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {new Date(entry.timestamp).toLocaleTimeString()}
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
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Tradeoff:</strong> {entry.tradeoffAcknowledgment.tradeoffText}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Community:</strong> {entry.tradeoffAcknowledgment.communityImpactText}
                  </p>
                  {entry.outcomeAfterFiveMinutes && (
                    <p style={{
                      margin: '4px 0',
                      color: entry.outcomeAfterFiveMinutes.projectionAccuracy === 'better'
                        ? 'var(--healthy-text)'
                        : entry.outcomeAfterFiveMinutes.projectionAccuracy === 'worse'
                        ? 'var(--critical-text)'
                        : 'var(--text-secondary)',
                    }}>
                      Outcome: {entry.outcomeAfterFiveMinutes.projectionAccuracy}
                    </p>
                  )}
                  {/* Bedrock AI Narrative */}
                  {entry.bedrockNarrative && (
                    <div style={{
                      marginTop: 8,
                      padding: '8px 12px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: 6,
                      lineHeight: 1.5,
                    }}>
                      <span style={{ fontSize: 10, color: '#6366F1', fontWeight: 600, display: 'block', marginBottom: 4 }}>
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
