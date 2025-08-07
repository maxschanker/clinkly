import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, RotateCcw } from "lucide-react";

interface MiniVoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

// Audio state management for mini player
interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  hasError: boolean;
  isStalled: boolean;
  retryCount: number;
  lastPlayPosition: number;
}

const MiniVoiceMemoPlayer = ({ voiceMemoUrl }: MiniVoiceMemoPlayerProps) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: true,
    isBuffering: false,
    hasError: false,
    isStalled: false,
    retryCount: 0,
    lastPlayPosition: 0,
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playPositionRef = useRef<number>(0);
  const { toast } = useToast();

  // Retry logic with exponential backoff
  const scheduleRetry = useCallback((attempt: number) => {
    const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Max 5s delay for mini player
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    retryTimeoutRef.current = setTimeout(() => {
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
  }, []);

  // Enhanced playback with recovery
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioState.isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      playPositionRef.current = 0;
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    } else {
      try {
        playPositionRef.current = audio.currentTime;
        
        if (audioState.lastPlayPosition > 0 && audio.currentTime === 0) {
          audio.currentTime = audioState.lastPlayPosition;
        }
        
        await audio.play();
        setAudioState(prev => ({ ...prev, isPlaying: true, hasError: false }));
      } catch (error) {
        console.error("Audio playback error:", error);
        
        if (error.name === 'NotAllowedError') {
          toast({
            title: "Audio permission needed",
            description: "Please allow audio playback",
            variant: "destructive",
          });
        } else if (audioState.retryCount < 2) { // Fewer retries for mini player
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
  }, [audioState.isPlaying, audioState.retryCount, audioState.lastPlayPosition, scheduleRetry, toast]);

  // Streamlined event handlers for mini player
  const handleLoadedMetadata = useCallback(() => {
    setAudioState(prev => ({ 
      ...prev, 
      isLoading: false, 
      hasError: false
    }));
  }, []);

  const handleCanPlayThrough = useCallback(() => {
    setAudioState(prev => ({ 
      ...prev, 
      isLoading: false, 
      isBuffering: false, 
      hasError: false,
      isStalled: false,
      retryCount: 0
    }));
  }, []);

  const handleWaiting = useCallback(() => {
    setAudioState(prev => ({ ...prev, isBuffering: true }));
  }, []);

  const handleStalled = useCallback(() => {
    setAudioState(prev => ({ ...prev, isStalled: true, isBuffering: true }));
    
    // More conservative stall recovery - wait longer and check if actually needed
    setTimeout(() => {
      if (audioRef.current && audioState.isStalled && !audioState.isPlaying && audioState.retryCount < 1) {
        // Only reload if we've been stalled for a while and aren't currently playing
        console.log("Stall recovery: reloading audio after extended timeout");
        audioRef.current.load();
      }
    }, 8000); // Increased from 2 seconds to 8 seconds
  }, [audioState.isStalled, audioState.isPlaying, audioState.retryCount]);

  const handleAudioEnded = useCallback(() => {
    setAudioState(prev => ({ ...prev, isPlaying: false }));
    playPositionRef.current = 0;
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      playPositionRef.current = audioRef.current.currentTime;
    }
  }, []);

  const handleAudioError = useCallback((e: any) => {
    const error = e.target?.error;
    
    if (error?.code === MediaError.MEDIA_ERR_NETWORK && audioState.retryCount < 2) {
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
  }, [audioState.retryCount, scheduleRetry]);

  const retryPlayback = useCallback(() => {
    setAudioState(prev => ({ 
      ...prev, 
      hasError: false, 
      isLoading: true, 
      retryCount: 0 
    }));
    
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, []);

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
      lastPlayPosition: 0,
    });
    playPositionRef.current = 0;

    // Essential event listeners for mini player
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleAudioError);

    // Mobile optimizations
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [voiceMemoUrl, handleLoadedMetadata, handleCanPlayThrough, handleWaiting, handleStalled, handleAudioEnded, handleTimeUpdate, handleAudioError]);

  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2">
      <Button
        onClick={togglePlayback}
        variant="default"
        size="icon"
        disabled={audioState.isLoading && !audioState.hasError}
        className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
      >
        {audioState.isLoading || audioState.isBuffering ? (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : audioState.isPlaying ? (
          <Square className="w-3 h-3 text-primary-foreground fill-current" />
        ) : (
          <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
        )}
      </Button>
      
      {audioState.isStalled && !audioState.hasError && (
        <div className="text-xs text-amber-500">
          Retrying...
        </div>
      )}
      
      {audioState.hasError && (
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs text-destructive">
            Error
          </div>
          <Button
            onClick={retryPlayback}
            variant="ghost"
            size="sm"
            className="h-5 px-2 text-xs"
          >
            <RotateCcw className="w-2 h-2 mr-1" />
            Retry
          </Button>
        </div>
      )}
      
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

export default MiniVoiceMemoPlayer;