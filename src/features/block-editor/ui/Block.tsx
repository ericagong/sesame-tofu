import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Square, CheckSquare } from 'lucide-react';

import type { Block as BlockType } from '@/entities/pomodoro/model';
import type { DroppableId } from '@/app/providers/DndProvider';
import { cn } from '@/shared/lib/utils';
import { useDndState } from '@/shared/lib/dnd-context';
import { useBlockEditor } from '../model/useBlockEditor';
import { DroppableContainer, AddItemButton, DragHandle } from '@/shared/primitives';

// ============ Types ============

type BlockItemProps = {
  block: BlockType;
  blocks: BlockType[];
  order?: number;
  showOrder?: boolean;
  setInputRef: (id: string, el: HTMLInputElement | null) => void;
  onUpdate?: (id: string, content: string) => void;
  onToggle?: (id: string) => void;
  onKeyDown?: (id: string, e: React.KeyboardEvent<HTMLInputElement>, blocks: BlockType[]) => void;
  readonly?: boolean;
};

type BlockEditorProps = {
  blocks: BlockType[];
  onChange: (blocks: BlockType[]) => void;
  placeholder?: string;
  maxDepth?: 0 | 1;
  showOrder?: boolean;
  droppableId: DroppableId;
  readonly?: boolean;
};

// ============ Components ============

const BlockItem = ({
  block,
  blocks,
  order,
  showOrder = false,
  setInputRef,
  onUpdate,
  onToggle,
  onKeyDown,
  readonly = false,
}: BlockItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    disabled: readonly,
  });

  const { overId, activeId, dropDepth } = useDndState();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDeleted = block.status === 'deleted';
  const isOver = overId === block.id && activeId !== block.id;

  return (
    <div className="relative" data-block-id={block.id}>
      {isOver && (
        <div
          className={cn(
            'absolute -top-0.5 right-0 h-0.5 bg-primary rounded-full transition-all',
            dropDepth === 1 ? 'left-12' : 'left-0'
          )}
        />
      )}
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group flex items-center gap-1 py-0.5 rounded transition-all',
          isDragging && 'opacity-50 bg-accent shadow-lg z-50',
          block.depth === 1 && (showOrder ? 'ml-11' : 'ml-6')
        )}
      >
        {/* 드래그 핸들 - hover 시에만 보임 */}
        {!readonly && <DragHandle attributes={attributes} listeners={listeners} />}

        {/* readonly일 때 공간 유지 */}
        {readonly && <div className="w-5" />}

        {/* 순서 번호 */}
        {order !== undefined && (
          <span className="w-5 text-center text-sm text-muted-foreground">{order}</span>
        )}

        {/* 체크박스 */}
        <button
          onClick={() => onToggle?.(block.id)}
          disabled={readonly}
          className={cn(
            'p-0.5 text-muted-foreground transition-colors',
            !readonly && 'hover:text-foreground'
          )}
        >
          {isDeleted ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>

        {/* 입력 */}
        <input
          ref={(el) => setInputRef(block.id, el)}
          type="text"
          value={block.content}
          onChange={(e) => onUpdate?.(block.id, e.target.value)}
          onKeyDown={(e) => onKeyDown?.(block.id, e, blocks)}
          className={cn(
            'flex-1 bg-transparent outline-none text-sm',
            isDeleted && 'line-through text-muted-foreground'
          )}
          placeholder="내용을 입력하세요..."
          disabled={isDeleted || readonly}
        />
      </div>
    </div>
  );
};
BlockItem.displayName = 'Block.Item';

const BlockEditor = ({
  blocks,
  onChange,
  placeholder = '뭘 해볼까요?',
  maxDepth = 1,
  showOrder = false,
  droppableId,
  readonly = false,
}: BlockEditorProps) => {
  const noopChange = () => {};
  const { setInputRef, updateBlock, toggleStatus, handleKeyDown, addBlock } = useBlockEditor({
    blocks,
    onChange: readonly ? noopChange : onChange,
    maxDepth,
  });

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  return (
    <DroppableContainer setNodeRef={setNodeRef} isOver={isOver} data-droppable-id={droppableId}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        {(() => {
          let depth0Index = 0;
          return blocks.map((block) => {
            // depth 0 블록에 순서 번호 부여 (완료 여부 관계없이)
            const order = showOrder && block.depth === 0 ? ++depth0Index : undefined;
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
        <AddItemButton onClick={() => addBlock(0)}>{placeholder}</AddItemButton>
      )}
    </DroppableContainer>
  );
};
BlockEditor.displayName = 'Block.Editor';

// ============ Export ============

const Block = {
  Editor: BlockEditor,
  Item: BlockItem,
};

export default Block;
