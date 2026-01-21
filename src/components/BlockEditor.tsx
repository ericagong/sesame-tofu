import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

import type { Block, DroppableId } from '@/types';
import { useBlockEditor } from '@/hooks/useBlockEditor';

import { BlockItem } from './BlockItem';

type BlockEditorProps = {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  placeholder?: string;
  maxDepth?: 0 | 1;
  showOrder?: boolean;
  droppableId: DroppableId;
  readonly?: boolean;
};

export const BlockEditor = ({
  blocks,
  onChange,
  placeholder = '뭘 해볼까요?',
  maxDepth = 1,
  showOrder = false,
  droppableId,
  readonly = false,
}: BlockEditorProps) => {
  const noopChange = () => {};
  const {
    setInputRef,
    updateBlock,
    toggleStatus,
    handleKeyDown,
    addBlock,
  } = useBlockEditor({ blocks, onChange: readonly ? noopChange : onChange, maxDepth });

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });


  return (
    <div
      ref={setNodeRef}
      className={`space-y-1 min-h-[40px] rounded transition-colors ${
        isOver ? 'bg-accent/50' : ''
      }`}
      data-droppable-id={droppableId}
    >
      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        {(() => {
          let depth0Index = 0;
          return blocks.map((block) => {
            // depth 0 블록에 순서 번호 부여 (완료 여부 관계없이)
            const order = showOrder && block.depth === 0
              ? ++depth0Index
              : undefined;
            return (
              <BlockItem
                key={block.id}
                block={block}
                blocks={blocks}
                order={order}
                showOrder={showOrder}
                setInputRef={setInputRef}
                onUpdate={readonly ? undefined : updateBlock}
                onToggle={readonly ? undefined : toggleStatus}
                onKeyDown={readonly ? undefined : handleKeyDown}
                readonly={readonly}
              />
            );
          });
        })()}
      </SortableContext>

      {blocks.length === 0 && !readonly && (
        <button
          onClick={() => addBlock(0)}
          className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {placeholder}
        </button>
      )}
    </div>
  );
};
