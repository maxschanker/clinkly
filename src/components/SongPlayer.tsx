
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
  const isMobile = useIsMobile();

  // Mobile-friendly embed URL with better compatibility
  const embedUrl = `https://www.youtube.com/embed/${song.id}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&controls=0&modestbranding=1&rel=0&showinfo=0&autoplay=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&widget_referrer=${encodeURIComponent(window.location.href)}`;

  const sendPlayerCommand = useCallback((command: string, args: string = "") => {
    if (!iframeRef.current || !playerReady) {
      console.warn('Player not ready for command:', command);
      return false;
    }

    try {
      const message = JSON.stringify({
        event: "command",
        func: command,
        args: args
      });
      
      console.log('Sending player command:', message);
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

  const togglePlay = useCallback(() => {
    // Mark user interaction for mobile autoplay policy compliance
    if (!userInteracted) {
      setUserInteracted(true);
    }

    if (hasError && retryCount < 3) {
      retryPlayback();
      return;
    }

    // If player not ready, set it ready on user interaction (especially on mobile)
    if (!playerReady) {
      console.log('Player not ready, setting ready state on user interaction');
      setPlayerReady(true);
      setIsLoading(false);
    }

    setIsLoading(true);
    setHasError(false);
    
    if (isPlaying) {
      console.log('Pausing video');
      if (sendPlayerCommand('pauseVideo')) {
        // Don't set isPlaying to false immediately, wait for confirmation
        setTimeout(() => {
          if (isLoading) {
            setIsLoading(false);
          }
        }, 1000);
      } else {
        setIsLoading(false);
        setHasError(true);
      }
    } else {
      console.log('Playing video', { isMobile, userInteracted, playerReady });
      
      // On mobile, ensure we have user interaction before attempting playback
      if (isMobile && !userInteracted) {
        console.log('Mobile requires user interaction for playback');
        setUserInteracted(true);
      }

      if (sendPlayerCommand('playVideo')) {
        // Set loading timeout with longer wait on mobile
        const timeout = isMobile ? 5000 : 3000;
        setTimeout(() => {
          if (isLoading && !isPlaying) {
            console.warn('Playback timeout, trying retry');
            retryPlayback();
          }
        }, timeout);
      } else {
        setIsLoading(false);
        setHasError(true);
      }
    }
  }, [isPlaying, playerReady, hasError, retryCount, sendPlayerCommand, retryPlayback, isLoading, isMobile, userInteracted]);

  // Handle iframe load and player ready detection
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      console.log('Iframe loaded, waiting for player ready...', { isMobile });
      setIsLoading(true);
      
      // Send listening command to enable state change events
      setTimeout(() => {
        try {
          iframe.contentWindow?.postMessage('{"event":"listening"}', '*');
        } catch (e) {
          console.warn('Error sending listening message:', e);
        }
      }, isMobile ? 2000 : 1000);

      // Set a timeout to mark player as ready if we don't get confirmation
      // Longer timeout on mobile due to potential slower loading
      const readyTimeout = isMobile ? 5000 : 3000;
      setTimeout(() => {
        if (!playerReady) {
          console.log('Player ready timeout, assuming ready', { isMobile });
          setPlayerReady(true);
          setIsLoading(false);
        }
      }, readyTimeout);
    };

    iframe.addEventListener('load', handleIframeLoad);
    
    // If iframe is already loaded
    if (iframe.contentDocument?.readyState === 'complete') {
      handleIframeLoad();
    }

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [playerReady, isMobile]);

  // Listen for iframe messages to sync play state
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('Received player message:', data);
        
        if (data.event === 'onReady') {
          console.log('Player ready');
          setPlayerReady(true);
          setIsLoading(false);
          setHasError(false);
          setRetryCount(0);
        } else if (data.event === 'onStateChange') {
          console.log('Player state change:', data.info);
          // Handle different player states
          switch (data.info) {
            case 1: // Playing
              setIsPlaying(true);
              setIsLoading(false);
              setHasError(false);
              setRetryCount(0);
              break;
            case 2: // Paused
              setIsPlaying(false);
              setIsLoading(false);
              break;
            case -1: // Unstarted
              if (playerReady) {
                setIsLoading(false);
              }
              break;
            case 3: // Buffering
              if (isPlaying || !playerReady) {
                setIsLoading(true);
              }
              break;
            case 5: // Cued
              setIsLoading(false);
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
  }, [isPlaying, playerReady, isMobile, retryCount, retryPlayback]);

  // Reset state when song changes
  useEffect(() => {
    setIsPlaying(false);
    setIsLoading(false);
    setHasError(false);
    setPlayerReady(false);
    setRetryCount(0);
    setUserInteracted(false);
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, [song.id]);

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
