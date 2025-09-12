import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PendingOperation {
  id: string;
  type: 'send' | 'receive';
  data: any;
  timestamp: Date;
}

interface CacheContextType {
  pendingOperations: PendingOperation[];
  lastSyncTimestamp: Date | null;
  addPending: (operation: PendingOperation) => void;
  flushPending: () => Promise<void>;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export const CacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>(() => {
    const saved = localStorage.getItem('pendingOperations');
    return saved ? JSON.parse(saved).map((op: any) => ({
      ...op,
      timestamp: new Date(op.timestamp)
    })) : [];
  });

  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<Date | null>(null);

  useEffect(() => {
    localStorage.setItem('pendingOperations',
      JSON.stringify(pendingOperations.map(op => ({
        ...op,
        timestamp: op.timestamp.toISOString()
      })))
    );
  }, [pendingOperations]);

  const addPending = (operation: PendingOperation) => {
    setPendingOperations(prev => [...prev, operation]);
  };

  const flushPending = async (): Promise<void> => {
    // TODO: Process pending operations
    console.log('Flushing pending operations:', pendingOperations);
    setPendingOperations([]);
    setLastSyncTimestamp(new Date());
  };

  return (
    <CacheContext.Provider value={{
      pendingOperations,
      lastSyncTimestamp,
      addPending,
      flushPending
    }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};