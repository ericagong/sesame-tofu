import { useEffect } from 'react';

import { useCycleStore } from '@/stores/cycleStore';
import { useTimerStore } from '@/stores/timerStore';

import { DndProvider } from '@/providers';
import { Timer, PhaseBar } from '@/components/layout';
import { PlanPhase } from '@/phases/plan';
import { ExecutePhase } from '@/phases/execute';
import { ReflectPhase } from '@/phases/reflect';

const App = () => {
  const { cycle } = useCycleStore();
  const { start, isRunning } = useTimerStore();

  useEffect(() => {
    if (!isRunning) {
      start();
    }
  }, []);

  const renderPhase = () => {
    switch (cycle.phase) {
      case 'plan':
        return <PlanPhase />;
      case 'execute':
        return <ExecutePhase />;
      case 'reflect':
        return <ReflectPhase />;
      default:
        return <PlanPhase />;
    }
  };

  return (
    <DndProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <Timer />
          <PhaseBar />
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto p-6 overflow-auto h-[calc(100vh-140px)]">
          {renderPhase()}
        </main>
      </div>
    </DndProvider>
  );
};

export default App;
