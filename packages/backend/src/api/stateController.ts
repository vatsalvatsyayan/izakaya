import { Router } from 'express';
import type { SimulationEngine } from '../simulation/engine';

export function createStateController(engine: SimulationEngine): Router {
  const router = Router();

  router.get('/state', (_req, res) => {
    res.json({ state: engine.getState() });
  });

  return router;
}
