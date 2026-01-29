import { createContext, useContext } from 'react';

export type DndStateContextType = {
  overId: string | null;
  activeId: string | null;
  dropDepth: 0 | 1;
};

export const DndStateContext = createContext<DndStateContextType>({
  overId: null,
  activeId: null,
  dropDepth: 0,
});

export const useDndState = () => useContext(DndStateContext);
