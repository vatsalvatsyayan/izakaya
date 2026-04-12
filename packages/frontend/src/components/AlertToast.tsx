import { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import type { Alert } from '@izakaya/shared';

export function AlertToast() {
  const alerts = useDashboardStore((s) => s.simulationState.activeAlerts);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);
  const [visible, setVisible] = useState<Alert | null>(null);
  const lastAlertIdRef = useRef<string | null>(null);

  useEffect(() => {
    const newest = alerts[alerts.length - 1];
    if (newest && newest.id !== lastAlertIdRef.current && !newest.acknowledged) {
      lastAlertIdRef.current = newest.id;
      setVisible(newest);
      const timer = setTimeout(() => setVisible(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  if (!visible) return null;

  const isCritical = visible.severity === 'critical';

  return (
    <div
      onClick={() => { setActiveTab('alerts'); setVisible(null); }}
      className={`absolute top-3 right-3 z-10 rounded-lg p-3 max-w-xs cursor-pointer ${
        isCritical
          ? 'bg-red-950/95 border border-red-700'
          : 'bg-orange-950/95 border border-orange-700'
      }`}
      style={{ animation: 'fadeSlideIn 0.25s ease-out' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
          isCritical ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'
        }`}>
          {visible.severity.toUpperCase()}
        </span>
        <span className="text-sm font-bold text-white">{visible.metricName}</span>
      </div>
      <p className="text-xs text-slate-300 line-clamp-2">{visible.message}</p>
      <p className="text-[10px] text-slate-500 mt-1">Click to view alerts</p>
    </div>
  );
}
