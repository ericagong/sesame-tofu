import { useCallback, useRef } from 'react';

import type { Block } from '@/entities/pomodoro/model';
import { generateId } from '@/shared/lib/utils';

type UseBlockEditorProps = {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  maxDepth?: 0 | 1;
};

export const useBlockEditor = ({
  blocks,
  onChange,
  maxDepth = 1,
}: UseBlockEditorProps) => {
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const isProcessingRef = useRef(false);

  const setInputRef = useCallback(
    (id: string, el: HTMLInputElement | null) => {
      if (el) {
        inputRefs.current.set(id, el);
      } else {
        inputRefs.current.delete(id);
      }
    },
    []
  );

  const focusBlock = useCallback((id: string) => {
    setTimeout(() => {
      const input = inputRefs.current.get(id);
      input?.focus();
    }, 0);
  }, []);

  const createBlock = useCallback(
    (depth: 0 | 1 = 0, parentId?: string): Block => ({
      id: generateId(),
      content: '',
      depth,
      status: 'active',
      parentId,
    }),
    []
  );

  const updateBlock = useCallback(
    (id: string, content: string) => {
      onChange(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
    },
    [blocks, onChange]
  );

  const toggleStatus = useCallback(
    (id: string) => {
      onChange(
        blocks.map((b) =>
          b.id === id
            ? { ...b, status: b.status === 'active' ? 'deleted' : 'active' }
            : b
        ) as Block[]
      );
    },
    [blocks, onChange]
  );

  const handleEnter = useCallback(
    (id: string, currentBlocks: Block[]) => {
      const index = currentBlocks.findIndex((b) => b.id === id);
      if (index === -1) return;

      const current = currentBlocks[index];
      const newBlock = createBlock(current.depth, current.parentId);
      const updated = [
        ...currentBlocks.slice(0, index + 1),
        newBlock,
        ...currentBlocks.slice(index + 1),
      ];
      onChange(updated);
      focusBlock(newBlock.id);
    },
    [onChange, createBlock, focusBlock]
  );

  const handleTab = useCallback(
    (id: string, shift: boolean, currentBlocks: Block[]) => {
      const index = currentBlocks.findIndex((b) => b.id === id);
      if (index === -1) return;

      const current = currentBlocks[index];
      let newDepth = current.depth;

      if (shift) {
        if (current.depth > 0) {
          newDepth = (current.depth - 1) as 0 | 1;
        }
      } else {
        if (current.depth < maxDepth && index > 0) {
          newDepth = (current.depth + 1) as 0 | 1;
        }
      }

      if (newDepth !== current.depth) {
        onChange(
          currentBlocks.map((b) =>
            b.id === id ? { ...b, depth: newDepth } : b
          ) as Block[]
        );
      }
    },
    [onChange, maxDepth]
  );

  const handleBackspace = useCallback(
    (id: string, content: string, currentBlocks: Block[]) => {
      if (content !== '') return;
      if (currentBlocks.length <= 1) return;

      const index = currentBlocks.findIndex((b) => b.id === id);
      if (index === -1) return;

      onChange(currentBlocks.filter((b) => b.id !== id));

      if (index > 0) {
        focusBlock(currentBlocks[index - 1].id);
      }
    },
    [onChange, focusBlock]
  );

  const handleArrowUp = useCallback(
    (id: string, currentBlocks: Block[]) => {
      const activeBlocks = currentBlocks.filter((b) => b.status === 'active');
      const index = activeBlocks.findIndex((b) => b.id === id);
      if (index > 0) {
        focusBlock(activeBlocks[index - 1].id);
      }
    },
    [focusBlock]
  );

  const handleArrowDown = useCallback(
    (id: string, currentBlocks: Block[]) => {
      const activeBlocks = currentBlocks.filter((b) => b.status === 'active');
      const index = activeBlocks.findIndex((b) => b.id === id);
      if (index < activeBlocks.length - 1) {
        focusBlock(activeBlocks[index + 1].id);
      }
    },
    [focusBlock]
  );

  const handleKeyDown = useCallback(
    (id: string, e: React.KeyboardEvent<HTMLInputElement>, currentBlocks: Block[]) => {
      const target = e.target as HTMLInputElement;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        handleEnter(id, currentBlocks);
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 50);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleTab(id, e.shiftKey, currentBlocks);
      } else if (e.key === 'Backspace' && target.value === '') {
        e.preventDefault();
        handleBackspace(id, target.value, currentBlocks);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleArrowUp(id, currentBlocks);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleArrowDown(id, currentBlocks);
      }
    },
    [handleEnter, handleTab, handleBackspace, handleArrowUp, handleArrowDown]
  );

  const addBlock = useCallback(
    (depth: 0 | 1 = 0) => {
      const newBlock = createBlock(depth);
      onChange([...blocks, newBlock]);
      focusBlock(newBlock.id);
    },
    [blocks, onChange, createBlock, focusBlock]
  );

  const reorderBlocks = useCallback(
    (fromIndex: number, toIndex: number) => {
      const updated = [...blocks];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      onChange(updated);
    },
    [blocks, onChange]
  );

  return {
    setInputRef,
    updateBlock,
    toggleStatus,
    handleKeyDown,
    addBlock,
    reorderBlocks,
  };
};
