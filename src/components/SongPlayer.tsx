
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
  const [isCued, setIsCued] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const preloadTimeoutRef = useRef<NodeJS.Timeout>();
  const readyTimeoutRef = useRef<NodeJS.Timeout>();
  const isMobile = useIsMobile();

  // Optimized embed URL with mobile-first preloading
  const embedUrl = `https://www.youtube.com/embed/${song.id}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&controls=0&modestbranding=1&rel=0&showinfo=0&autoplay=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&mute=1&widget_referrer=${encodeURIComponent(window.location.href)}`;

  const sendPlayerCommand = useCallback((command: string, args: string = "") => {
    if (!iframeRef.current) {
      console.warn('No iframe reference for command:', command);
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
  }, []);

  // Mobile-first preloading strategy
  const preloadVideo = useCallback(() => {
    if (!playerReady) return;
    
    console.log('Preloading video for mobile optimization');
    
    // Cue the video first, then start muted playback for preloading
    sendPlayerCommand('cueVideoById', song.id);
    
    // On mobile, start muted playback to preload
    if (isMobile) {
      preloadTimeoutRef.current = setTimeout(() => {
        sendPlayerCommand('playVideo');
        // Immediately mute for preloading
        setTimeout(() => {
          sendPlayerCommand('mute');
        }, 100);
      }, 500);
    }
  }, [playerReady, isMobile, song.id, sendPlayerCommand]);

  const startPlayback = useCallback(() => {
    if (!playerReady && !isCued) {
      console.warn('Cannot start playback - player not ready');
      return false;
    }

    console.log('Starting playback', { isMobile, userInteracted, isCued });
    
    // Unmute and play
    sendPlayerCommand('unMute');
    
    // Small delay to ensure unmute is processed
    setTimeout(() => {
      sendPlayerCommand('playVideo');
    }, 50);
    
    return true;
  }, [playerReady, isCued, isMobile, userInteracted, sendPlayerCommand]);

  const togglePlay = useCallback(() => {
    // Mark user interaction for mobile autoplay policy compliance
    if (!userInteracted) {
      setUserInteracted(true);
    }

    if (hasError) {
      setHasError(false);
      setIsLoading(true);
      // Retry by reloading the video
      sendPlayerCommand('cueVideoById', song.id);
      return;
    }

    if (isPlaying) {
      console.log('Pausing video');
      sendPlayerCommand('pauseVideo');
      return;
    }

    console.log('Starting playback', { isMobile, userInteracted, playerReady, isCued });
    setIsLoading(true);
    setHasError(false);
    
    // Start playback using optimized approach
    if (!startPlayback()) {
      setIsLoading(false);
      setHasError(true);
    }
  }, [isPlaying, hasError, userInteracted, startPlayback, sendPlayerCommand, song.id, isMobile, playerReady, isCued]);

  // Enhanced iframe load and player initialization
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      console.log('Iframe loaded, initializing player...', { isMobile });
      setIsLoading(true);
      
      // Send listening command to enable state change events
      setTimeout(() => {
        try {
          iframe.contentWindow?.postMessage('{"event":"listening"}', '*');
        } catch (e) {
          console.warn('Error sending listening message:', e);
        }
      }, 300);

      // Optimized ready detection with shorter timeout
      readyTimeoutRef.current = setTimeout(() => {
        if (!playerReady) {
          console.log('Player ready timeout, assuming ready', { isMobile });
          setPlayerReady(true);
          setIsLoading(false);
        }
      }, isMobile ? 2000 : 1500);
    };

    iframe.addEventListener('load', handleIframeLoad);
    
    // If iframe is already loaded
    if (iframe.contentDocument?.readyState === 'complete') {
      handleIframeLoad();
    }

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
      }
    };
  }, [playerReady, isMobile]);

  // Trigger preloading when player is ready
  useEffect(() => {
    if (playerReady && !isCued) {
      preloadVideo();
    }
  }, [playerReady, isCued, preloadVideo]);

  // Listen for iframe messages to sync play state
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('Received player message:', data);
        
        if (data.event === 'onReady') {
          console.log('Player ready confirmed');
          setPlayerReady(true);
          setIsLoading(false);
          setHasError(false);
          // Clear ready timeout since we got confirmation
          if (readyTimeoutRef.current) {
            clearTimeout(readyTimeoutRef.current);
          }
        } else if (data.event === 'onStateChange') {
          console.log('Player state change:', data.info);
          // Enhanced state management
          switch (data.info) {
            case 1: // Playing
              setIsPlaying(true);
              setIsLoading(false);
              setHasError(false);
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
              // Only show loading if user initiated playback
              if (userInteracted) {
                setIsLoading(true);
              }
              break;
            case 5: // Cued
              console.log('Video cued successfully');
              setIsCued(true);
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
          const errorCode = data.data;
          
          // Handle errors more gracefully
          switch (errorCode) {
            case 2: // Invalid parameter
            case 100: // Video not found
            case 101: // Video not available  
            case 150: // Video not available (restricted)
              console.error('YouTube error code:', errorCode, 'Video unavailable');
              setHasError(true);
              setIsLoading(false);
              setIsPlaying(false);
              break;
            case 5: // HTML5 player error
            default:
              // For other errors, try to recover by re-cueing
              console.log('Attempting recovery from error:', errorCode);
              setTimeout(() => {
                sendPlayerCommand('cueVideoById', song.id);
              }, 1000);
              break;
          }
        }
      } catch (e) {
        console.warn('Error parsing YouTube message:', e);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [userInteracted, playerReady, sendPlayerCommand, song.id]);

  // Reset state when song changes
  useEffect(() => {
    setIsPlaying(false);
    setIsLoading(false);
    setHasError(false);
    setPlayerReady(false);
    setIsCued(false);
    setUserInteracted(false);
    
    // Clear all timeouts
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
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
