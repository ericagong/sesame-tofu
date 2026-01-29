
import { usePomodoroStore } from '@/entities/pomodoro';
import { Timer } from '@/widgets/timer';
import { PhaseBar } from '@/widgets/phase-bar';
import { DndProvider } from './providers';
import { PlanPhase } from '@/pages/plan';
import { ExecutePhase } from '@/pages/execute';
import { ReflectPhase } from '@/pages/reflect';

const App = () => {
  const { pomodoro } = usePomodoroStore();

  const renderPhase = () => {
    switch (pomodoro.phase) {
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
