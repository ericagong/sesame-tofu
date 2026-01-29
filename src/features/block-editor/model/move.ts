import type { Block, BlockDepth } from '@/entities/block';

// Re-export from entities for convenience
export { getBlockWithChildren, cloneBlocks } from '@/entities/block';

// 블록 재정렬
export const reorderBlocks = (blocks: Block[], fromIndex: number, toIndex: number): Block[] => {
  const updated = [...blocks];
  const [removed] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, removed);
  return updated;
};

// 블록 depth 조절
export const adjustBlocksDepth = (
  blocks: Block[],
  targetDepth: BlockDepth
): Block[] => {
  if (blocks.length === 0) return blocks;

  const firstBlockDepth = blocks[0].depth;

  return blocks.map((block, index) => {
    if (index === 0) {
      return { ...block, depth: targetDepth };
    }
    // 하위 블록들은 상대적 depth 유지
    const depthDiff = block.depth - firstBlockDepth;
    const newDepth = Math.min(1, targetDepth + depthDiff) as BlockDepth;
    return { ...block, depth: newDepth };
  });
};

// 블록 삽입
export const insertBlocksAt = (
  blocks: Block[],
  insertBlocks: Block[],
  index: number
): Block[] => {
  const result = [...blocks];
  result.splice(index, 0, ...insertBlocks);
  return result;
};

// 블록 제거
export const removeBlocks = (blocks: Block[], blockIds: Set<string>): Block[] => {
  return blocks.filter((b) => !blockIds.has(b.id));
};
