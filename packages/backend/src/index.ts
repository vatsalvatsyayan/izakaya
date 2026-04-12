import express from 'express';
import cors from 'cors';
import http from 'http';
import { SimulationEngine } from './simulation/engine';
import { createRouter } from './api/router';
import { createWebSocketServer } from './websocket/connectionManager';

const app = express();
app.use(cors());
app.use(express.json());

const engine = new SimulationEngine();
app.use('/api', createRouter(engine));

const server = http.createServer(app);
const { broadcast } = createWebSocketServer(server, engine);

engine.start(broadcast);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
});
