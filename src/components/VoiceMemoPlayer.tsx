import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, RotateCcw } from "lucide-react";

interface VoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

// Enhanced audio state for comprehensive lifecycle tracking
interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  hasError: boolean;
  errorMessage?: string;
  canPlay: boolean;
  duration?: number;
}

const VoiceMemoPlayer = ({ voiceMemoUrl }: VoiceMemoPlayerProps) => {
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

  // Enhanced playback toggle with proper state management
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || audioState.hasError || !audioState.canPlay) return;

    console.log('🎵 Voice memo player toggle:', { 
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
        console.warn('⚠️ Audio play timeout - treating as error');
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
        console.error("🚫 Audio playback error:", error);
        
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

  // Comprehensive audio event handlers
  const handleLoadStart = useCallback(() => {
    console.log('🔄 Audio load start');
    setAudioState(prev => ({ ...prev, isLoading: true, hasError: false }));
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    console.log('📊 Audio metadata loaded', { duration: audio?.duration });
    setAudioState(prev => ({ 
      ...prev, 
      duration: audio?.duration 
    }));
  }, []);

  const handleCanPlay = useCallback(() => {
    console.log('✅ Audio can play');
    setAudioState(prev => ({ 
      ...prev, 
      canPlay: true,
      isLoading: false,
      hasError: false
    }));
  }, []);

  const handleCanPlayThrough = useCallback(() => {
    console.log('✅ Audio can play through');
    setAudioState(prev => ({ 
      ...prev, 
      isLoading: false, 
      isBuffering: false,
      canPlay: true,
      hasError: false
    }));
  }, []);

  const handlePlaying = useCallback(() => {
    console.log('▶️ Audio playing');
    setAudioState(prev => ({ 
      ...prev, 
      isPlaying: true, 
      isBuffering: false,
      hasError: false 
    }));
  }, []);

  const handlePause = useCallback(() => {
    console.log('⏸️ Audio paused');
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleEnded = useCallback(() => {
    console.log('🏁 Audio ended');
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleWaiting = useCallback(() => {
    console.log('⏳ Audio waiting/buffering');
    setAudioState(prev => ({ ...prev, isBuffering: true }));
  }, []);

  const handleStalled = useCallback(() => {
    console.warn('🐌 Audio stalled');
    setAudioState(prev => ({ ...prev, isBuffering: true }));
  }, []);

  const handleError = useCallback((event: Event) => {
    const audio = audioRef.current;
    const error = audio?.error;
    console.error('🚫 Audio error:', error);
    
    let errorMessage = 'Playback failed';
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMessage = 'Playback aborted';
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error';
          break;
        case error.MEDIA_ERR_DECODE:
          errorMessage = 'Decode error';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Audio format not supported';
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
    console.log('🔄 Retrying audio playback');
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

    console.log('🎵 Setting up audio for URL:', voiceMemoUrl);

    // Reset state when URL changes
    setAudioState({
      isPlaying: false,
      isLoading: true,
      isBuffering: false,
      hasError: false,
      canPlay: false,
    });

    // Comprehensive event listeners for full audio lifecycle
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
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
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('error', handleError);
    };
  }, [voiceMemoUrl, handleLoadStart, handleLoadedMetadata, handleCanPlay, handleCanPlayThrough, 
      handlePlaying, handlePause, handleEnded, handleWaiting, handleStalled, handleError]);

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
          disabled={(audioState.isLoading && !audioState.hasError) || !audioState.canPlay}
          className="w-20 h-16 rounded-xl bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
        >
          {(audioState.isLoading || audioState.isBuffering) && !audioState.hasError ? (
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
              {audioState.errorMessage || 'Playback failed'}
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