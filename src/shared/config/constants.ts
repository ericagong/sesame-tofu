// Block 관련 상수
export const MAX_BLOCK_DEPTH = 1 as const;

// 드롭 영역 ID
export const DROPPABLE_IDS = {
  goal: 'goal',
  tasks: 'tasks',
  backlog: 'backlog',
  memos: 'memos',
  insights: 'insights',
  insightsBefore: 'insights-before',
  insightsDuring: 'insights-during',
  insightsAfter: 'insights-after',
} as const;

export type DroppableId = (typeof DROPPABLE_IDS)[keyof typeof DROPPABLE_IDS];
