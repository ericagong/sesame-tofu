import { BlockEditor } from '@/components/editors';
import { SectionCard } from '@/components/common';
import type { Block } from '@/types';

type MemoSectionProps = {
  memos: Block[];
  onChange: (blocks: Block[]) => void;
  placeholder?: string;
  label?: string;
};

export const MemoSection = ({
  memos,
  onChange,
  placeholder = '메모 추가...',
  label = '작업 중 메모',
}: MemoSectionProps) => {
  return (
    <SectionCard label={label}>
      <BlockEditor
        blocks={memos}
        onChange={onChange}
        placeholder={placeholder}
        maxDepth={0}
        droppableId="memos"
      />
    </SectionCard>
  );
};
