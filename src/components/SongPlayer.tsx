
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Music, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const embedUrl = `https://www.youtube.com/embed/${song.id}?enablejsapi=1&origin=${window.location.origin}&controls=0&modestbranding=1&rel=0&showinfo=0&autoplay=0`;

  const togglePlay = () => {
    if (!iframeRef.current || hasError) return;

    setIsLoading(true);
    setHasError(false);
    
    try {
      if (isPlaying) {
        // Pause the video
        iframeRef.current.contentWindow?.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          '*'
        );
        setIsPlaying(false);
        setIsLoading(false);
      } else {
        // Play the video
        iframeRef.current.contentWindow?.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          '*'
        );
        setIsPlaying(true);
        // Loading state will be cleared when video starts playing or after timeout
        setTimeout(() => {
          setIsLoading(false);
          // If still not playing after timeout, assume error
          if (!isPlaying) {
            setHasError(true);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
      setIsLoading(false);
      setHasError(true);
    }
  };

  // Listen for iframe messages to sync play state
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'video-progress') {
          // Video is playing
          setIsPlaying(true);
          setIsLoading(false);
          setHasError(false);
        } else if (data.event === 'onStateChange') {
          // Handle different player states
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
            case 3: // Buffering
              setIsLoading(true);
              break;
            case 5: // Cued
              setIsLoading(false);
              break;
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPlaying]);

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
