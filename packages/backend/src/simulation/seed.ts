import type { SimulationState } from '@izakaya/shared';
import { SEED_STATE } from '@izakaya/shared';

export function createSeedState(): SimulationState {
  return JSON.parse(JSON.stringify(SEED_STATE)) as SimulationState;
}
