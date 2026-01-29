import type { Block } from '@/entities/block';
import { SectionLabel, ProgressBar } from '@/shared/primitives';

type InspectionSectionProps = {
  probability: number;
  tasks: Block[];
};

const InspectionSection = ({
  probability,
  tasks,
}: InspectionSectionProps) => {
  const allCompletedCount = tasks.filter((t) => t.status === 'deleted').length;
  const allTotalCount = tasks.length;
  const completionRate =
    allTotalCount > 0 ? (allCompletedCount / allTotalCount) * 100 : 0;

  return (
    <div className="space-y-3">
      <SectionLabel>점검</SectionLabel>
      <ProgressBar label="실행가능성" value={probability} color="gray" />
      <ProgressBar label="실제수행률" value={completionRate} color="foreground" />
    </div>
  );
};

export default InspectionSection;
