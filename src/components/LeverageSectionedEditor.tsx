import { useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Square, CheckSquare } from 'lucide-react';

import { generateId } from '@/utils';
import { cn } from '@/lib/utils';

import type { LeverageBlock } from '@/types';

type TimingSection = {
  timing: 'before' | 'during' | 'after';
  label: string;
  droppableId: string;
};

type LeverageSectionedEditorProps = {
  items: LeverageBlock[];
  onAdd: (item: LeverageBlock) => void;
  onContentChange: (id: string, content: string) => void;
  onTimingChange: (id: string, timing: 'before' | 'during' | 'after') => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  source: 'keep' | 'try';
  droppableIdPrefix: 'keeps' | 'tries';
};

export const LeverageSectionedEditor = ({
  items,
  onAdd,
  onContentChange,
  onTimingChange,
  onToggle,
  onRemove,
  source,
  droppableIdPrefix,
}: LeverageSectionedEditorProps) => {
  const inputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  const sections: TimingSection[] = [
    { timing: 'before', label: 'Plan', droppableId: `${droppableIdPrefix}-before` },
    { timing: 'during', label: 'Execute', droppableId: `${droppableIdPrefix}-during` },
    { timing: 'after', label: 'Reflect', droppableId: `${droppableIdPrefix}-after` },
  ];

  const setInputRef = (id: string, el: HTMLInputElement | null) => {
    if (el) {
      inputRefs.current.set(id, el);
    } else {
      inputRefs.current.delete(id);
    }
  };

  const handleKeyDown = (
    id: string,
    e: React.KeyboardEvent<HTMLInputElement>,
    content: string,
    timing: 'before' | 'during' | 'after'
  ) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const newItem: LeverageBlock = {
        id: generateId(),
        block: {
          id: generateId(),
          content: '',
          depth: 0,
          status: 'active',
        },
        timing,
        source,
        status: 'active',
        createdAt: new Date(),
      };
      onAdd(newItem);
      setTimeout(() => {
        const newInput = inputRefs.current.get(newItem.id);
        newInput?.focus();
      }, 0);
    } else if (e.key === 'Backspace' && !content) {
      e.preventDefault();
      const sectionItems = items.filter((item) => item.timing === timing);
      const currentIndex = sectionItems.findIndex((item) => item.id === id);
      onRemove(id);
      if (currentIndex > 0) {
        const prevItem = sectionItems[currentIndex - 1];
        setTimeout(() => {
          const prevInput = inputRefs.current.get(prevItem.id);
          prevInput?.focus();
        }, 0);
      }
    }
  };

  const handleAddClick = (timing: 'before' | 'during' | 'after') => {
    const newItem: LeverageBlock = {
      id: generateId(),
      block: {
        id: generateId(),
        content: '',
        depth: 0,
        status: 'active',
      },
      timing,
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
    <div className="space-y-3">
      {sections.map((section) => {
        const sectionItems = items.filter((item) => item.timing === section.timing);

        return (
          <TimingDropZone
            key={section.droppableId}
            section={section}
            items={sectionItems}
            allItems={items}
            setInputRef={setInputRef}
            onContentChange={onContentChange}
            onTimingChange={onTimingChange}
            onToggle={onToggle}
            onKeyDown={handleKeyDown}
            onAddClick={handleAddClick}
          />
        );
      })}
    </div>
  );
};

// 섹션별 드롭존
type TimingDropZoneProps = {
  section: TimingSection;
  items: LeverageBlock[];
  allItems: LeverageBlock[];
  setInputRef: (id: string, el: HTMLInputElement | null) => void;
  onContentChange: (id: string, content: string) => void;
  onTimingChange: (id: string, timing: 'before' | 'during' | 'after') => void;
  onToggle: (id: string) => void;
  onKeyDown: (
    id: string,
    e: React.KeyboardEvent<HTMLInputElement>,
    content: string,
    timing: 'before' | 'during' | 'after'
  ) => void;
  onAddClick: (timing: 'before' | 'during' | 'after') => void;
};

const TimingDropZone = ({
  section,
  items,
  setInputRef,
  onContentChange,
  onToggle,
  onKeyDown,
  onAddClick,
}: TimingDropZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: section.droppableId,
  });

  return (
    <div className="space-y-1">
      <span className="text-[10px] text-muted-foreground/70">{section.label}</span>
      <div
        ref={setNodeRef}
        className={`min-h-[32px] rounded transition-colors ${
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
              onToggle={onToggle}
              onKeyDown={(id, e, content) => onKeyDown(id, e, content, section.timing)}
            />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <button
            onClick={() => onAddClick(section.timing)}
            className="w-full text-left px-2 py-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            + 추가
          </button>
        )}
      </div>
    </div>
  );
};

// 개별 항목 컴포넌트
type LeverageBlockItemProps = {
  item: LeverageBlock;
  setInputRef: (id: string, el: HTMLInputElement | null) => void;
  onContentChange: (id: string, content: string) => void;
  onToggle: (id: string) => void;
  onKeyDown: (id: string, e: React.KeyboardEvent<HTMLInputElement>, content: string) => void;
};

const LeverageBlockItem = ({
  item,
  setInputRef,
  onContentChange,
  onToggle,
  onKeyDown,
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

  const isDeleted = item.block.status === 'deleted';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-1 py-0.5 rounded transition-all',
        isDragging && 'opacity-50 bg-accent shadow-lg z-50'
      )}
    >
      {/* 드래그 핸들 */}
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground transition-opacity"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* 체크박스 */}
      <button
        onClick={() => onToggle(item.id)}
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
        ref={(el) => setInputRef(item.id, el)}
        type="text"
        value={item.block.content}
        onChange={(e) => onContentChange(item.id, e.target.value)}
        onKeyDown={(e) => onKeyDown(item.id, e, item.block.content)}
        className={cn(
          'flex-1 bg-transparent outline-none text-sm',
          isDeleted && 'line-through text-muted-foreground'
        )}
        placeholder="내용을 입력하세요..."
        disabled={isDeleted}
      />
    </div>
  );
};
