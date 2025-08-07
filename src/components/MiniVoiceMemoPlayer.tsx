import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, RotateCcw } from "lucide-react";

interface MiniVoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

// Simplified audio state for mini player
interface AudioState {
  isPlaying: boolean;
  isError: boolean;
  errorMessage?: string;
}

const MiniVoiceMemoPlayer = ({ voiceMemoUrl }: MiniVoiceMemoPlayerProps) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isError: false,
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const { toast } = useToast();

  // Simplified playback toggle for mini player
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || audioState.isError) return;

    console.log('🎵 Mini player toggle:', { 
      isPlaying: audioState.isPlaying, 
      readyState: audio.readyState 
    });

    if (audioState.isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    // Clear any existing timeout
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }
    
    // Reset error state
    setAudioState(prev => ({ ...prev, isError: false, errorMessage: undefined }));
    
    // Set a 5-second timeout for play attempt
    playTimeoutRef.current = setTimeout(() => {
      console.warn('⚠️ Mini player timeout after 5s');
      setAudioState(prev => ({ 
        ...prev, 
        isError: true, 
        isPlaying: false,
        errorMessage: 'Timeout'
      }));
    }, 5000);

    try {
      await audio.play();
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
      retryCountRef.current = 0;
    } catch (error) {
      console.error("🚫 Mini player error:", error);
      
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Audio permission needed",
          description: "Please allow audio playback",
          variant: "destructive",
        });
        setAudioState(prev => ({ 
          ...prev, 
          isError: true, 
          isPlaying: false,
          errorMessage: 'Permission'
        }));
      } else {
        retryCountRef.current += 1;
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000);
        
        setAudioState(prev => ({ 
          ...prev, 
          isError: true, 
          isPlaying: false,
          errorMessage: 'Error'
        }));
        
        if (retryCountRef.current <= 3) {
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.load();
            }
          }, retryDelay);
        }
      }
    }
  }, [audioState.isPlaying, audioState.isError, toast]);

  // Simplified audio event handlers for mini player
  const handlePlaying = useCallback(() => {
    console.log('▶️ Mini player playing');
    setAudioState(prev => ({ 
      ...prev, 
      isPlaying: true, 
      isError: false 
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
          errorMessage = 'Network';
          break;
        case error.MEDIA_ERR_DECODE:
          errorMessage = 'Decode';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Format';
          break;
      }
    }
    
    setAudioState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      isError: true, 
      errorMessage
    }));
  }, []);

  const retryPlayback = useCallback(() => {
    console.log('🔄 Mini player manual retry');
    retryCountRef.current = 0;
    setAudioState({ 
      isPlaying: false,
      isError: false, 
      errorMessage: undefined
    });
    
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('🎵 Mini player setup for URL:', voiceMemoUrl);

    // Reset state when URL changes - button is immediately functional
    setAudioState({
      isPlaying: false,
      isError: false,
    });

    // Reset retry count for new audio
    retryCountRef.current = 0;

    // Only track essential events
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      // Clear any pending timeouts
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
      
      // Remove event listeners
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [voiceMemoUrl, handlePlaying, handlePause, handleEnded, handleError]);

  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2">
      <Button
        onClick={togglePlayback}
        variant="default"
        size="icon"
        disabled={false}
        className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
      >
        {audioState.isPlaying ? (
          <Square className="w-3 h-3 text-primary-foreground fill-current" />
        ) : (
          <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
        )}
      </Button>
      
      
      {audioState.isError && (
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
        preload="metadata"
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