import { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import type { ChangeLogEntry } from '@izakaya/shared';

export function TimelinePanel() {
  const [entries, setEntries] = useState<ChangeLogEntry[]>([]);
  const tick = useDashboardStore((s) => s.simulationState.tick);

  function fetchLogs() {
    fetch('/api/logs')
      .then((r) => r.ok ? r.json() : { entries: [] })
      .then((data) => setEntries(data.entries || []))
      .catch(() => setEntries([]));
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (tick % 10 === 0) fetchLogs();
  }, [tick]);

  return (
    <div className="p-3">
      {entries.length === 0 ? (
        <p className="text-slate-500 text-xs text-center py-8">No actions recorded yet</p>
      ) : (
        <div className="space-y-1">
          {entries.slice().reverse().map((entry) => (
            <div key={entry.id} className="bg-[#252840] rounded-md p-2.5 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300 font-medium truncate flex-1">{entry.operatorAction}</span>
                <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {entry.tradeoffAcknowledgment?.tradeoffText && (
                <div className="text-[10px] text-slate-500">
                  {entry.tradeoffAcknowledgment.tradeoffText.slice(0, 100)}...
                </div>
              )}
              {entry.outcomeAfterFiveMinutes && (
                <span className={`text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded ${
                  entry.outcomeAfterFiveMinutes.projectionAccuracy === 'better'
                    ? 'bg-green-900/30 text-green-400'
                    : entry.outcomeAfterFiveMinutes.projectionAccuracy === 'worse'
                      ? 'bg-red-900/30 text-red-400'
                      : 'bg-slate-700/30 text-slate-400'
                }`}>
                  Outcome: {entry.outcomeAfterFiveMinutes.projectionAccuracy}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
