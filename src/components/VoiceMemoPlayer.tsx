import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause } from "lucide-react";

interface VoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

const VoiceMemoPlayer = ({ voiceMemoUrl }: VoiceMemoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setHasError(true);
      setIsPlaying(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    
    const audioDuration = audioRef.current.duration;
    // Handle invalid or infinite duration
    if (isFinite(audioDuration) && audioDuration > 0) {
      setDuration(audioDuration);
    } else {
      // Fallback for WebM files with missing duration metadata
      setDuration(0);
    }
    setIsLoading(false);
    setHasError(false);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAudioError = (e: any) => {
    console.error("Audio error:", e);
    setIsPlaying(false);
    setHasError(true);
    setIsLoading(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
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
        
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={togglePlayback}
            variant="outline"
            size="lg"
            disabled={isLoading || hasError}
            className="w-16 h-16 rounded-full border-2 border-primary/30 bg-white hover:bg-primary/10 hover:scale-105 transition-all duration-200"
          >
            {isLoading ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 text-primary" />
            ) : (
              <Play className="w-6 h-6 text-primary ml-1" />
            )}
          </Button>
          
          <div className="flex-1 max-w-xs">
            <div className="text-sm text-muted-foreground mb-1">
              {hasError 
                ? "Error loading audio" 
                : isLoading 
                ? "Loading..." 
                : `${formatTime(currentTime)}${duration > 0 ? ` / ${formatTime(duration)}` : ''}`
              }
            </div>
            <div className="w-full h-2 bg-muted rounded-full">
              <div 
                className="h-2 bg-primary rounded-full transition-all duration-300" 
                style={{ 
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : isPlaying ? '100%' : '0%' 
                }} 
              />
            </div>
          </div>
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