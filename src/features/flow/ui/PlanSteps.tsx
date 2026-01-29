import type { Block } from '@/entities/block';
import type { Insight } from '@/entities/insight';
import { Block as BlockEditor } from '@/features/block-editor';
import { Slider } from '@/shared/core/slider';
import {
  SectionLabel,
  DimmedSection,
  Card,
  GoalSection,
  BacklogSection,
  InsightCheckList,
} from '@/shared/primitives';
import { cn } from '@/shared/lib/utils';
import { VisualizationOverlay } from './VisualizationOverlay';

// Step 1: 목표 정의
type PlanStep1Props = {
  goal: Block | null;
  onGoalChange: (value: string) => void;
  onGoalKeyDown: (e: React.KeyboardEvent) => void;
  backlog: Block[];
  onBacklogChange: (blocks: Block[]) => void;
};

export const PlanStep1 = ({
  goal,
  onGoalChange,
  onGoalKeyDown,
  backlog,
  onBacklogChange,
}: PlanStep1Props) => (
  <>
    {backlog.length > 0 && (
      <BacklogSection backlog={backlog} onChange={onBacklogChange} />
    )}

    <Card>
      <Card.Content>
        <GoalSection
          goal={goal}
          onChange={onGoalChange}
          onKeyDown={onGoalKeyDown}
          autoFocus
        />

        <DimmedSection dimmed className="space-y-2">
          <SectionLabel>과제</SectionLabel>
          <p className="text-xs text-muted-foreground/50">
            목표를 먼저 정의하세요
          </p>
        </DimmedSection>

        <DimmedSection dimmed className="space-y-2">
          <SectionLabel>점검</SectionLabel>
          <p className="text-xs text-muted-foreground/50">
            과제를 먼저 분할하세요
          </p>
        </DimmedSection>
      </Card.Content>
    </Card>
  </>
);

// Step 2: 목표 분할
type PlanStep2Props = {
  goal: Block | null;
  tasks: Block[];
  onTasksChange: (blocks: Block[]) => void;
};

export const PlanStep2 = ({ goal, tasks, onTasksChange }: PlanStep2Props) => (
  <Card>
    <Card.Content>
      <GoalSection goal={goal} readonly dimmed />

      <div className="space-y-2">
        <SectionLabel>과제</SectionLabel>
        <BlockEditor.Editor
          blocks={tasks}
          onChange={onTasksChange}
          placeholder="과제를 작성해보세요."
          maxDepth={1}
          droppableId="tasks"
        />
      </div>

      <DimmedSection dimmed className="space-y-2">
        <SectionLabel>점검</SectionLabel>
        <p className="text-xs text-muted-foreground/50">
          과제를 먼저 분할하세요
        </p>
      </DimmedSection>
    </Card.Content>
  </Card>
);

// Step 3: 목표 점검
type PlanStep3Props = {
  goal: Block | null;
  tasks: Block[];
  onTasksChange: (blocks: Block[]) => void;
  backlog: Block[];
  onBacklogChange: (blocks: Block[]) => void;
  probability: number;
  onProbabilityChange: (value: number) => void;
  beforeInsights: Insight[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  isVisualizing: boolean;
  countdown: number;
  isStep3Done: boolean;
};

export const PlanStep3 = ({
  goal,
  tasks,
  onTasksChange,
  backlog,
  onBacklogChange,
  probability,
  onProbabilityChange,
  beforeInsights,
  checkedIds,
  onToggle,
  isVisualizing,
  countdown,
  isStep3Done,
}: PlanStep3Props) => (
  <>
    <Card className="relative">
      {isVisualizing && <VisualizationOverlay countdown={countdown} />}
      <Card.Content>
        <GoalSection goal={goal} readonly dimmed />

        <DimmedSection dimmed={false} className="space-y-2">
          <SectionLabel>과제</SectionLabel>
          <BlockEditor.Editor
            blocks={tasks}
            onChange={onTasksChange}
            placeholder="과제를 작성해보세요."
            maxDepth={1}
            droppableId="tasks"
            showOrder
          />
        </DimmedSection>

        <div className="space-y-2">
          <SectionLabel>점검</SectionLabel>
          <div className="space-y-3">
            <div className="space-y-1">
              <SectionLabel>실행가능성</SectionLabel>
              <div className="flex items-center gap-4">
                <Slider
                  value={[probability]}
                  onValueChange={([value]) => onProbabilityChange(value)}
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <span
                  className={cn(
                    'w-14 text-right font-bold',
                    probability >= 80 ? 'text-green-600' : 'text-orange-500'
                  )}
                >
                  {probability}%
                </span>
              </div>
            </div>
            {!isStep3Done && (
              <p className="text-xs text-muted-foreground">
                빡빡해 보여요. 과제 중 일부를 다음 할 일로 옮겨 실행 가능성을
                높여보세요.
              </p>
            )}
          </div>
        </div>
      </Card.Content>
    </Card>

    <BacklogSection
      backlog={backlog}
      onChange={onBacklogChange}
      placeholder="과제를 여기로 드래그하세요."
    />

    {isStep3Done && (
      <InsightCheckList
        insights={beforeInsights}
        label="시작 전 체크"
        variant="checkbox"
        checkedIds={checkedIds}
        onToggle={onToggle}
      />
    )}
  </>
);
