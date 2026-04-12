import { Router } from 'express';
import type { SimulationEngine } from '../simulation/engine';
import { SCENARIO_DEFINITIONS } from '../simulation/scenarios';

export function createScenariosController(engine: SimulationEngine): Router {
  const router = Router();

  router.get('/scenarios', (_req, res) => {
    res.json({ scenarios: SCENARIO_DEFINITIONS });
  });

  router.post('/scenarios/:id/activate', (req, res) => {
    const { id } = req.params;
    const { mode } = req.body;

    // Validate scenario exists
    const scenario = SCENARIO_DEFINITIONS.find(s => s.id === id);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found', code: 'NOT_FOUND' });
    }

    // Validate mode
    if (mode !== 'simulation' && mode !== 'live') {
      return res.status(400).json({ error: "Invalid mode. Must be 'simulation' or 'live'", code: 'VALIDATION_ERROR' });
    }

    // Check no active scenario
    const state = engine.getState();
    if (state.activeScenario) {
      return res.status(409).json({ error: 'Another scenario is already active', code: 'CONFLICT' });
    }

    engine.activateScenarioById(id, mode);
    res.json({
      success: true,
      scenarioId: id,
      estimatedDurationTicks: scenario.totalDurationTicks,
    });
  });

  return router;
}
