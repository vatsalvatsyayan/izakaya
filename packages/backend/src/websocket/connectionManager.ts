import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { HEARTBEAT_INTERVAL_MS } from '@izakaya/shared';
import type { SimulationEngine } from '../simulation/engine';

interface ClientInfo {
  ws: WebSocket;
  isAlive: boolean;
}

const VALID_SPEEDS = [1, 10, 30, 60, 100, 200];

export function createWebSocketServer(server: Server, engine?: SimulationEngine) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clients = new Set<ClientInfo>();

  wss.on('connection', (ws: WebSocket) => {
    const client: ClientInfo = { ws, isAlive: true };
    clients.add(client);
    console.log(`WebSocket client connected (${clients.size} total)`);

    ws.on('message', (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.event === 'pong') {
          client.isAlive = true;
        } else if (msg.event === 'speed:set' && engine) {
          const speed = msg.data?.speed;
          if (typeof speed === 'number' && VALID_SPEEDS.includes(speed)) {
            engine.setTickInterval(Math.round(2000 / speed));
          }
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      clients.delete(client);
      console.log(`WebSocket client disconnected (${clients.size} total)`);
    });

    ws.on('error', () => {
      clients.delete(client);
    });
  });

  // Heartbeat
  const heartbeatInterval = setInterval(() => {
    for (const client of clients) {
      if (!client.isAlive) {
        client.ws.terminate();
        clients.delete(client);
        continue;
      }
      client.isAlive = false;
      const pingMsg = JSON.stringify({
        event: 'ping',
        data: {},
        timestamp: new Date().toISOString(),
      });
      client.ws.send(pingMsg);
    }
  }, HEARTBEAT_INTERVAL_MS);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  function broadcast(event: string, data: unknown): void {
    const message = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
    });
    for (const client of clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    }
  }

  return { wss, broadcast };
}
