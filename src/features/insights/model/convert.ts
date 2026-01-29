import type { Block } from '@/entities/block';
import type { Insight, InsightTiming } from '@/entities/insight';
import { generateId } from '@/entities/block';

// Block을 Insight로 변환
export const blockToInsight = (
  block: Block,
  timing: InsightTiming
): Insight => ({
  id: generateId(),
  block: { ...block },
  timing,
  status: 'active',
  createdAt: new Date(),
});

// Insight의 block만 추출
export const insightToBlock = (insight: Insight): Block => insight.block;
