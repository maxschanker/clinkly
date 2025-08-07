
import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Music, Volume2, ExternalLink } from "lucide-react";
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
  const [fallbackToDirectLink, setFallbackToDirectLink] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerReadyTimeoutRef = useRef<NodeJS.Timeout>();
  const playbackTimeoutRef = useRef<NodeJS.Timeout>();
  const isMobile = useIsMobile();

  // Eager iframe initialization - load immediately when song is selected
  const embedUrl = `https://www.youtube.com/embed/${song.id}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&controls=0&modestbranding=1&rel=0&showinfo=0&autoplay=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&widget_referrer=${encodeURIComponent(window.location.href)}`;

  // Direct YouTube link for mobile fallback
  const directYouTubeUrl = `https://www.youtube.com/watch?v=${song.id}`;

  const clearTimeouts = useCallback(() => {
    if (playerReadyTimeoutRef.current) {
      clearTimeout(playerReadyTimeoutRef.current);
      playerReadyTimeoutRef.current = undefined;
    }
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = undefined;
    }
  }, []);

  const sendPlayerCommand = useCallback((command: string) => {
    if (!iframeRef.current?.contentWindow || !playerReady) {
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
  }, [playerReady]);

  const handleDirectPlayback = useCallback(() => {
    // For mobile fallback - open YouTube directly in new tab
    console.log('Using direct YouTube link fallback');
    window.open(directYouTubeUrl, '_blank');
    setFallbackToDirectLink(true);
    setIsLoading(false);
  }, [directYouTubeUrl]);

  const togglePlay = useCallback(() => {
    clearTimeouts();
    
    // If already using fallback, just open the link again
    if (fallbackToDirectLink) {
      handleDirectPlayback();
      return;
    }

    // If player has error or not ready after timeout, use fallback on mobile
    if (hasError || (!playerReady && isMobile)) {
      handleDirectPlayback();
      return;
    }

    if (!playerReady) {
      console.log('Player not ready, waiting...');
      setIsLoading(true);
      
      // Wait for player to be ready, then try again
      playerReadyTimeoutRef.current = setTimeout(() => {
        if (!playerReady) {
          if (isMobile) {
            handleDirectPlayback();
          } else {
            setHasError(true);
            setIsLoading(false);
          }
        } else {
          togglePlay();
        }
      }, 2000);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    
    if (isPlaying) {
      console.log('Pausing video');
      if (sendPlayerCommand('pauseVideo')) {
        // Will be handled by onStateChange event
      } else {
        setIsLoading(false);
        setHasError(true);
      }
    } else {
      console.log('Playing video', { isMobile, playerReady });
      
      if (sendPlayerCommand('playVideo')) {
        // Set a timeout to detect if playback doesn't start
        playbackTimeoutRef.current = setTimeout(() => {
          if (isLoading && !isPlaying) {
            console.warn('Playback timeout - player unresponsive');
            if (isMobile) {
              handleDirectPlayback();
            } else {
              setHasError(true);
              setIsLoading(false);
            }
          }
        }, isMobile ? 3000 : 2000);
      } else {
        if (isMobile) {
          handleDirectPlayback();
        } else {
          setIsLoading(false);
          setHasError(true);
        }
      }
    }
  }, [isPlaying, playerReady, hasError, fallbackToDirectLink, sendPlayerCommand, handleDirectPlayback, isLoading, isMobile, clearTimeouts]);

  // Initialize iframe and listen for ready state
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    console.log('Initializing player for song:', song.id);
    setIsLoading(true);

    const handleIframeLoad = () => {
      console.log('Iframe loaded, setting up player communication');
      
      // Give iframe time to initialize, then send listening command
      setTimeout(() => {
        try {
          iframe.contentWindow?.postMessage('{"event":"listening"}', '*');
        } catch (e) {
          console.warn('Error sending listening message:', e);
        }
      }, 500);

      // Set player ready timeout
      playerReadyTimeoutRef.current = setTimeout(() => {
        if (!playerReady) {
          console.log('Player ready timeout - assuming ready');
          setPlayerReady(true);
          setIsLoading(false);
        }
      }, isMobile ? 3000 : 2000);
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
  }, [song.id, playerReady, isMobile, clearTimeouts]);

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
          setIsLoading(false);
          setHasError(false);
          clearTimeouts();
        } else if (data.event === 'onStateChange') {
          const state = data.info;
          console.log('Player state change:', state);
          
          switch (state) {
            case 1: // Playing
              setIsPlaying(true);
              setIsLoading(false);
              setHasError(false);
              clearTimeouts();
              break;
            case 2: // Paused
              setIsPlaying(false);
              setIsLoading(false);
              clearTimeouts();
              break;
            case 3: // Buffering
              if (!isPlaying) {
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
              clearTimeouts();
              break;
            case -1: // Unstarted
              if (playerReady) {
                setIsLoading(false);
              }
              break;
          }
        } else if (data.event === 'onError') {
          console.error('YouTube player error:', data.data);
          setHasError(true);
          setIsLoading(false);
          setIsPlaying(false);
          clearTimeouts();
        }
      } catch (e) {
        console.warn('Error parsing YouTube message:', e);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPlaying, playerReady, clearTimeouts]);

  // Reset state when song changes
  useEffect(() => {
    setIsPlaying(false);
    setIsLoading(false);
    setHasError(false);
    setPlayerReady(false);
    setFallbackToDirectLink(false);
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
              ) : fallbackToDirectLink ? (
                <ExternalLink className="h-4 w-4" />
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
          {fallbackToDirectLink && (
            <p className="text-xs text-muted-foreground">Opens in YouTube app</p>
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
