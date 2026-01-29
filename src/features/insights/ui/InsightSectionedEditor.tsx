import { useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Square, CheckSquare } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { generateId } from '@/entities/block';
import {
  DragHandle,
  DroppableContainer,
  AddItemButton,
  SectionLabel,
} from '@/shared/primitives';

import type { Insight, InsightTiming } from '@/entities/insight';

type TimingSection = {
  timing: InsightTiming;
  label: string;
  droppableId: string;
};

type InsightSectionedEditorProps = {
  items: Insight[];
  onAdd: (item: Insight) => void;
  onContentChange: (id: string, content: string) => void;
  onTimingChange: (id: string, timing: InsightTiming) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export const InsightSectionedEditor = ({
  items,
  onAdd,
  onContentChange,
  onTimingChange: _onTimingChange,
  onToggle,
  onRemove,
}: InsightSectionedEditorProps) => {
  // Note: onTimingChange is handled by the D&D provider at the app level
  void _onTimingChange;
  const inputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  const sections: TimingSection[] = [
    { timing: 'before', label: 'Plan', droppableId: 'insights-before' },
    { timing: 'during', label: 'Execute', droppableId: 'insights-during' },
    { timing: 'after', label: 'Reflect', droppableId: 'insights-after' },
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
    timing: InsightTiming
  ) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const newItem: Insight = {
        id: generateId(),
        block: {
          id: generateId(),
          content: '',
          depth: 0,
          status: 'active',
        },
        timing,
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

  const handleAddClick = (timing: InsightTiming) => {
    const newItem: Insight = {
      id: generateId(),
      block: {
        id: generateId(),
        content: '',
        depth: 0,
        status: 'active',
      },
      timing,
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
            setInputRef={setInputRef}
            onContentChange={onContentChange}
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
  items: Insight[];
  setInputRef: (id: string, el: HTMLInputElement | null) => void;
  onContentChange: (id: string, content: string) => void;
  onToggle: (id: string) => void;
  onKeyDown: (
    id: string,
    e: React.KeyboardEvent<HTMLInputElement>,
    content: string,
    timing: InsightTiming
  ) => void;
  onAddClick: (timing: InsightTiming) => void;
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
      <SectionLabel size="small">{section.label}</SectionLabel>
      <DroppableContainer
        setNodeRef={setNodeRef}
        isOver={isOver}
        minHeight="small"
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <InsightItem
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
          <AddItemButton onClick={() => onAddClick(section.timing)} variant="muted">
            + 추가
          </AddItemButton>
        )}
      </DroppableContainer>
    </div>
  );
};

// 개별 항목 컴포넌트
type InsightItemProps = {
  item: Insight;
  setInputRef: (id: string, el: HTMLInputElement | null) => void;
  onContentChange: (id: string, content: string) => void;
  onToggle: (id: string) => void;
  onKeyDown: (id: string, e: React.KeyboardEvent<HTMLInputElement>, content: string) => void;
};

const InsightItem = ({
  item,
  setInputRef,
  onContentChange,
  onToggle,
  onKeyDown,
}: InsightItemProps) => {
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
      <DragHandle attributes={attributes} listeners={listeners} />

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
