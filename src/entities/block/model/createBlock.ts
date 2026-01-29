import { generateId } from '../lib/generateId';
import type { Block, BlockDepth } from './types';

export type CreateBlockOptions = {
  content?: string;
  depth?: BlockDepth;
  parentId?: string;
};

export const createBlock = (options: CreateBlockOptions = {}): Block => ({
  id: generateId(),
  content: options.content ?? '',
  depth: options.depth ?? 0,
  status: 'active',
  parentId: options.parentId,
});
