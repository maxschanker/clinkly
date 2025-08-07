import { useState, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  playerReady: boolean;
  hasUserInteracted: boolean;
  needsUserGesture: boolean;
  fallbackMode: 'none' | 'direct-link' | 'search-suggestion';
}

export function useMobileAudioManager() {
  const isMobile = useIsMobile();
  
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    hasError: false,
    playerReady: false,
    hasUserInteracted: false,
    needsUserGesture: true,
    fallbackMode: 'none'
  });

  const timeouts = useRef<{
    playerReady?: NodeJS.Timeout;
    playbackStart?: NodeJS.Timeout;
  }>({});

  const clearTimeouts = useCallback(() => {
    Object.values(timeouts.current).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    timeouts.current = {};
  }, []);

  const updateState = useCallback((updates: Partial<AudioPlayerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setUserInteracted = useCallback(() => {
    updateState({ 
      hasUserInteracted: true, 
      needsUserGesture: false 
    });
  }, [updateState]);

  const setPlayerReady = useCallback((ready: boolean) => {
    updateState({ playerReady: ready });
    if (ready) {
      clearTimeouts();
    }
  }, [updateState, clearTimeouts]);

  const setPlaybackState = useCallback((playing: boolean, loading = false) => {
    updateState({ 
      isPlaying: playing, 
      isLoading: loading,
      hasError: false 
    });
    if (!loading) clearTimeouts();
  }, [updateState, clearTimeouts]);

  const setError = useCallback((error = true) => {
    updateState({ 
      hasError: error, 
      isLoading: false, 
      isPlaying: false 
    });
    clearTimeouts();
  }, [updateState, clearTimeouts]);

  const setFallbackMode = useCallback((mode: AudioPlayerState['fallbackMode']) => {
    updateState({ 
      fallbackMode: mode,
      isLoading: false,
      hasError: mode !== 'none'
    });
  }, [updateState]);

  const shouldUseFallback = useCallback((): boolean => {
    if (!isMobile) return false;
    
    // Use fallback if we have errors or player isn't ready after user interaction
    return state.hasError || (state.hasUserInteracted && !state.playerReady);
  }, [isMobile, state.hasError, state.hasUserInteracted, state.playerReady]);

  const startPlayerReadyTimeout = useCallback((duration = 3000) => {
    clearTimeouts();
    timeouts.current.playerReady = setTimeout(() => {
      if (!state.playerReady && state.hasUserInteracted) {
        if (isMobile) {
          setFallbackMode('direct-link');
        } else {
          setError(true);
        }
      }
    }, duration);
  }, [state.playerReady, state.hasUserInteracted, isMobile, setFallbackMode, setError]);

  const startPlaybackTimeout = useCallback((duration = 4000) => {
    timeouts.current.playbackStart = setTimeout(() => {
      if (state.isLoading && !state.isPlaying) {
        if (isMobile) {
          setFallbackMode('direct-link');
        } else {
          setError(true);
        }
      }
    }, duration);
  }, [state.isLoading, state.isPlaying, isMobile, setFallbackMode, setError]);

  return {
    state,
    isMobile,
    clearTimeouts,
    setUserInteracted,
    setPlayerReady,
    setPlaybackState,
    setError,
    setFallbackMode,
    shouldUseFallback,
    startPlayerReadyTimeout,
    startPlaybackTimeout,
    updateState
  };
}