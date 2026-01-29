import type { Block } from '@/entities/block';

// Timing - Insight가 적용되는 시점
export type InsightTiming = 'before' | 'during' | 'after';

// InsightStatus - Insight 상태
export type InsightStatus = 'active' | 'archived';

// Insight - Reflect에서 생성되는 Block 래퍼
export type Insight = {
  id: string;
  block: Block;
  timing: InsightTiming;
  status: InsightStatus;
  createdAt: Date;
  archivedAt?: Date;
};
