import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, RotateCcw } from "lucide-react";

interface VoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

// Audio state management
interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  hasError: boolean;
  isStalled: boolean;
  retryCount: number;
  networkState: number;
  readyState: number;
  lastPlayPosition: number;
}

const VoiceMemoPlayer = ({ voiceMemoUrl }: VoiceMemoPlayerProps) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: true,
    isBuffering: false,
    hasError: false,
    isStalled: false,
    retryCount: 0,
    networkState: 0,
    readyState: 0,
    lastPlayPosition: 0,
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playPositionRef = useRef<number>(0);
  const { toast } = useToast();

  // Enhanced logging for debugging
  const logAudioState = useCallback((event: string, details?: any) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log(`[VoiceMemoPlayer] ${event}:`, {
      currentTime: audio.currentTime,
      duration: audio.duration,
      readyState: audio.readyState,
      networkState: audio.networkState,
      buffered: audio.buffered.length > 0 ? {
        start: audio.buffered.start(0),
        end: audio.buffered.end(audio.buffered.length - 1)
      } : null,
      paused: audio.paused,
      ended: audio.ended,
      ...details
    });
  }, []);

  // Retry logic with exponential backoff
  const scheduleRetry = useCallback((attempt: number) => {
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10s delay
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    retryTimeoutRef.current = setTimeout(() => {
      logAudioState('Retrying playback', { attempt });
      setAudioState(prev => ({ 
        ...prev, 
        hasError: false, 
        isLoading: true,
        retryCount: attempt 
      }));
      
      if (audioRef.current) {
        audioRef.current.load();
      }
    }, delay);
  }, [logAudioState]);

  // Enhanced playback with recovery
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioState.isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      playPositionRef.current = 0;
      setAudioState(prev => ({ ...prev, isPlaying: false }));
      logAudioState('Playback stopped');
    } else {
      try {
        // Store position for recovery
        playPositionRef.current = audio.currentTime;
        
        // Check if we need to restart from a saved position
        if (audioState.lastPlayPosition > 0 && audio.currentTime === 0) {
          audio.currentTime = audioState.lastPlayPosition;
        }
        
        logAudioState('Attempting playback');
        await audio.play();
        setAudioState(prev => ({ ...prev, isPlaying: true, hasError: false }));
        logAudioState('Playback started successfully');
      } catch (error) {
        logAudioState('Playback failed', { error: error.message });
        console.error("Audio playback error:", error);
        
        // Handle different error types
        if (error.name === 'NotAllowedError') {
          toast({
            title: "Audio Blocked",
            description: "Please allow audio playback in your browser settings",
            variant: "destructive",
          });
        } else if (audioState.retryCount < 3) {
          scheduleRetry(audioState.retryCount + 1);
          return;
        }
        
        setAudioState(prev => ({ 
          ...prev, 
          hasError: true, 
          isPlaying: false,
          lastPlayPosition: playPositionRef.current
        }));
      }
    }
  }, [audioState.isPlaying, audioState.retryCount, audioState.lastPlayPosition, logAudioState, scheduleRetry, toast]);

  // Comprehensive event handlers
  const handleLoadStart = useCallback(() => {
    logAudioState('Load started');
    setAudioState(prev => ({ ...prev, isLoading: true, hasError: false }));
  }, [logAudioState]);

  const handleLoadedMetadata = useCallback(() => {
    logAudioState('Metadata loaded');
    setAudioState(prev => ({ 
      ...prev, 
      isLoading: false, 
      hasError: false,
      networkState: audioRef.current?.networkState || 0,
      readyState: audioRef.current?.readyState || 0
    }));
  }, [logAudioState]);

  const handleCanPlayThrough = useCallback(() => {
    logAudioState('Can play through');
    setAudioState(prev => ({ 
      ...prev, 
      isLoading: false, 
      isBuffering: false, 
      hasError: false,
      isStalled: false,
      retryCount: 0
    }));
  }, [logAudioState]);

  const handleWaiting = useCallback(() => {
    logAudioState('Waiting for data');
    setAudioState(prev => ({ ...prev, isBuffering: true }));
  }, [logAudioState]);

  const handleProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Check for stalled download
    if (audio.networkState === HTMLMediaElement.NETWORK_LOADING) {
      setAudioState(prev => ({ ...prev, isStalled: false }));
    }
  }, []);

  const handleStalled = useCallback(() => {
    logAudioState('Download stalled');
    setAudioState(prev => ({ ...prev, isStalled: true, isBuffering: true }));
    
    // Auto-retry if stalled for too long
    setTimeout(() => {
      if (audioRef.current && audioState.isStalled) {
        logAudioState('Recovering from stall');
        audioRef.current.load();
      }
    }, 3000);
  }, [audioState.isStalled, logAudioState]);

  const handleSuspend = useCallback(() => {
    logAudioState('Download suspended');
    setAudioState(prev => ({ ...prev, isBuffering: false }));
  }, [logAudioState]);

  const handleAudioEnded = useCallback(() => {
    logAudioState('Playback ended');
    setAudioState(prev => ({ ...prev, isPlaying: false }));
    playPositionRef.current = 0;
  }, [logAudioState]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      playPositionRef.current = audioRef.current.currentTime;
    }
  }, []);

  const handleAudioError = useCallback((e: any) => {
    const error = e.target?.error;
    logAudioState('Audio error', { 
      code: error?.code, 
      message: error?.message,
      retryCount: audioState.retryCount 
    });
    
    // Try different recovery strategies based on error type
    if (error?.code === MediaError.MEDIA_ERR_NETWORK && audioState.retryCount < 3) {
      scheduleRetry(audioState.retryCount + 1);
      return;
    }
    
    setAudioState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      hasError: true, 
      isLoading: false, 
      isBuffering: false,
      lastPlayPosition: playPositionRef.current
    }));
  }, [audioState.retryCount, logAudioState, scheduleRetry]);

  // Manual retry function
  const retryPlayback = useCallback(() => {
    logAudioState('Manual retry requested');
    setAudioState(prev => ({ 
      ...prev, 
      hasError: false, 
      isLoading: true, 
      retryCount: 0 
    }));
    
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [logAudioState]);


  // Enhanced useEffect with comprehensive event handling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset state when URL changes
    setAudioState({
      isPlaying: false,
      isLoading: true,
      isBuffering: false,
      hasError: false,
      isStalled: false,
      retryCount: 0,
      networkState: 0,
      readyState: 0,
      lastPlayPosition: 0,
    });
    playPositionRef.current = 0;

    // Comprehensive event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('suspend', handleSuspend);
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleAudioError);

    // Browser-specific optimizations
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isMobile || isSafari) {
      // Mobile browsers need special handling
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('suspend', handleSuspend);
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [voiceMemoUrl, handleLoadStart, handleLoadedMetadata, handleCanPlayThrough, handleWaiting, handleProgress, handleStalled, handleSuspend, handleAudioEnded, handleTimeUpdate, handleAudioError]);

  return (
    <div className="mb-4 text-center">
      <div className="mb-2">
        <p className="text-lg font-medium text-foreground">
          🎤 Voice Message
        </p>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-muted-foreground mt-1">
            {audioState.isStalled && "⚠️ Stalled"} 
            {audioState.retryCount > 0 && ` (Retry ${audioState.retryCount})`}
            {audioRef.current && ` Ready: ${audioRef.current.readyState}/4`}
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center justify-center gap-2">
        <Button
          onClick={togglePlayback}
          variant="default"
          size="lg"
          disabled={audioState.isLoading && !audioState.hasError}
          className="w-20 h-16 rounded-xl bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
        >
          {audioState.isLoading || audioState.isBuffering ? (
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : audioState.isPlaying ? (
            <Square className="w-5 h-5 text-primary-foreground fill-current" />
          ) : (
            <Play className="w-6 h-6 text-primary-foreground ml-1" />
          )}
        </Button>
        
        {/* Enhanced status display */}
        {audioState.isStalled && !audioState.hasError && (
          <div className="text-sm text-amber-500">
            Connection slow, retrying...
          </div>
        )}
        
        {audioState.hasError && (
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-destructive">
              Playback failed {audioState.retryCount > 0 && `(${audioState.retryCount} retries)`}
            </div>
            <Button
              onClick={retryPlayback}
              variant="outline"
              size="sm"
              className="text-xs px-3 py-1"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Try Again
            </Button>
          </div>
        )}
      </div>
      
      <audio
        ref={audioRef}
        preload="auto"
        crossOrigin="anonymous"
      >
        <source src={voiceMemoUrl} type="audio/webm" />
        <source src={voiceMemoUrl} type="audio/mp4" />
        <source src={voiceMemoUrl} type="audio/mpeg" />
        <source src={voiceMemoUrl} type="audio/wav" />
        <source src={voiceMemoUrl} type="audio/ogg" />
      </audio>
    </div>
  );
};

export default VoiceMemoPlayer;