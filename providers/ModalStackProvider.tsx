'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import EntityModal from '@/components/EntityModal';
import type { SearchResult } from '@/components/SearchResults';
import { getCategoryColors } from '@/utils/categoryColors';

type ModalItem = {
  id: string;
  entity: SearchResult;
};

type ModalStackContextType = {
  openEntity: (entity: SearchResult) => string; // returns modal id
  closeTop: () => void;
  closeById: (id: string) => void;
  clearAll: () => void;
  depth: number;
};

const ModalStackContext = createContext<ModalStackContextType | undefined>(undefined);

export const useModalStack = (): ModalStackContextType => {
  const ctx = useContext(ModalStackContext);
  if (!ctx) throw new Error('useModalStack must be used within ModalStackProvider');
  return ctx;
};

export const ModalStackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stack, setStack] = useState<ModalItem[]>([]);

  const openEntity = useCallback((entity: SearchResult) => {
    const id = `${entity.id}-${Date.now()}`;
    setStack((prev) => [...prev, { id, entity }]);
    return id;
  }, []);

  const closeTop = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const closeById = useCallback((id: string) => {
    setStack((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearAll = useCallback(() => setStack([]), []);

  const value = useMemo(
    () => ({ openEntity, closeTop, closeById, clearAll, depth: stack.length }),
    [openEntity, closeTop, closeById, clearAll, stack.length]
  );

  // Global ESC handler and body scroll lock based on stack depth
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stack.length > 0) {
        e.stopPropagation();
        closeTop();
      }
    };

    if (typeof document !== 'undefined') {
      if (stack.length > 0) {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
      } else {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      }
    }

    // Cleanup on unmount
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleKeyDown);
        if (stack.length === 0) {
          document.body.style.overflow = 'unset';
        }
      }
    };
  }, [stack.length, closeTop]);

  return (
    <ModalStackContext.Provider value={value}>
      {children}
      {/* Render stacked modals with increasing zIndex and stacking effect */}
      {stack.map((item, idx) => {
        const borderColor = getCategoryColors(item.entity.type).vibrant;
        const isTopModal = idx === stack.length - 1;
        const stackIndex = idx;
        const totalModals = stack.length;
        
        return (
          <EntityModal
            key={item.id}
            entity={item.entity}
            isOpen={true}
            onClose={() => closeById(item.id)}
            borderColor={borderColor}
            stackIndex={stackIndex}
            totalModals={totalModals}
            isTopModal={isTopModal}
          />
        );
      })}
    </ModalStackContext.Provider>
  );
};
