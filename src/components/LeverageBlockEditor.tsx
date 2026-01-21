import { useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateId } from '@/utils';

import type { LeverageBlock } from '@/types';

type LeverageBlockEditorProps = {
  items: LeverageBlock[];
  onAdd: (item: LeverageBlock) => void;
  onContentChange: (id: string, content: string) => void;
  onTimingChange: (id: string, timing: 'before' | 'during' | 'after') => void;
  onRemove: (id: string) => void;
  source: 'keep' | 'try';
  droppableId: 'keeps' | 'tries';
  placeholder?: string;
};

export const LeverageBlockEditor = ({
  items,
  onAdd,
  onContentChange,
  onTimingChange,
  onRemove,
  source,
  droppableId,
  placeholder = '내용을 입력하세요...',
}: LeverageBlockEditorProps) => {
  const inputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  const setInputRef = (id: string, el: HTMLInputElement | null) => {
    if (el) {
      inputRefs.current.set(id, el);
    } else {
      inputRefs.current.delete(id);
    }
  };

  const handleKeyDown = (id: string, e: React.KeyboardEvent<HTMLInputElement>, content: string) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      // 새 항목 추가
      const newItem: LeverageBlock = {
        id: generateId(),
        block: {
          id: generateId(),
          content: '',
          depth: 0,
          status: 'active',
        },
        timing: 'before',
        source,
        status: 'active',
        createdAt: new Date(),
      };
      onAdd(newItem);
      // 포커스를 새 항목으로 이동
      setTimeout(() => {
        const newInput = inputRefs.current.get(newItem.id);
        newInput?.focus();
      }, 0);
    } else if (e.key === 'Backspace' && !content) {
      e.preventDefault();
      // 빈 항목 삭제
      const currentIndex = items.findIndex((item) => item.id === id);
      onRemove(id);
      // 이전 항목으로 포커스 이동
      if (currentIndex > 0) {
        const prevItem = items[currentIndex - 1];
        setTimeout(() => {
          const prevInput = inputRefs.current.get(prevItem.id);
          prevInput?.focus();
        }, 0);
      }
    }
  };

  const handleAddClick = () => {
    const newItem: LeverageBlock = {
      id: generateId(),
      block: {
        id: generateId(),
        content: '',
        depth: 0,
        status: 'active',
      },
      timing: 'before',
      source,
      status: 'active',
      createdAt: new Date(),
    };
    onAdd(newItem);
    setTimeout(() => {
      const newInput = inputRefs.current.get(newItem.id);
      newInput?.focus();
    }, 0);
  };

  return (
    <div
      ref={setNodeRef}
      className={`space-y-1 min-h-[40px] rounded transition-colors ${
        isOver ? 'bg-accent/50' : ''
      }`}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item) => (
          <LeverageBlockItem
            key={item.id}
            item={item}
            setInputRef={setInputRef}
            onContentChange={onContentChange}
            onTimingChange={onTimingChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
          />
        ))}
      </SortableContext>

      {items.length === 0 && (
        <button
          onClick={handleAddClick}
          className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {placeholder}
        </button>
      )}
    </div>
  );
};

// 개별 항목 컴포넌트
type LeverageBlockItemProps = {
  item: LeverageBlock;
  setInputRef: (id: string, el: HTMLInputElement | null) => void;
  onContentChange: (id: string, content: string) => void;
  onTimingChange: (id: string, timing: 'before' | 'during' | 'after') => void;
  onKeyDown: (id: string, e: React.KeyboardEvent<HTMLInputElement>, content: string) => void;
  placeholder: string;
};

const LeverageBlockItem = ({
  item,
  setInputRef,
  onContentChange,
  onTimingChange,
  onKeyDown,
  placeholder,
}: LeverageBlockItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1 py-0.5 rounded transition-all ${
        isDragging ? 'opacity-50 bg-accent shadow-lg z-50' : ''
      }`}
    >
      {/* 드래그 핸들 */}
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground transition-opacity"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* 입력 */}
      <input
        ref={(el) => setInputRef(item.id, el)}
        type="text"
        value={item.block.content}
        onChange={(e) => onContentChange(item.id, e.target.value)}
        onKeyDown={(e) => onKeyDown(item.id, e, item.block.content)}
        className="flex-1 bg-transparent outline-none text-sm"
        placeholder={placeholder}
      />

      {/* Timing 선택 */}
      <Select
        value={item.timing}
        onValueChange={(v) => onTimingChange(item.id, v as 'before' | 'during' | 'after')}
      >
        <SelectTrigger className="w-[72px] h-6 text-xs border-none bg-muted/50 px-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="before">시작 전</SelectItem>
          <SelectItem value="during">작업 중</SelectItem>
          <SelectItem value="after">회고 시</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
