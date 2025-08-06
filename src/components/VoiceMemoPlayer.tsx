import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Square } from "lucide-react";

interface VoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

const VoiceMemoPlayer = ({ voiceMemoUrl }: VoiceMemoPlayerProps) => {
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
    <Card className="mb-6 p-6 rounded-3xl bg-white/80 border-0 shadow-card">
      <div className="text-center">
        <div className="mb-4">
          <p className="text-lg font-medium text-foreground">
            🎤 Voice Message
          </p>
        </div>
        
        <div className="flex items-center justify-center">
          <Button
            onClick={togglePlayback}
            variant="default"
            size="lg"
            disabled={isLoading || hasError}
            className="w-20 h-16 rounded-xl bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg"
          >
            {isLoading ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : isPlaying ? (
              <Square className="w-5 h-5 text-primary-foreground fill-current" />
            ) : (
              <Play className="w-6 h-6 text-primary-foreground ml-1" />
            )}
          </Button>
          
          {hasError && (
            <div className="text-sm text-destructive mt-2">
              Error loading audio
            </div>
          )}
        </div>
        
        <audio
          ref={audioRef}
          preload="auto"
        >
          <source src={voiceMemoUrl} type="audio/webm" />
          <source src={voiceMemoUrl} type="audio/mp3" />
          <source src={voiceMemoUrl} type="audio/wav" />
        </audio>
      </div>
    </Card>
  );
};

export default VoiceMemoPlayer;