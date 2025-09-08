'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingState {
  framesLoaded: boolean;
  framesProgress: number;
  totalFrames: number;
  loadedFrames: number;
  isComplete: boolean;
}

interface LoadingContextType {
  loadingState: LoadingState;
  updateFramesProgress: (loaded: number, total: number) => void;
  setFramesLoaded: (loaded: boolean) => void;
  resetLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    framesLoaded: false,
    framesProgress: 0,
    totalFrames: 0,
    loadedFrames: 0,
    isComplete: false,
  });

  const updateFramesProgress = useCallback((loaded: number, total: number) => {
    const progress = Math.round((loaded / total) * 100);
    setLoadingState(prev => ({
      ...prev,
      loadedFrames: loaded,
      totalFrames: total,
      framesProgress: progress,
      framesLoaded: loaded === total,
      isComplete: loaded === total,
    }));
  }, []);

  const setFramesLoaded = useCallback((loaded: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      framesLoaded: loaded,
      isComplete: loaded,
    }));
  }, []);

  const resetLoading = useCallback(() => {
    setLoadingState({
      framesLoaded: false,
      framesProgress: 0,
      totalFrames: 0,
      loadedFrames: 0,
      isComplete: false,
    });
  }, []);

  return (
    <LoadingContext.Provider value={{
      loadingState,
      updateFramesProgress,
      setFramesLoaded,
      resetLoading,
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
