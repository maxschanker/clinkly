import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, RotateCcw } from "lucide-react";

interface MiniVoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

// Enhanced audio state for mini player
interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  hasError: boolean;
  errorMessage?: string;
  canPlay: boolean;
}

const MiniVoiceMemoPlayer = ({ voiceMemoUrl }: MiniVoiceMemoPlayerProps) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: true,
    isBuffering: false,
    hasError: false,
    canPlay: false,
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Enhanced playback toggle for mini player
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || audioState.hasError || !audioState.canPlay) return;

    console.log('🎵 Mini player toggle:', { 
      isPlaying: audioState.isPlaying, 
      canPlay: audioState.canPlay,
      readyState: audio.readyState 
    });

    if (audioState.isPlaying) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a timeout for play attempt
      timeoutRef.current = setTimeout(() => {
        console.warn('⚠️ Mini player timeout - treating as error');
        setAudioState(prev => ({ 
          ...prev, 
          hasError: true, 
          isPlaying: false,
          isBuffering: false,
          errorMessage: 'Playback timeout'
        }));
      }, 10000);

      try {
        setAudioState(prev => ({ ...prev, isBuffering: true }));
        await audio.play();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } catch (error) {
        console.error("🚫 Mini player error:", error);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (error.name === 'NotAllowedError') {
          toast({
            title: "Audio permission needed",
            description: "Please allow audio playback",
            variant: "destructive",
          });
        }
        
        setAudioState(prev => ({ 
          ...prev, 
          hasError: true, 
          isPlaying: false,
          isBuffering: false,
          errorMessage
        }));
      }
    }
  }, [audioState.isPlaying, audioState.canPlay, audioState.hasError, toast]);

  // Comprehensive audio event handlers for mini player
  const handleLoadStart = useCallback(() => {
    console.log('🔄 Mini player load start');
    setAudioState(prev => ({ ...prev, isLoading: true, hasError: false }));
  }, []);

  const handleCanPlay = useCallback(() => {
    console.log('✅ Mini player can play');
    setAudioState(prev => ({ 
      ...prev, 
      canPlay: true,
      isLoading: false,
      hasError: false
    }));
  }, []);

  const handleCanPlayThrough = useCallback(() => {
    console.log('✅ Mini player can play through');
    setAudioState(prev => ({ 
      ...prev, 
      isLoading: false, 
      isBuffering: false,
      canPlay: true,
      hasError: false
    }));
  }, []);

  const handlePlaying = useCallback(() => {
    console.log('▶️ Mini player playing');
    setAudioState(prev => ({ 
      ...prev, 
      isPlaying: true, 
      isBuffering: false,
      hasError: false 
    }));
  }, []);

  const handlePause = useCallback(() => {
    console.log('⏸️ Mini player paused');
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleEnded = useCallback(() => {
    console.log('🏁 Mini player ended');
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleWaiting = useCallback(() => {
    console.log('⏳ Mini player waiting/buffering');
    setAudioState(prev => ({ ...prev, isBuffering: true }));
  }, []);

  const handleStalled = useCallback(() => {
    console.warn('🐌 Mini player stalled');
    setAudioState(prev => ({ ...prev, isBuffering: true }));
  }, []);

  const handleError = useCallback((event: Event) => {
    const audio = audioRef.current;
    const error = audio?.error;
    console.error('🚫 Mini player error:', error);
    
    let errorMessage = 'Error';
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMessage = 'Aborted';
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error';
          break;
        case error.MEDIA_ERR_DECODE:
          errorMessage = 'Decode error';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Format error';
          break;
      }
    }
    
    setAudioState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      hasError: true, 
      isLoading: false,
      isBuffering: false,
      errorMessage
    }));
  }, []);

  const retryPlayback = useCallback(() => {
    console.log('🔄 Mini player retry');
    setAudioState(prev => ({ 
      ...prev, 
      hasError: false, 
      isLoading: true,
      isBuffering: false,
      canPlay: false,
      errorMessage: undefined
    }));
    
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('🎵 Mini player setup for URL:', voiceMemoUrl);

    // Reset state when URL changes
    setAudioState({
      isPlaying: false,
      isLoading: true,
      isBuffering: false,
      hasError: false,
      canPlay: false,
    });

    // Comprehensive event listeners for mini player
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('error', handleError);

    return () => {
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Remove all event listeners
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('error', handleError);
    };
  }, [voiceMemoUrl, handleLoadStart, handleCanPlay, handleCanPlayThrough, 
      handlePlaying, handlePause, handleEnded, handleWaiting, handleStalled, handleError]);

  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2">
      <Button
        onClick={togglePlayback}
        variant="default"
        size="icon"
        disabled={(audioState.isLoading && !audioState.hasError) || !audioState.canPlay}
        className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
      >
        {(audioState.isLoading || audioState.isBuffering) && !audioState.hasError ? (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : audioState.isPlaying ? (
          <Square className="w-3 h-3 text-primary-foreground fill-current" />
        ) : (
          <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
        )}
      </Button>
      
      
      {audioState.hasError && (
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs text-destructive">
            {audioState.errorMessage || 'Error'}
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