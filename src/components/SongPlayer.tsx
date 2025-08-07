
import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Music, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const isMobile = useIsMobile();

  // Mobile-friendly embed URL with better compatibility
  const embedUrl = `https://www.youtube.com/embed/${song.id}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&controls=0&modestbranding=1&rel=0&showinfo=0&autoplay=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&widget_referrer=${encodeURIComponent(window.location.href)}`;

  const sendPlayerCommand = useCallback((command: string, args: string = "") => {
    if (!iframeRef.current) {
      console.warn('Iframe not available for command:', command);
      return false;
    }

    try {
      const message = JSON.stringify({
        event: "command",
        func: command,
        args: args
      });
      
      console.log('Sending player command:', command, { playerReady });
      iframeRef.current.contentWindow?.postMessage(message, '*');
      return true;
    } catch (error) {
      console.error('Error sending player command:', error);
      return false;
    }
  }, [playerReady]);

  const retryPlayback = useCallback(() => {
    if (retryCount >= 3) {
      console.error('Max retry attempts reached');
      setHasError(true);
      setIsLoading(false);
      return;
    }

    console.log(`Retrying playback, attempt ${retryCount + 1}`);
    setRetryCount(prev => prev + 1);
    setHasError(false);
    
    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Try to send play command again
    retryTimeoutRef.current = setTimeout(() => {
      if (sendPlayerCommand('playVideo')) {
        setIsLoading(true);
      } else {
        setHasError(true);
        setIsLoading(false);
      }
    }, 1000);
  }, [retryCount, sendPlayerCommand]);

  const clearTimeouts = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = undefined;
    }
  }, []);

  const togglePlay = useCallback(() => {
    // Clear any existing timeouts
    clearTimeouts();
    
    // Mark user interaction for mobile autoplay policy compliance
    if (!userInteracted) {
      setUserInteracted(true);
    }

    // Handle retry case
    if (hasError && retryCount < 3) {
      retryPlayback();
      return;
    }

    // Reset error state
    setHasError(false);
    
    if (isPlaying) {
      console.log('Pausing video');
      sendPlayerCommand('pauseVideo');
      // Let the YouTube API event handle state changes
    } else {
      console.log('Playing video', { isMobile, userInteracted, playerReady });
      
      // Start loading state
      setIsLoading(true);
      
      // Send play command regardless of playerReady state
      // YouTube will queue the command if player isn't ready yet
      sendPlayerCommand('playVideo');
      
      // Set a timeout to handle cases where YouTube doesn't respond
      loadingTimeoutRef.current = setTimeout(() => {
        if (!isPlaying) {
          console.warn('Play command timeout, attempting retry');
          if (retryCount < 3) {
            retryPlayback();
          } else {
            setIsLoading(false);
            setHasError(true);
          }
        }
      }, isMobile ? 6000 : 4000);
    }
  }, [isPlaying, hasError, retryCount, retryPlayback, isMobile, userInteracted, sendPlayerCommand, clearTimeouts]);

  // Handle iframe load and player ready detection
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      console.log('Iframe loaded, initiating player setup', { isMobile });
      
      // Send listening command to enable state change events
      setTimeout(() => {
        try {
          iframe.contentWindow?.postMessage('{"event":"listening"}', '*');
        } catch (e) {
          console.warn('Error sending listening message:', e);
        }
      }, 500);

      // Set a fallback timeout for player readiness
      // Don't show loading during this initial setup
      setTimeout(() => {
        if (!playerReady) {
          console.log('Setting player ready via fallback timeout');
          setPlayerReady(true);
        }
      }, isMobile ? 3000 : 2000);
    };

    iframe.addEventListener('load', handleIframeLoad);
    
    // If iframe is already loaded
    if (iframe.contentDocument?.readyState === 'complete') {
      handleIframeLoad();
    }

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      clearTimeouts();
    };
  }, [playerReady, isMobile, clearTimeouts]);

  // Listen for iframe messages to sync play state
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('Received player message:', data);
        
        if (data.event === 'onReady') {
          console.log('YouTube player ready');
          setPlayerReady(true);
          setIsLoading(false);
          setHasError(false);
          setRetryCount(0);
          clearTimeouts();
        } else if (data.event === 'onStateChange') {
          const state = data.info;
          console.log('Player state change:', state);
          
          // Clear loading timeouts on any state change
          clearTimeouts();
          
          // Handle different player states
          switch (state) {
            case 1: // Playing
              setIsPlaying(true);
              setIsLoading(false);
              setHasError(false);
              setRetryCount(0);
              if (!playerReady) setPlayerReady(true);
              break;
            case 2: // Paused
              setIsPlaying(false);
              setIsLoading(false);
              break;
            case -1: // Unstarted
              setIsPlaying(false);
              if (playerReady) {
                setIsLoading(false);
              }
              break;
            case 3: // Buffering
              // Only show loading if we're transitioning to play
              if (!isPlaying) {
                setIsLoading(true);
              }
              break;
            case 5: // Cued
              setIsLoading(false);
              setIsPlaying(false);
              if (!playerReady) {
                setPlayerReady(true);
              }
              break;
            case 0: // Ended
              setIsPlaying(false);
              setIsLoading(false);
              break;
          }
        } else if (data.event === 'onError') {
          console.error('YouTube player error:', data.data);
          // Handle specific YouTube error codes
          const errorCode = data.data;
          let shouldRetry = false;
          
          switch (errorCode) {
            case 2: // Invalid parameter
            case 5: // HTML5 player error
            case 100: // Video not found
            case 101: // Video not available
            case 150: // Video not available (restricted)
              console.error('YouTube error code:', errorCode, 'Not retryable');
              break;
            default:
              // For other errors, attempt retry on mobile
              if (isMobile && retryCount < 2) {
                shouldRetry = true;
                console.log('Mobile error, will retry:', errorCode);
              }
              break;
          }
          
          if (shouldRetry) {
            setTimeout(() => retryPlayback(), 1000);
          } else {
            setHasError(true);
            setIsLoading(false);
            setIsPlaying(false);
          }
        }
      } catch (e) {
        console.warn('Error parsing YouTube message:', e);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPlaying, playerReady, isMobile, retryCount, retryPlayback, clearTimeouts]);

  // Reset state when song changes
  useEffect(() => {
    setIsPlaying(false);
    setIsLoading(false);
    setHasError(false);
    setPlayerReady(false);
    setRetryCount(0);
    setUserInteracted(false);
    clearTimeouts();
  }, [song.id, clearTimeouts]);

  return (
    <div className={`bg-card border rounded-lg overflow-hidden ${className}`}>
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
              disabled={isLoading}
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : hasError ? (
                <Volume2 className="h-4 w-4 opacity-50" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{song.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
          {hasError && (
            <p className="text-xs text-muted-foreground">Playback unavailable</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Music className="h-4 w-4" />
          <span>{song.duration}</span>
        </div>
      </div>
      
      {/* Hidden YouTube iframe for audio playback */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="hidden"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={() => setHasError(true)}
      />
    </div>
  );
}
