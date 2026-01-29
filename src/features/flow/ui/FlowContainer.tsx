import { useState } from 'react';

import { useFlowStore } from '../model/store';
import { useTimerStore } from '@/features/timer';
import { RestDialog } from '@/features/rest';
import { PlanView } from './PlanView';
import { ExecuteView } from './ExecuteView';
import { ReflectView } from './ReflectView';

export const FlowContainer = () => {
  const phase = useFlowStore((s) => s.phase);
  const resetFlow = useFlowStore((s) => s.resetFlow);
  const { pause, start, reset } = useTimerStore();

  const [showRestDialog, setShowRestDialog] = useState(false);

  const handleRestRequest = () => {
    setShowRestDialog(true);
  };

  const handleRestStart = () => {
    pause();
  };

  const handleRestCancel = () => {
    start('flow');
  };

  const handleNewFlow = () => {
    start('flow');
    resetFlow();
    setShowRestDialog(false);
  };

  const handleEndDay = () => {
    reset();
    setShowRestDialog(false);
  };

  return (
    <>
      {phase === 'plan' && <PlanView />}
      {phase === 'execute' && <ExecuteView />}
      {phase === 'reflect' && <ReflectView onRestRequest={handleRestRequest} />}

      <RestDialog
        open={showRestDialog}
        onOpenChange={setShowRestDialog}
        onNewFlow={handleNewFlow}
        onEndDay={handleEndDay}
        onRestStart={handleRestStart}
        onRestCancel={handleRestCancel}
      />
    </>
  );
};
