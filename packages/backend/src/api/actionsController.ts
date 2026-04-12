import { Router } from 'express';
import type { SimulationEngine } from '../simulation/engine';
import { LEVER_DEFINITIONS } from '@izakaya/shared';
import { persistActionToS3 } from '../aws/s3AuditLogger';
import { emitActionCommitMetric } from '../aws/cloudWatchEmitter';

const VALID_LAYERS = ['power', 'cooling', 'gpu', 'workload', 'location'];
const BOOLEAN_LEVERS = ['renewablePriorityMode', 'waterRecirculationMode'];

export function createActionsController(engine: SimulationEngine): Router {
  const router = Router();

  router.post('/actions', (req, res) => {
    const { layerId, leverId, previousValue, newValue, tradeoffAcknowledgment } = req.body;

    // Validate layerId
    if (!VALID_LAYERS.includes(layerId)) {
      return res.status(400).json({ error: 'Invalid layerId', code: 'VALIDATION_ERROR' });
    }

    // Validate leverId
    const leverDef = LEVER_DEFINITIONS.find(l => l.id === leverId && l.layerId === layerId);
    if (!leverDef) {
      return res.status(400).json({ error: `Invalid leverId for layer '${layerId}'`, code: 'VALIDATION_ERROR' });
    }

    // Validate newValue range
    if (typeof newValue !== 'number' || newValue < leverDef.minValue || newValue > leverDef.maxValue) {
      return res.status(400).json({
        error: `newValue ${newValue} is outside valid range [${leverDef.minValue}, ${leverDef.maxValue}] for lever '${leverId}'`,
        code: 'VALIDATION_ERROR',
      });
    }

    // Boolean levers
    if (BOOLEAN_LEVERS.includes(leverId) && newValue !== 0 && newValue !== 1) {
      return res.status(400).json({ error: 'Boolean lever value must be 0 or 1', code: 'VALIDATION_ERROR' });
    }

    // Tradeoff acknowledgment
    if (!tradeoffAcknowledgment) {
      return res.status(400).json({ error: 'Tradeoff acknowledgment required', code: 'VALIDATION_ERROR' });
    }
    if (tradeoffAcknowledgment.acknowledged !== true) {
      return res.status(400).json({ error: 'Tradeoff must be acknowledged', code: 'VALIDATION_ERROR' });
    }

    // Simulation mode check
    const state = engine.getState();
    if (state.mode === 'simulation') {
      return res.status(409).json({ error: 'Cannot commit actions during active simulation', code: 'CONFLICT' });
    }

    const response = engine.commitAction(req.body);

    // AWS integrations — fire-and-forget, non-blocking
    const entry = engine.getChangeLog().find(e => e.id === response.changeLogEntryId);
    if (entry) {
      persistActionToS3(entry).then(s3Key => {
        if (s3Key) entry.s3Key = s3Key;
      }).catch(() => {});
      emitActionCommitMetric(entry).catch(() => {});
    }

    res.json(response);
  });

  return router;
}
