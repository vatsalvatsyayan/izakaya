import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });
import express from 'express';
import cors from 'cors';
import http from 'http';
import { v4 as uuid } from 'uuid';
import { SimulationEngine } from './simulation/engine';
import { createRouter } from './api/router';
import { createWebSocketServer } from './websocket/connectionManager';
import { persistSessionSummaryToS3 } from './aws/s3AuditLogger';

const SESSION_ID = uuid();
const SERVER_START_TIME = new Date().toISOString();

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
  if (process.env.AWS_INTEGRATION_ENABLED === 'true') {
    console.log('[AWS] Integration enabled — S3, Bedrock, EventBridge, CloudWatch active');
  } else {
    console.log('[AWS] Integration disabled (AWS_INTEGRATION_ENABLED != true)');
  }
});

// Graceful shutdown — persist session summary to S3
async function shutdown() {
  console.log('\nShutting down...');
  engine.stop();

  const state = engine.getState();
  const alertHistory = engine.getAlertHistory();
  const changeLog = engine.getChangeLog();

  await persistSessionSummaryToS3({
    sessionId: SESSION_ID,
    startTime: SERVER_START_TIME,
    endTime: new Date().toISOString(),
    totalActionsCommitted: changeLog.length,
    totalCarbonEmittedKg: state.derivedMetrics.totalCarbonEmittedKg,
    totalWaterConsumedLiters: state.derivedMetrics.totalWaterConsumedLiters,
    criticalAlertsTriggered: alertHistory.filter(a => a.severity === 'critical').length,
  }).catch(() => {});

  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
