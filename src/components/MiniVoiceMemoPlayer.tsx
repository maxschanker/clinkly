import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Play, Square } from "lucide-react";

interface MiniVoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

const MiniVoiceMemoPlayer = ({ voiceMemoUrl }: MiniVoiceMemoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Audio playback error:", error);
        setHasError(true);
      }
    }
  };

  const handleLoadedMetadata = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = (e: any) => {
    console.error("Audio error:", e);
    setIsPlaying(false);
    setHasError(true);
    setIsLoading(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [voiceMemoUrl]);

  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2">
      <Button
        onClick={togglePlayback}
        variant="default"
        size="icon"
        disabled={isLoading || hasError}
        className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
      >
        {isLoading ? (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : isPlaying ? (
          <Square className="w-3 h-3 text-primary-foreground fill-current" />
        ) : (
          <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
        )}
      </Button>
      
      {hasError && (
        <div className="text-xs text-destructive">
          Error
        </div>
      )}
      
      <audio
        ref={audioRef}
        preload="auto"
      >
        <source src={voiceMemoUrl} type="audio/webm" />
        <source src={voiceMemoUrl} type="audio/mp3" />
        <source src={voiceMemoUrl} type="audio/wav" />
      </audio>
    </div>
  );
};

export default MiniVoiceMemoPlayer;