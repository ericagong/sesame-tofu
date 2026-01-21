import { useDroppable } from '@dnd-kit/core';
import { BlockEditor } from '@/components/editors';
import { SectionCard } from '@/components/common';
import type { Block } from '@/types';

type BacklogSectionProps = {
  backlog: Block[];
  onChange: (blocks: Block[]) => void;
  placeholder?: string;
  label?: string;
};

export const BacklogSection = ({
  backlog,
  onChange,
  placeholder = '다음에 할 일...',
  label = '다음에 할 일',
}: BacklogSectionProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'backlog',
  });

  return (
    <SectionCard label={label} isOver={isOver}>
      <div ref={setNodeRef} className="min-h-[40px]">
        <BlockEditor
          blocks={backlog}
          onChange={onChange}
          placeholder={placeholder}
          maxDepth={0}
          droppableId="backlog"
        />
      </div>
    </SectionCard>
  );
};
