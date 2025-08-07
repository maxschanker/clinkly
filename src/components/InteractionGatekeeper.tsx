import { Play, Music, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InteractionGatekeeperProps {
  song: {
    title: string;
    artist: string;
    thumbnailUrl: string;
    duration: string;
  };
  onUserInteraction: () => void;
  className?: string;
}

export function InteractionGatekeeper({ song, onUserInteraction, className = "" }: InteractionGatekeeperProps) {
  return (
    <div className={`bg-gradient-card border rounded-lg overflow-hidden shadow-card ${className}`}>
      <div className="flex items-center gap-4 p-4">
        <div className="relative flex-shrink-0">
          <img
            src={song.thumbnailUrl}
            alt={song.title}
            className="w-20 h-15 object-cover rounded-lg"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm">
            <Button
              size="lg"
              onClick={onUserInteraction}
              className="h-12 w-12 p-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-button rounded-full transition-all duration-300 hover:scale-110"
            >
              <Play className="h-5 w-5 ml-0.5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary animate-sparkle" />
            <h4 className="font-semibold text-foreground truncate">{song.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground truncate mb-2">{song.artist}</p>
          
          <div className="bg-gradient-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-2 shadow-soft">
            <Music className="h-3 w-3" />
            Tap to Play Music
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="text-sm font-medium text-foreground">{song.duration}</div>
          <div className="text-xs text-muted-foreground">High Quality</div>
        </div>
      </div>
    </div>
  );
}