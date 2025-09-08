'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingState {
  framesLoaded: boolean;
  framesProgress: number;
  totalFrames: number;
  loadedFrames: number;
  wordsComplete: boolean;
  minimumTimeElapsed: boolean;
  isComplete: boolean;
}

interface LoadingContextType {
  loadingState: LoadingState;
  updateFramesProgress: (loaded: number, total: number) => void;
  setFramesLoaded: (loaded: boolean) => void;
  setWordsComplete: (complete: boolean) => void;
  setMinimumTimeElapsed: (elapsed: boolean) => void;
  resetLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    framesLoaded: false,
    framesProgress: 0,
    totalFrames: 0,
    loadedFrames: 0,
    wordsComplete: false,
    minimumTimeElapsed: false,
    isComplete: false,
  });

  const updateFramesProgress = useCallback((loaded: number, total: number) => {
    const progress = Math.round((loaded / total) * 100);
    setLoadingState(prev => {
      const framesLoaded = loaded === total;
      const isComplete = framesLoaded && prev.wordsComplete && prev.minimumTimeElapsed;
      return {
        ...prev,
        loadedFrames: loaded,
        totalFrames: total,
        framesProgress: progress,
        framesLoaded,
        isComplete,
      };
    });
  }, []);

  const setFramesLoaded = useCallback((loaded: boolean) => {
    setLoadingState(prev => {
      const isComplete = loaded && prev.wordsComplete && prev.minimumTimeElapsed;
      return {
        ...prev,
        framesLoaded: loaded,
        isComplete,
      };
    });
  }, []);

  const setWordsComplete = useCallback((complete: boolean) => {
    setLoadingState(prev => {
      const isComplete = prev.framesLoaded && complete && prev.minimumTimeElapsed;
      return {
        ...prev,
        wordsComplete: complete,
        isComplete,
      };
    });
  }, []);

  const setMinimumTimeElapsed = useCallback((elapsed: boolean) => {
    setLoadingState(prev => {
      const isComplete = prev.framesLoaded && prev.wordsComplete && elapsed;
      return {
        ...prev,
        minimumTimeElapsed: elapsed,
        isComplete,
      };
    });
  }, []);

  const resetLoading = useCallback(() => {
    setLoadingState({
      framesLoaded: false,
      framesProgress: 0,
      totalFrames: 0,
      loadedFrames: 0,
      wordsComplete: false,
      minimumTimeElapsed: false,
      isComplete: false,
    });
  }, []);

  return (
    <LoadingContext.Provider value={{
      loadingState,
      updateFramesProgress,
      setFramesLoaded,
      setWordsComplete,
      setMinimumTimeElapsed,
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
