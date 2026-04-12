import { useEffect, useRef } from 'react';
import type { SimulationState, ScenarioProgress, WebSocketMessage } from '@izakaya/shared';
import { useDashboardStore } from '../store/useDashboardStore';
import { useToastStore } from '../store/useToastStore';

// Module-level WebSocket reference so SpeedControl and other components can send messages
// without prop-drilling or additional store state.
let _wsInstance: WebSocket | null = null;

export function sendWsMessage(event: string, data: unknown): void {
  if (_wsInstance?.readyState === WebSocket.OPEN) {
    _wsInstance.send(JSON.stringify({ event, data }));
  }
}

export function useSimulationSocket() {
  const setSimulationState = useDashboardStore((s) => s.setSimulationState);
  const setConnectionStatus = useDashboardStore((s) => s.setConnectionStatus);
  const setScenarioProgress = useDashboardStore((s) => s.setScenarioProgress);
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
      _wsInstance = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        setConnectionStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const msg: WebSocketMessage = JSON.parse(event.data);
          switch (msg.event) {
            case 'state:update':
              setSimulationState(msg.data as SimulationState);
              break;
            case 'alert:new':
              addToast({
                type: 'error',
                title: 'New Alert',
                body: String((msg.data as { message?: string })?.message || ''),
              });
              break;
            case 'scenario:progress':
              setScenarioProgress(msg.data as ScenarioProgress);
              break;
            case 'ping':
              ws.send(JSON.stringify({ event: 'pong', data: {} }));
              break;
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        _wsInstance = null;
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
      _wsInstance = null;
    };
  }, [setSimulationState, setConnectionStatus, setScenarioProgress, addToast]);
}
