import { useEffect, useState } from 'react';

type Status = 'connected' | 'degraded' | 'offline';

const COLORS: Record<Status, string> = {
  connected: '#22C55E',
  degraded: '#F59E0B',
  offline: '#6B7280',
};

const LABELS: Record<Status, string> = {
  connected: 'AWS Live',
  degraded: 'AWS Degraded',
  offline: 'AWS Offline',
};

export function AWSStatusBadge() {
  const [status, setStatus] = useState<Status>('offline');

  useEffect(() => {
    const check = () => {
      fetch('/api/audit/logs?date=' + new Date().toISOString().split('T')[0])
        .then((r) => {
          if (!r.ok) { setStatus('degraded'); return; }
          return r.json();
        })
        .then((data) => {
          if (!data) return;
          setStatus(data.source === 'aws-s3' ? 'connected' : 'degraded');
        })
        .catch(() => setStatus('offline'));
    };

    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  const color = COLORS[status];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 8px',
      borderRadius: 9999,
      backgroundColor: '#1E293B',
      border: `1px solid ${color}`,
      fontSize: 11,
      color,
      fontWeight: 500,
      flexShrink: 0,
    }}>
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: status === 'connected' ? `0 0 6px ${color}` : 'none',
      }} />
      {LABELS[status]}
    </div>
  );
}
