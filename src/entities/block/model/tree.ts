import type { Block } from './types';

// 상위 블록과 하위 블록들을 함께 가져오기
export const getBlockWithChildren = (blocks: Block[], index: number): Block[] => {
  const block = blocks[index];
  if (block.depth !== 0) return [block];

  const result: Block[] = [block];
  for (let i = index + 1; i < blocks.length; i++) {
    if (blocks[i].depth === 0) break;
    result.push(blocks[i]);
  }
  return result;
};

// 블록 ID로 인덱스 찾기
export const findBlockIndex = (blocks: Block[], blockId: string): number => {
  return blocks.findIndex((b) => b.id === blockId);
};

// 부모 블록 찾기
export const findParentBlock = (blocks: Block[], block: Block): Block | null => {
  if (!block.parentId) return null;
  return blocks.find((b) => b.id === block.parentId) ?? null;
};

// 자식 블록들 찾기
export const findChildBlocks = (blocks: Block[], parentId: string): Block[] => {
  return blocks.filter((b) => b.parentId === parentId);
};
