import type { Block } from '@/entities/block';

// Step 1 완료 조건: 목표가 있고 내용이 있어야 함
export const isStep1Done = (goal: Block | null): boolean => {
  return !!goal?.content;
};

// Step 2 완료 조건: 과제가 1개 이상 있어야 함
export const isStep2Done = (tasks: Block[]): boolean => {
  return tasks.length > 0;
};

// Step 3 완료 조건: 실행 가능성이 80% 이상이어야 함
export const isStep3Done = (probability: number): boolean => {
  return probability >= 80;
};

// 완료된 depth 0 과제 수
export const getCompletedTaskCount = (tasks: Block[]): number => {
  return tasks.filter((t) => t.depth === 0 && t.status === 'deleted').length;
};

// 전체 depth 0 과제 수
export const getTotalTaskCount = (tasks: Block[]): number => {
  return tasks.filter((t) => t.depth === 0).length;
};

// 분류되지 않은 메모 수
export const getUnclassifiedMemoCount = (memos: Block[]): number => {
  return memos.filter((m) => m.status === 'active').length;
};

// 모든 메모가 분류되었는지
export const areAllMemosClassified = (memos: Block[]): boolean => {
  return getUnclassifiedMemoCount(memos) === 0;
};
