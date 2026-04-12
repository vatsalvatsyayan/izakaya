import { Router } from 'express';
import type { SimulationEngine } from '../simulation/engine';

export function createLogsController(engine: SimulationEngine): Router {
  const router = Router();

  router.get('/logs', (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 500);
    const offset = Number(req.query.offset) || 0;

    const allEntries = engine.getChangeLog();
    const entries = allEntries.slice(offset, offset + limit);

    res.json({ entries, total: allEntries.length });
  });

  return router;
}
