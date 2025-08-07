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
  isLoading: boolean;
  hasError: boolean;
}

const MiniVoiceMemoPlayer = ({ voiceMemoUrl }: MiniVoiceMemoPlayerProps) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: true,
    hasError: false,
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Simple playback toggle
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioState.isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    } else {
      try {
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
        }
        
        setAudioState(prev => ({ 
          ...prev, 
          hasError: true, 
          isPlaying: false
        }));
      }
    }
  }, [audioState.isPlaying, toast]);

  // Essential event handlers for mini player
  const handleCanPlayThrough = useCallback(() => {
    setAudioState(prev => ({ 
      ...prev, 
      isLoading: false, 
      hasError: false
    }));
  }, []);

  const handleAudioEnded = useCallback(() => {
    setAudioState(prev => ({ 
      ...prev, 
      isPlaying: false
    }));
  }, []);

  const handleAudioError = useCallback(() => {
    setAudioState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      hasError: true, 
      isLoading: false
    }));
  }, []);

  const retryPlayback = useCallback(() => {
    setAudioState(prev => ({ 
      ...prev, 
      hasError: false, 
      isLoading: true
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
      hasError: false,
    });

    // Essential event listeners only
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [voiceMemoUrl, handleCanPlayThrough, handleAudioEnded, handleAudioError]);

  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2">
      <Button
        onClick={togglePlayback}
        variant="default"
        size="icon"
        disabled={audioState.isLoading && !audioState.hasError}
        className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
      >
        {audioState.isLoading ? (
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