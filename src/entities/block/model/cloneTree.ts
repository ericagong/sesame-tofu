import { generateId } from '../lib/generateId';
import type { Block } from './types';

// Block 배열을 복제 (새 ID 부여)
export const cloneBlocks = (blocks: Block[]): Block[] => {
  const idMap = new Map<string, string>();

  // 1. 새 ID 매핑 생성
  blocks.forEach((block) => {
    idMap.set(block.id, generateId());
  });

  // 2. 블록 복제 with 새 ID와 parentId 업데이트
  return blocks.map((block) => ({
    ...block,
    id: idMap.get(block.id)!,
    parentId: block.parentId ? idMap.get(block.parentId) : undefined,
  }));
};

// 단일 Block 복제
export const cloneBlock = (block: Block): Block => ({
  ...block,
  id: generateId(),
});
