import { Router } from 'express';
import type { SimulationEngine } from '../simulation/engine';
import { createStateController } from './stateController';
import { createActionsController } from './actionsController';
import { createScenariosController } from './scenariosController';
import { createLogsController } from './logsController';
import { createRecommendationsController } from './recommendationsController';
import auditController from './auditController';

export function createRouter(engine: SimulationEngine): Router {
  const router = Router();

  router.use(createStateController(engine));
  router.use(createActionsController(engine));
  router.use(createScenariosController(engine));
  router.use(createLogsController(engine));
  router.use(createRecommendationsController(engine));
  router.use(auditController);

  return router;
}
