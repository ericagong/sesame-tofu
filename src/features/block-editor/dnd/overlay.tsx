import { DragOverlay } from '@dnd-kit/core';
import type { Block } from '@/entities/block';

type BlockDragOverlayProps = {
  activeBlocks: Block[];
};

export const BlockDragOverlay = ({ activeBlocks }: BlockDragOverlayProps) => {
  if (activeBlocks.length === 0) return null;

  return (
    <DragOverlay>
      <div className="space-y-1 px-2 py-1 bg-background border rounded shadow-lg">
        {activeBlocks.map((block) => (
          <div
            key={block.id}
            className={`text-sm ${block.depth === 1 ? 'ml-4' : ''}`}
          >
            {block.content || '(빈 블록)'}
          </div>
        ))}
      </div>
    </DragOverlay>
  );
};
