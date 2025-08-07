import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, AlertCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MiniVoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
}

// Codec detection utility
const detectBrowserSupport = () => {
  const audio = document.createElement('audio');
  const support = {
    webm: audio.canPlayType('audio/webm;codecs=opus') !== '',
    mp3: audio.canPlayType('audio/mpeg') !== '',
    safari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    mobile: /Mobi|Android/i.test(navigator.userAgent)
  };
  
  console.log('Browser audio support:', support);
  return support;
};

export const MiniVoiceMemoPlayer: React.FC<MiniVoiceMemoPlayerProps> = ({ voiceMemoUrl }) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    hasError: false
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const logAudioState = useCallback((event: string, details?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MiniVoiceMemoPlayer] ${event}:`, details);
    }
  }, []);

  const resetAudioState = useCallback(() => {
    setAudioState({
      isPlaying: false,
      isLoading: false,
      hasError: false
    });
  }, []);

  const handleAudioError = useCallback((error: any) => {
    const browserSupport = detectBrowserSupport();
    let errorMessage = 'Audio playback failed';
    
    if (browserSupport.safari && voiceMemoUrl.includes('.webm')) {
      errorMessage = 'WebM format not supported on Safari';
    } else if (!browserSupport.mp3 && !browserSupport.webm) {
      errorMessage = 'Browser doesn\'t support audio';
    }
    
    logAudioState('error', { error, browserSupport, url: voiceMemoUrl });
    
    setAudioState(prev => ({
      ...prev,
      isPlaying: false,
      isLoading: false,
      hasError: true,
      errorMessage
    }));
    
    toast({
      variant: "destructive",
      title: "Playback Error",
      description: errorMessage,
    });
  }, [voiceMemoUrl, logAudioState, toast]);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;
    
    try {
      if (audioState.isPlaying) {
        audioRef.current.pause();
        setAudioState(prev => ({ ...prev, isPlaying: false }));
        logAudioState('pause');
      } else {
        setAudioState(prev => ({ ...prev, isLoading: true }));
        logAudioState('play_attempt');
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setAudioState(prev => ({ 
                ...prev, 
                isPlaying: true, 
                isLoading: false,
                hasError: false 
              }));
              logAudioState('play_success');
            })
            .catch(handleAudioError);
        }
      }
    } catch (error) {
      handleAudioError(error);
    }
  }, [audioState.isPlaying, handleAudioError, logAudioState]);

  const retryPlayback = useCallback(() => {
    resetAudioState();
    
    // Force reload audio element
    if (audioRef.current) {
      audioRef.current.load();
    }
    
    logAudioState('manual_retry');
  }, [resetAudioState, logAudioState]);


  // Setup audio element and event listeners
  useEffect(() => {
    if (!voiceMemoUrl) return;
    
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleLoadedMetadata = () => {
      logAudioState('loadedmetadata', { duration: audio.duration });
      setAudioState(prev => ({ ...prev, hasError: false }));
    };
    
    const handleCanPlayThrough = () => {
      logAudioState('canplaythrough');
      setAudioState(prev => ({ ...prev, isLoading: false, hasError: false }));
    };
    
    const handleWaiting = () => {
      logAudioState('waiting');
      setAudioState(prev => ({ ...prev, isLoading: true }));
    };
    
    const handleAudioEnded = () => {
      logAudioState('ended');
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    };
    
    const handleTimeUpdate = () => {
      // Simple time update without complex logic
      if (audio.currentTime > 0 && audioState.isLoading) {
        setAudioState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleAudioError);
    
    // Reset state when URL changes
    resetAudioState();
    audio.load();
    
    // Cleanup
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [voiceMemoUrl, resetAudioState, handleAudioError, logAudioState, audioState.isLoading]);

  if (audioState.hasError) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={retryPlayback}
          className="h-8 w-8 rounded-full p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>Error</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayback}
        disabled={audioState.isLoading}
        className="h-8 w-8 rounded-full p-0"
      >
        {audioState.isLoading ? (
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        ) : audioState.isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      
      {audioState.isLoading && (
        <span className="text-xs text-muted-foreground">Loading...</span>
      )}
      
      <audio
        ref={audioRef}
        preload="metadata"
        className="hidden"
      >
        <source src={voiceMemoUrl} type="audio/mpeg" />
        <source src={voiceMemoUrl} type="audio/webm" />
        Your browser does not support audio playback.
      </audio>
    </div>
  );
};

