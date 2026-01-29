import { generateId } from '@/entities/block';
import type { FlowState } from './types';

export const createInitialFlow = (): FlowState => ({
  id: generateId(),
  phase: 'plan',
  planStep: 1,
  probability: 50,
  createdAt: new Date(),
});
