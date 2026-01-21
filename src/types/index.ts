// Block - 모든 항목의 기본 단위
export type Block = {
  id: string;
  content: string;
  depth: 0 | 1;
  status: 'active' | 'deleted';
  parentId?: string;
};

// LeverageBlock - Keep/Try 영역의 Block
export type LeverageBlock = {
  id: string;
  block: Block;
  timing: 'before' | 'during' | 'after';
  source: 'keep' | 'try';
  status: 'active' | 'archived';
  createdAt: Date;
  archivedAt?: Date;
};

// Phase 타입
export type Phase = 'plan' | 'execute' | 'reflect';

// Plan Step 타입
export type PlanStep = 1 | 2 | 3 | 4;

// CycleState - 사이클 상태
export type CycleState = {
  id: string;
  phase: Phase;
  planStep: PlanStep;
  goal: Block | null;
  tasks: Block[];
  backlog: Block[];
  memos: Block[];
  keeps: LeverageBlock[];
  tries: LeverageBlock[];
  probability: number;
  createdAt: Date;
};

// 드롭 영역 ID
export type DroppableId = 'goal' | 'tasks' | 'backlog' | 'memos' | 'keeps' | 'tries';

// 타이머 상태
export type TimerState = {
  remaining: number;
  isRunning: boolean;
  isRest: boolean;
  restDuration: 10 | 20 | null;
};
