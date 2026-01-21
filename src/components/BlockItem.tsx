import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Square, CheckSquare } from 'lucide-react';

import type { Block } from '@/types';
import { cn } from '@/lib/utils';

type BlockItemProps = {
  block: Block;
  blocks: Block[];
  order?: number;
  setInputRef: (id: string, el: HTMLInputElement | null) => void;
  onUpdate: (id: string, content: string) => void;
  onToggle: (id: string) => void;
  onKeyDown: (id: string, e: React.KeyboardEvent<HTMLInputElement>, blocks: Block[]) => void;
  disabled?: boolean;
};

export const BlockItem = ({
  block,
  blocks,
  order,
  setInputRef,
  onUpdate,
  onToggle,
  onKeyDown,
  disabled = false,
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
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDeleted = block.status === 'deleted';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-1 py-0.5 rounded transition-all',
        isDragging && 'opacity-50 bg-accent shadow-lg z-50',
        block.depth === 1 && 'ml-6'
      )}
    >
      {/* 드래그 핸들 - hover 시에만 보임 */}
      {!disabled && (
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground transition-opacity"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      {/* disabled일 때 공간 유지 */}
      {disabled && <div className="w-5" />}

      {/* 순서 번호 */}
      {order !== undefined && (
        <span className="w-5 text-center text-sm text-muted-foreground">
          {order}
        </span>
      )}

      {/* 체크박스 */}
      <button
        onClick={() => onToggle(block.id)}
        className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
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
        onChange={(e) => onUpdate(block.id, e.target.value)}
        onKeyDown={(e) => onKeyDown(block.id, e, blocks)}
        className={cn(
          'flex-1 bg-transparent outline-none text-sm',
          isDeleted && 'line-through text-muted-foreground'
        )}
        placeholder="내용을 입력하세요"
        disabled={isDeleted}
      />
    </div>
  );
};
