import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, RotateCcw } from "lucide-react";

interface VoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

// Simplified audio state
interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
}

const VoiceMemoPlayer = ({ voiceMemoUrl }: VoiceMemoPlayerProps) => {
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
            title: "Audio Blocked",
            description: "Please allow audio playback in your browser settings",
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

  // Essential event handlers
  const handleCanPlayThrough = useCallback(() => {
    setAudioState(prev => ({ 
      ...prev, 
      isLoading: false, 
      hasError: false
    }));
  }, []);

  const handleAudioEnded = useCallback(() => {
    setAudioState(prev => ({ ...prev, isPlaying: false }));
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
    <div className="mb-4 text-center">
      <div className="mb-2">
        <p className="text-lg font-medium text-foreground">
          🎤 Voice Message
        </p>
        
      </div>
      
      <div className="flex flex-col items-center justify-center gap-2">
        <Button
          onClick={togglePlayback}
          variant="default"
          size="lg"
          disabled={audioState.isLoading && !audioState.hasError}
          className="w-20 h-16 rounded-xl bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
        >
          {audioState.isLoading ? (
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : audioState.isPlaying ? (
            <Square className="w-5 h-5 text-primary-foreground fill-current" />
          ) : (
            <Play className="w-6 h-6 text-primary-foreground ml-1" />
          )}
        </Button>
        
        {audioState.hasError && (
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-destructive">
              Playback failed
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