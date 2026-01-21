import { useCycleStore } from '@/stores/cycleStore';

import { DndProvider } from '@/components/DndProvider';
import { Timer } from '@/components/Timer';
import { PhaseBar } from '@/components/PhaseBar';
import { Sidebar } from '@/components/Sidebar';
import { PlanPhase } from '@/components/plan';
import { ExecutePhase } from '@/components/execute';
import { ReflectPhase } from '@/components/reflect';

const App = () => {
  const { cycle } = useCycleStore();

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
        <div className="flex h-[calc(100vh-140px)]">
          {/* Left: Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {renderPhase()}
          </main>

          {/* Right: Sidebar */}
          <aside className="w-80">
            <Sidebar />
          </aside>
        </div>
      </div>
    </DndProvider>
  );
};

export default App;
