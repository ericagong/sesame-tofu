import type { StateCreator } from 'zustand';

// Block - 모든 항목의 기본 단위
export type Block = {
  id: string;
  content: string;
  depth: 0 | 1;
  status: 'active' | 'deleted';
  parentId?: string;
};

export type BlocksSlice = {
  goal: Block | null;
  tasks: Block[];
  backlog: Block[];
  memos: Block[];
  setGoal: (goal: Block | null) => void;
  setTasks: (tasks: Block[]) => void;
  setBacklog: (backlog: Block[]) => void;
  setMemos: (memos: Block[]) => void;
};

export const createBlocksSlice: StateCreator<BlocksSlice, [], [], BlocksSlice> = (set) => ({
  goal: null,
  tasks: [],
  backlog: [],
  memos: [],

  setGoal: (goal) => set({ goal }),
  setTasks: (tasks) => set({ tasks }),
  setBacklog: (backlog) => set({ backlog }),
  setMemos: (memos) => set({ memos }),
});
