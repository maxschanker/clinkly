import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";

interface MiniVoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

const MiniVoiceMemoPlayer = ({ voiceMemoUrl }: MiniVoiceMemoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    
    const audioDuration = audioRef.current.duration;
    if (isFinite(audioDuration) && audioDuration > 0) {
      setDuration(audioDuration);
    } else {
      setDuration(0);
    }
    setIsLoading(false);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setHasError(false);
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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = clickX / rect.width;
    const newTime = progress * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // Minimal floating bubble view
  if (!isExpanded) {
    return (
      <div 
        className="inline-flex items-center gap-2 p-2 rounded-full bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/15 transition-all duration-200"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-primary" />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
        <span className="text-xs font-medium text-primary">Voice message</span>
        
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
  }

  // Expanded player view
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Voice Message</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Minimize
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <Button
          onClick={togglePlayback}
          variant="default"
          size="sm"
          className="w-10 h-10 rounded-full shadow-button hover:shadow-glow hover:scale-105 transition-all duration-200"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </Button>
        
        <div className="flex-1 space-y-1">
          <div 
            className="h-1.5 bg-muted rounded-full cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-primary rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
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
  );
};

export default MiniVoiceMemoPlayer;