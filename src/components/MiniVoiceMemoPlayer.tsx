import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, Play } from "lucide-react";

interface MiniVoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

const MiniVoiceMemoPlayer = ({ voiceMemoUrl }: MiniVoiceMemoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playAudio = async () => {
    if (!audioRef.current || isPlaying) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio playback error:", error);
      setHasError(true);
    }
  };

  const stopAudio = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
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
    <Card className="w-64 p-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={playAudio}
          variant="ghost"
          size="icon"
          disabled={isLoading || hasError || isPlaying}
          className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20"
        >
          {isLoading ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Play className="w-4 h-4 text-primary ml-0.5" />
          )}
        </Button>
        
        <Button
          onClick={stopAudio}
          variant="ghost"
          size="icon"
          disabled={isLoading || hasError || !isPlaying}
          className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20"
        >
          <div className="w-3 h-3 bg-primary rounded-sm" />
        </Button>
        
        <Volume2 className="w-5 h-5 text-muted-foreground" />
        
        {hasError && (
          <div className="text-xs text-destructive">
            Error
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
    </Card>
  );
};

export default MiniVoiceMemoPlayer;