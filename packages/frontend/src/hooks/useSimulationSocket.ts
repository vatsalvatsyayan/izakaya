import { useEffect, useRef } from 'react';
import type { SimulationState, WebSocketMessage } from '@izakaya/shared';
import { useDashboardStore } from '../store/useDashboardStore';
import { useToastStore } from '../store/useToastStore';

export function useSimulationSocket() {
  const setSimulationState = useDashboardStore((s) => s.setSimulationState);
  const setConnectionStatus = useDashboardStore((s) => s.setConnectionStatus);
  const addToast = useToastStore((s) => s.addToast);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function connect() {
      setConnectionStatus('reconnecting');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        setConnectionStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const msg: WebSocketMessage = JSON.parse(event.data);
          if (msg.event === 'state:update') {
            setSimulationState(msg.data as SimulationState);
          } else if (msg.event === 'alert:new') {
            addToast({ type: 'error', title: 'New Alert', body: String((msg.data as { message?: string })?.message || '') });
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        const delay = Math.min(1000 * Math.pow(2, retryRef.current), 30000);
        retryRef.current++;
        timerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, [setSimulationState, setConnectionStatus, addToast]);
}
