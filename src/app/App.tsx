import { DndProvider } from './providers';
import { FlowPage } from '@/pages';

const App = () => {
  return (
    <DndProvider>
      <FlowPage />
    </DndProvider>
  );
};

export default App;
