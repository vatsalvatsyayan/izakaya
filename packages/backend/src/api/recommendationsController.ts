import { Router } from 'express';
import type { SimulationEngine } from '../simulation/engine';

export function createRecommendationsController(engine: SimulationEngine): Router {
  const router = Router();

  router.get('/recommendations', (_req, res) => {
    const state = engine.getState();
    res.json({ recommendations: state.activeRecommendations });
  });

  router.post('/recommendations/:id/dismiss', (req, res) => {
    const { id } = req.params;

    // Check if recommendation exists
    const state = engine.getState();
    const rec = state.activeRecommendations.find(r => r.id === id);
    if (!rec) {
      // Also check history
      const history = engine.getRecommendationHistory();
      const inHistory = history.find(r => r.id === id);
      if (!inHistory) {
        return res.status(404).json({ error: 'Recommendation not found', code: 'NOT_FOUND' });
      }
      return res.status(400).json({ error: 'Recommendation is not active', code: 'VALIDATION_ERROR' });
    }

    if (rec.status !== 'active') {
      return res.status(400).json({ error: 'Recommendation is not active', code: 'VALIDATION_ERROR' });
    }

    const success = engine.dismissRecommendation(id);
    if (success) {
      res.json({ success: true, recommendationId: id });
    } else {
      res.status(400).json({ error: 'Failed to dismiss recommendation', code: 'VALIDATION_ERROR' });
    }
  });

  return router;
}
