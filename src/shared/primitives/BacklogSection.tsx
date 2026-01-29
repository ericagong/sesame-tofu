import { useDroppable } from '@dnd-kit/core';
import { Card } from '@/shared/primitives';
import { Block } from '@/features/block-editor';
import type { Block as BlockType } from '@/entities/pomodoro/model';

type BacklogSectionProps = {
  backlog: BlockType[];
  onChange: (blocks: BlockType[]) => void;
  placeholder?: string;
  label?: string;
};

const BacklogSection = ({
  backlog,
  onChange,
  placeholder = '다음에 할 일...',
  label = '다음에 할 일',
}: BacklogSectionProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'backlog',
  });

  return (
    <Card.Section label={label} isOver={isOver}>
      <div ref={setNodeRef} className="min-h-[40px]">
        <Block.Editor
          blocks={backlog}
          onChange={onChange}
          placeholder={placeholder}
          maxDepth={0}
          droppableId="backlog"
        />
      </div>
    </Card.Section>
  );
};

export default BacklogSection;
