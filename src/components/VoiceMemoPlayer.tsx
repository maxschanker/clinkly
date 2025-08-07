import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Play, Square, RotateCcw } from "lucide-react";

interface VoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

// Enhanced audio state for better buffering and playback
interface AudioState {
  isPlaying: boolean;
  isError: boolean;
  isBuffering: boolean;
  canPlay: boolean;
  errorMessage?: string;
}

const VoiceMemoPlayer = ({ voiceMemoUrl }: VoiceMemoPlayerProps) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isError: false,
    isBuffering: false,
    canPlay: false,
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const { toast } = useToast();

  // Enhanced playback toggle with buffering awareness
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || audioState.isError) return;

    console.log('🎵 Voice memo player toggle:', { 
      isPlaying: audioState.isPlaying, 
      readyState: audio.readyState,
      canPlay: audioState.canPlay,
      buffered: audio.buffered.length > 0 ? audio.buffered.end(0) : 0
    });

    if (audioState.isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    // Wait for audio to be ready before playing
    if (!audioState.canPlay) {
      console.log('🔄 Audio not ready, triggering load');
      setAudioState(prev => ({ ...prev, isBuffering: true }));
      audio.load();
      return;
    }

    // Clear any existing timeout
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }
    
    // Reset error state and set buffering
    setAudioState(prev => ({ ...prev, isError: false, isBuffering: true, errorMessage: undefined }));
    
    // Set a 10-second timeout for play attempt (increased for better buffering)
    playTimeoutRef.current = setTimeout(() => {
      console.warn('⚠️ Audio play timeout after 10s');
      setAudioState(prev => ({ 
        ...prev, 
        isError: true, 
        isPlaying: false,
        isBuffering: false,
        errorMessage: 'Playback timeout - try again'
      }));
    }, 10000);

    try {
      await audio.play();
      // Clear timeout on successful play
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
      setAudioState(prev => ({ ...prev, isBuffering: false }));
      retryCountRef.current = 0; // Reset retry count on success
    } catch (error) {
      console.error("🚫 Audio playback error:", error);
      
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle specific errors
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Audio permission needed",
          description: "Please allow audio playback and try again",
          variant: "destructive",
        });
        setAudioState(prev => ({ 
          ...prev, 
          isError: true, 
          isPlaying: false,
          isBuffering: false,
          errorMessage: 'Permission denied'
        }));
      } else {
        // Implement exponential backoff for retries
        retryCountRef.current += 1;
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000);
        
        setAudioState(prev => ({ 
          ...prev, 
          isError: true, 
          isPlaying: false,
          isBuffering: false,
          errorMessage: `Playback failed - retry ${retryCountRef.current}`
        }));
        
        // Auto-retry with exponential backoff (max 3 attempts)
        if (retryCountRef.current <= 3) {
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.load();
            }
          }, retryDelay);
        }
      }
    }
  }, [audioState.isPlaying, audioState.isError, audioState.canPlay, toast]);

  // Enhanced audio event handlers with buffering support
  const handleLoadStart = useCallback(() => {
    console.log('📥 Audio load started');
    setAudioState(prev => ({ ...prev, isBuffering: true, canPlay: false }));
  }, []);

  const handleCanPlay = useCallback(() => {
    console.log('✅ Audio can play');
    setAudioState(prev => ({ ...prev, canPlay: true, isBuffering: false }));
  }, []);

  const handleCanPlayThrough = useCallback(() => {
    console.log('🚀 Audio can play through');
    setAudioState(prev => ({ ...prev, canPlay: true, isBuffering: false }));
  }, []);

  const handleWaiting = useCallback(() => {
    console.log('⏳ Audio waiting for data');
    setAudioState(prev => ({ ...prev, isBuffering: true }));
  }, []);

  const handleStalled = useCallback(() => {
    console.log('🐌 Audio download stalled');
    setAudioState(prev => ({ ...prev, isBuffering: true }));
  }, []);

  const handlePlaying = useCallback(() => {
    console.log('▶️ Audio playing');
    setAudioState(prev => ({ 
      ...prev, 
      isPlaying: true, 
      isError: false,
      isBuffering: false 
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
      isError: true, 
      errorMessage
    }));
  }, []);

  const retryPlayback = useCallback(() => {
    console.log('🔄 Manual retry audio playback');
    retryCountRef.current = 0; // Reset retry count
    setAudioState({ 
      isPlaying: false,
      isError: false,
      isBuffering: false,
      canPlay: false,
      errorMessage: undefined
    });
    
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, []);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('🎵 Setting up audio for URL:', voiceMemoUrl);

    // Reset state when URL changes - button is immediately functional
    setAudioState({
      isPlaying: false,
      isError: false,
      isBuffering: false,
      canPlay: false,
    });

    // Reset retry count for new audio
    retryCountRef.current = 0;

    // Enhanced buffering event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      // Clear any pending timeouts
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
      
      // Remove all event listeners
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [voiceMemoUrl, handleLoadStart, handleCanPlay, handleCanPlayThrough, handleWaiting, handleStalled, handlePlaying, handlePause, handleEnded, handleError]);

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
          disabled={audioState.isBuffering}
          className="w-20 h-16 rounded-xl bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
        >
          {audioState.isBuffering ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : audioState.isPlaying ? (
            <Square className="w-5 h-5 text-primary-foreground fill-current" />
          ) : (
            <Play className="w-6 h-6 text-primary-foreground ml-1" />
          )}
        </Button>
        
        {audioState.isBuffering && !audioState.isError && (
          <div className="text-sm text-muted-foreground">
            Loading audio...
          </div>
        )}
        
        {audioState.isError && (
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
        <source src={voiceMemoUrl} type="audio/mp4" />
        <source src={voiceMemoUrl} type="audio/mpeg" />
        <source src={voiceMemoUrl} type="audio/webm" />
        <source src={voiceMemoUrl} type="audio/wav" />
        <source src={voiceMemoUrl} type="audio/ogg" />
      </audio>
    </div>
  );
};

export default VoiceMemoPlayer;