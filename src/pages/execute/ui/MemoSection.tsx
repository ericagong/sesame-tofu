import { Card } from '@/shared/primitives';
import { Block } from '@/features/block-editor';
import type { Block as BlockType } from '@/entities/pomodoro/model';

type MemoSectionProps = {
  memos: BlockType[];
  onChange: (blocks: BlockType[]) => void;
  placeholder?: string;
  label?: string;
};

const MemoSection = ({
  memos,
  onChange,
  placeholder = '메모 추가...',
  label = '작업 중 메모',
}: MemoSectionProps) => {
  return (
    <Card.Section label={label}>
      <Block.Editor
        blocks={memos}
        onChange={onChange}
        placeholder={placeholder}
        maxDepth={0}
        droppableId="memos"
      />
    </Card.Section>
  );
};

export default MemoSection;
