import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, RotateCcw, AlertTriangle } from "lucide-react";
import { audioDiagnostics } from "@/lib/audioDiagnostics";

interface OptimizedAudioPlayerProps {
  voiceMemoUrl: string;
  variant?: 'mini' | 'full';
}

interface PlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  progress: number;
  duration: number | null;
}

const OptimizedAudioPlayer = ({ 
  voiceMemoUrl, 
  variant = 'mini' 
}: OptimizedAudioPlayerProps) => {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    isLoading: false,
    hasError: false,
    progress: 0,
    duration: null
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const urlRef = useRef<string>('');
  const { toast } = useToast();

  // Simple state updates without complex logic
  const updateState = useCallback((updates: Partial<PlayerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clean audio setup with minimal event handling
  const setupAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !voiceMemoUrl || voiceMemoUrl === urlRef.current) return;

    console.log('🎵 Setting up audio for URL:', voiceMemoUrl);
    urlRef.current = voiceMemoUrl;
    
    // Reset state
    updateState({
      isPlaying: false,
      isLoading: true,
      hasError: false,
      progress: 0,
      duration: null
    });

    // Test URL accessibility first
    try {
      const testResult = await audioDiagnostics.testAudioUrl(voiceMemoUrl);
      console.log('🔍 URL test result:', testResult);
      
      if (!testResult.canLoad) {
        throw new Error(testResult.error || 'Cannot load audio');
      }
    } catch (error) {
      console.error('🚫 URL test failed:', error);
      updateState({
        isLoading: false,
        hasError: true,
        errorMessage: 'Cannot access audio file'
      });
      return;
    }

    // Set up audio with minimal configuration
    audio.src = voiceMemoUrl;
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';

    // Single load attempt
    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Load timeout'));
        }, 8000);

        const cleanup = () => {
          clearTimeout(timeout);
          audio.removeEventListener('loadedmetadata', onLoaded);
          audio.removeEventListener('error', onError);
        };

        const onLoaded = () => {
          cleanup();
          updateState({
            isLoading: false,
            duration: audio.duration
          });
          resolve();
        };

        const onError = () => {
          cleanup();
          reject(new Error(`Load failed: ${audio.error?.message || 'Unknown'}`));
        };

        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('error', onError);
        
        audio.load();
      });
    } catch (error) {
      console.error('🚫 Audio setup failed:', error);
      updateState({
        isLoading: false,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : 'Setup failed'
      });
    }
  }, [voiceMemoUrl, updateState]);

  // Simplified play/pause without complex state management
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || state.hasError || state.isLoading) return;

    console.log('🎵 Toggle playback:', { isPlaying: state.isPlaying });

    try {
      if (state.isPlaying) {
        audio.pause();
        audio.currentTime = 0; // Reset to start for mini player
      } else {
        // Simple play without complex retry logic
        await audio.play();
      }
    } catch (error) {
      console.error('🚫 Playback error:', error);
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast({
          title: "Audio permission needed",
          description: "Please allow audio playback in your browser",
          variant: "destructive",
        });
      }
      
      updateState({
        hasError: true,
        errorMessage: 'Playback failed'
      });
    }
  }, [state.isPlaying, state.hasError, state.isLoading, toast, updateState]);

  // Basic event handlers
  const handlePlay = useCallback(() => {
    console.log('▶️ Audio playing');
    updateState({ isPlaying: true, hasError: false });
  }, [updateState]);

  const handlePause = useCallback(() => {
    console.log('⏸️ Audio paused');
    updateState({ isPlaying: false });
  }, [updateState]);

  const handleEnded = useCallback(() => {
    console.log('🏁 Audio ended');
    updateState({ isPlaying: false, progress: 0 });
  }, [updateState]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !state.duration) return;
    
    const progress = (audio.currentTime / state.duration) * 100;
    updateState({ progress });
  }, [state.duration, updateState]);

  const handleError = useCallback(() => {
    const audio = audioRef.current;
    console.error('🚫 Audio error:', audio?.error);
    
    updateState({
      isPlaying: false,
      hasError: true,
      errorMessage: 'Playback error'
    });
  }, [updateState]);

  const retry = useCallback(() => {
    console.log('🔄 Manual retry');
    urlRef.current = ''; // Force re-setup
    setupAudio();
  }, [setupAudio]);

  // Setup audio when URL changes
  useEffect(() => {
    setupAudio();
  }, [setupAudio]);

  // Add event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const events = [
      ['play', handlePlay],
      ['pause', handlePause],
      ['ended', handleEnded],
      ['timeupdate', handleTimeUpdate],
      ['error', handleError]
    ] as const;

    events.forEach(([event, handler]) => {
      audio.addEventListener(event, handler);
    });

    return () => {
      events.forEach(([event, handler]) => {
        audio.removeEventListener(event, handler);
      });
    };
  }, [handlePlay, handlePause, handleEnded, handleTimeUpdate, handleError]);

  const renderMiniPlayer = () => (
    <div className="flex flex-col items-center justify-center gap-1 py-2">
      <Button
        onClick={togglePlayback}
        variant="default"
        size="icon"
        disabled={state.isLoading}
        className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
      >
        {state.isLoading ? (
          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        ) : state.isPlaying ? (
          <Square className="w-3 h-3 text-primary-foreground fill-current" />
        ) : (
          <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
        )}
      </Button>
      
      {state.hasError && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="w-3 h-3" />
            {state.errorMessage || 'Error'}
          </div>
          <Button
            onClick={retry}
            variant="ghost"
            size="sm"
            className="h-5 px-2 text-xs"
          >
            <RotateCcw className="w-2 h-2 mr-1" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );

  const renderFullPlayer = () => (
    <div className="flex flex-col gap-2 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <Button
          onClick={togglePlayback}
          variant="default"
          size="icon"
          disabled={state.isLoading}
          className="w-10 h-10 rounded-full"
        >
          {state.isLoading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : state.isPlaying ? (
            <Square className="w-4 h-4 text-primary-foreground fill-current" />
          ) : (
            <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
          )}
        </Button>
        
        <div className="flex-1">
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
        
        {state.duration && (
          <span className="text-sm text-muted-foreground">
            {Math.round(state.duration)}s
          </span>
        )}
      </div>
      
      {state.hasError && (
        <div className="flex items-center justify-between text-sm text-destructive">
          <span>{state.errorMessage || 'Playback error'}</span>
          <Button onClick={retry} variant="ghost" size="sm">
            <RotateCcw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {variant === 'mini' ? renderMiniPlayer() : renderFullPlayer()}
      <audio ref={audioRef} />
    </div>
  );
};

export default OptimizedAudioPlayer;