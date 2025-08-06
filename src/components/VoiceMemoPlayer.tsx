import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause } from "lucide-react";

interface VoiceMemoPlayerProps {
  voiceMemoUrl: string;
}

const VoiceMemoPlayer = ({ voiceMemoUrl }: VoiceMemoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setIsPlaying(false);
  };

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
            className="w-16 h-16 rounded-full border-2 border-primary/30 bg-white hover:bg-primary/10 hover:scale-105 transition-all duration-200"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-primary" />
            ) : (
              <Play className="w-6 h-6 text-primary ml-1" />
            )}
          </Button>
          
          <div className="flex-1 max-w-xs">
            <div className="text-sm text-muted-foreground mb-1">
              Tap to {isPlaying ? "pause" : "play"}
            </div>
            <div className="w-full h-2 bg-muted rounded-full">
              <div className={`h-2 bg-primary rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`} 
                   style={{ width: isPlaying ? '100%' : '0%' }} />
            </div>
          </div>
        </div>
        
        <audio
          ref={audioRef}
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          preload="metadata"
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