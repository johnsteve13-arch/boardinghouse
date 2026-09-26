'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CompareContextType {
  compareIds: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('seait_compare_ids');
      if (stored) {
        setCompareIds(JSON.parse(stored));
      } else {
        // default 2 houses for demo
        setCompareIds(['bh-1', 'bh-2']);
      }
    } catch {
      setCompareIds(['bh-1', 'bh-2']);
    }
  }, []);

  const saveToStorage = (ids: string[]) => {
    try {
      localStorage.setItem('seait_compare_ids', JSON.stringify(ids));
    } catch {
      // Ignore storage errors
    }
  };

  const addToCompare = (id: string) => {
    if (compareIds.includes(id)) return;
    if (compareIds.length >= 4) {
      alert('You can compare a maximum of 4 boarding houses at a time.');
      return;
    }
    const updated = [...compareIds, id];
    setCompareIds(updated);
    saveToStorage(updated);
  };

  const removeFromCompare = (id: string) => {
    const updated = compareIds.filter((item) => item !== id);
    setCompareIds(updated);
    saveToStorage(updated);
  };

  const isInCompare = (id: string) => compareIds.includes(id);

  const clearCompare = () => {
    setCompareIds([]);
    saveToStorage([]);
  };

  return (
    <CompareContext.Provider
      value={{ compareIds, addToCompare, removeFromCompare, isInCompare, clearCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within CompareProvider');
  return context;
}
