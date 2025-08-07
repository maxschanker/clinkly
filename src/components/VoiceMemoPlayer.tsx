import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, AlertCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceMemoPlayerProps {
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

export const VoiceMemoPlayer: React.FC<VoiceMemoPlayerProps> = ({ voiceMemoUrl }) => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    hasError: false
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const logAudioState = useCallback((event: string, details?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[VoiceMemoPlayer] ${event}:`, details);
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
      errorMessage = 'WebM format not supported on Safari. Try refreshing or using Chrome.';
    } else if (!browserSupport.mp3 && !browserSupport.webm) {
      errorMessage = 'Your browser doesn\'t support audio playback';
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

  const buttonText = audioState.isLoading 
    ? 'Loading...' 
    : audioState.isPlaying 
      ? 'Pause' 
      : 'Play';

  const ButtonIcon = audioState.isLoading 
    ? null 
    : audioState.isPlaying 
      ? Pause 
      : Play;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlayback}
          disabled={audioState.isLoading || audioState.hasError}
          className="flex items-center gap-2"
        >
          {ButtonIcon && <ButtonIcon className="h-4 w-4" />}
          {buttonText}
        </Button>
        
        {audioState.hasError && (
          <Button
            variant="ghost"
            size="sm"
            onClick={retryPlayback}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
      
      {audioState.hasError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{audioState.errorMessage || 'Audio playback failed'}</span>
        </div>
      )}
      
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground mt-2">
          Debug: {JSON.stringify({ 
            ...audioState, 
            url: voiceMemoUrl.slice(-20),
            support: detectBrowserSupport()
          })}
        </div>
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

