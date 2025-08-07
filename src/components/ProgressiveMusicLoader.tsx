import { Loader2, Music, Wifi } from "lucide-react";

interface ProgressiveMusicLoaderProps {
  stage: 'connecting' | 'loading' | 'buffering' | 'ready';
  progress?: number;
  className?: string;
}

export function ProgressiveMusicLoader({ stage, progress = 0, className = "" }: ProgressiveMusicLoaderProps) {
  const getStageInfo = () => {
    switch (stage) {
      case 'connecting':
        return {
          icon: <Wifi className="h-4 w-4" />,
          text: "Connecting to music player...",
          subtext: "Establishing secure connection"
        };
      case 'loading':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: "Loading audio track...",
          subtext: "Preparing high-quality playback"
        };
      case 'buffering':
        return {
          icon: <Music className="h-4 w-4 animate-bounce-gentle" />,
          text: "Buffering music...",
          subtext: "Almost ready to play"
        };
      case 'ready':
        return {
          icon: <Music className="h-4 w-4" />,
          text: "Ready to play!",
          subtext: "Music loaded successfully"
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <div className={`bg-gradient-card border rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-full">
          {stageInfo.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground">
            {stageInfo.text}
          </div>
          <div className="text-xs text-muted-foreground">
            {stageInfo.subtext}
          </div>
          
          {/* Progress bar */}
          <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}