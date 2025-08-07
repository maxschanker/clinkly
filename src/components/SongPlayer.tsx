
import { useRef, useEffect, useCallback } from "react";
import { Play, Pause, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileAudioManager } from "@/hooks/useMobileAudioManager";
import { InteractionGatekeeper } from "./InteractionGatekeeper";
import { ProgressiveMusicLoader } from "./ProgressiveMusicLoader";
import { FallbackMusicPlayer } from "./FallbackMusicPlayer";

interface SongPlayerProps {
  song: {
    id: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
    duration: string;
  };
  className?: string;
}

export function SongPlayer({ song, className = "" }: SongPlayerProps) {
  const {
    state,
    isMobile,
    clearTimeouts,
    setUserInteracted,
    setPlayerReady,
    setPlaybackState,
    setError,
    setFallbackMode,
    shouldUseFallback,
    startPlayerReadyTimeout,
    startPlaybackTimeout,
    updateState
  } = useMobileAudioManager();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Enhanced embed URL with better mobile parameters
  const embedUrl = `https://www.youtube.com/embed/${song.id}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&controls=0&modestbranding=1&rel=0&showinfo=0&autoplay=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&widget_referrer=${encodeURIComponent(window.location.href)}&html5=1`;

  // Direct YouTube link for fallback
  const directYouTubeUrl = `https://www.youtube.com/watch?v=${song.id}`;

  const sendPlayerCommand = useCallback((command: string) => {
    if (!iframeRef.current?.contentWindow || !state.playerReady) {
      console.warn('Player not ready for command:', command);
      return false;
    }

    try {
      const message = JSON.stringify({
        event: "command",
        func: command,
        args: ""
      });
      
      console.log('Sending player command:', message);
      iframeRef.current.contentWindow.postMessage(message, '*');
      return true;
    } catch (error) {
      console.error('Error sending player command:', error);
      return false;
    }
  }, [state.playerReady]);

  const handleDirectPlayback = useCallback(() => {
    console.log('Opening YouTube directly');
    window.open(directYouTubeUrl, '_blank');
    setFallbackMode('direct-link');
  }, [directYouTubeUrl, setFallbackMode]);

  const handleUserInteraction = useCallback(() => {
    console.log('User interaction detected, initializing player');
    setUserInteracted();
    updateState({ isLoading: true });
    
    // Start loading the iframe after user gesture
    if (iframeRef.current && !state.playerReady) {
      try {
        // Reload iframe to ensure fresh start with user gesture
        iframeRef.current.src = embedUrl;
        startPlayerReadyTimeout();
      } catch (error) {
        console.error('Error reloading iframe:', error);
        setError();
      }
    }
  }, [setUserInteracted, updateState, state.playerReady, embedUrl, startPlayerReadyTimeout, setError]);

  const handleRetry = useCallback(() => {
    console.log('Retrying playback');
    clearTimeouts();
    updateState({ 
      hasError: false, 
      fallbackMode: 'none',
      isLoading: false,
      playerReady: false 
    });
  }, [clearTimeouts, updateState]);

  const togglePlay = useCallback(() => {
    clearTimeouts();
    
    // Handle fallback modes
    if (state.fallbackMode === 'direct-link') {
      handleDirectPlayback();
      return;
    }

    // Check if we should use fallback
    if (shouldUseFallback()) {
      handleDirectPlayback();
      return;
    }

    if (!state.playerReady) {
      console.log('Player not ready, waiting...');
      setPlaybackState(false, true);
      startPlayerReadyTimeout();
      return;
    }

    setPlaybackState(state.isPlaying, true);
    
    if (state.isPlaying) {
      console.log('Pausing video');
      if (!sendPlayerCommand('pauseVideo')) {
        setError();
      }
    } else {
      console.log('Playing video');
      
      if (sendPlayerCommand('playVideo')) {
        startPlaybackTimeout();
      } else {
        if (isMobile) {
          handleDirectPlayback();
        } else {
          setError();
        }
      }
    }
  }, [state, clearTimeouts, shouldUseFallback, handleDirectPlayback, setPlaybackState, startPlayerReadyTimeout, sendPlayerCommand, setError, startPlaybackTimeout, isMobile]);

  // Initialize iframe only after user interaction
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !state.hasUserInteracted) return;

    console.log('Setting up iframe for song:', song.id);

    const handleIframeLoad = () => {
      console.log('Iframe loaded, setting up player communication');
      
      // Give iframe time to initialize, then send listening command
      setTimeout(() => {
        try {
          iframe.contentWindow?.postMessage('{"event":"listening"}', '*');
        } catch (e) {
          console.warn('Error sending listening message:', e);
          setError();
        }
      }, 500);
    };

    iframe.addEventListener('load', handleIframeLoad);
    
    // If already loaded
    if (iframe.contentDocument?.readyState === 'complete') {
      handleIframeLoad();
    }

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      clearTimeouts();
    };
  }, [song.id, state.hasUserInteracted, clearTimeouts, setError]);

  // Handle YouTube API messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('YouTube message:', data);
        
        if (data.event === 'onReady') {
          console.log('Player ready confirmed');
          setPlayerReady(true);
          updateState({ isLoading: false, hasError: false });
          clearTimeouts();
        } else if (data.event === 'onStateChange') {
          const ytState = data.info;
          console.log('Player state change:', ytState);
          
          switch (ytState) {
            case 1: // Playing
              setPlaybackState(true, false);
              break;
            case 2: // Paused
              setPlaybackState(false, false);
              break;
            case 3: // Buffering
              if (!state.isPlaying) {
                updateState({ isLoading: true });
              }
              break;
            case 5: // Cued
              if (!state.playerReady) {
                setPlayerReady(true);
              }
              updateState({ isLoading: false });
              break;
            case 0: // Ended
              setPlaybackState(false, false);
              break;
            case -1: // Unstarted
              if (state.playerReady) {
                updateState({ isLoading: false });
              }
              break;
          }
        } else if (data.event === 'onError') {
          console.error('YouTube player error:', data.data);
          setError();
        }
      } catch (e) {
        console.warn('Error parsing YouTube message:', e);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [state.isPlaying, state.playerReady, clearTimeouts, setPlayerReady, setPlaybackState, updateState, setError]);

  // Reset state when song changes
  useEffect(() => {
    updateState({
      isPlaying: false,
      isLoading: false,
      hasError: false,
      playerReady: false,
      hasUserInteracted: false,
      needsUserGesture: true,
      fallbackMode: 'none'
    });
    clearTimeouts();
  }, [song.id, clearTimeouts, updateState]);

  // Render different states based on user interaction and loading
  if (!state.hasUserInteracted) {
    return (
      <InteractionGatekeeper
        song={song}
        onUserInteraction={handleUserInteraction}
        className={className}
      />
    );
  }

  if (state.isLoading && !state.playerReady) {
    const progress = state.hasUserInteracted ? 40 : 0;
    return (
      <ProgressiveMusicLoader
        stage="connecting"
        progress={progress}
        className={className}
      />
    );
  }

  if (state.fallbackMode !== 'none') {
    return (
      <FallbackMusicPlayer
        song={song}
        mode={state.fallbackMode}
        onDirectLink={handleDirectPlayback}
        onRetry={handleRetry}
        className={className}
      />
    );
  }

  return (
    <div className={`bg-gradient-card border rounded-lg overflow-hidden shadow-card ${className}`}>
      <div className="flex items-center gap-3 p-4">
        <div className="relative flex-shrink-0">
          <img
            src={song.thumbnailUrl}
            alt={song.title}
            className="w-16 h-12 object-cover rounded"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              disabled={state.isLoading}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-white/20 transition-all duration-200"
            >
              {state.isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : state.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate text-foreground">{song.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
          {state.isLoading && (
            <p className="text-xs text-primary animate-pulse">Loading audio...</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Music className="h-4 w-4" />
          <span className="font-medium">{song.duration}</span>
        </div>
      </div>
      
      {/* Hidden YouTube iframe for audio playback - only load after user interaction */}
      {state.hasUserInteracted && (
        <iframe
          ref={iframeRef}
          src=""
          className="hidden"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onError={() => setError()}
        />
      )}
    </div>
  );
}
