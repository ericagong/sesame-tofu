import { TimerPanel } from '@/features/timer';
import { PhaseBar, FlowContainer } from '@/features/flow';

export const FlowPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <TimerPanel />
        <PhaseBar />
      </header>
      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6 overflow-auto h-[calc(100vh-140px)]">
        <FlowContainer />
      </main>
    </div>
  );
};
