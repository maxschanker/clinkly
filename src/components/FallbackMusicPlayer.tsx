import { ExternalLink, Search, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FallbackMusicPlayerProps {
  song: {
    id: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
    duration: string;
  };
  mode: 'direct-link' | 'search-suggestion';
  onDirectLink: () => void;
  onSearchSuggestion?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function FallbackMusicPlayer({ 
  song, 
  mode, 
  onDirectLink, 
  onSearchSuggestion,
  onRetry,
  className = "" 
}: FallbackMusicPlayerProps) {
  return (
    <div className={`bg-gradient-card border border-orange-200 rounded-lg overflow-hidden shadow-card ${className}`}>
      <div className="flex items-center gap-3 p-4">
        <div className="relative flex-shrink-0">
          <img
            src={song.thumbnailUrl}
            alt={song.title}
            className="w-16 h-12 object-cover rounded opacity-80"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-orange-500/20 rounded">
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate text-foreground">{song.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
          
          {mode === 'direct-link' ? (
            <p className="text-xs text-orange-600 mt-1">
              Opens in YouTube app for better mobile experience
            </p>
          ) : (
            <p className="text-xs text-orange-600 mt-1">
              Try searching for this song in your music app
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          {mode === 'direct-link' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onDirectLink}
              className="h-8 px-3 bg-gradient-primary text-primary-foreground border-0 hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open YouTube
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onSearchSuggestion}
              className="h-8 px-3 bg-gradient-secondary text-foreground border-0 hover:opacity-90 transition-opacity"
            >
              <Search className="h-3 w-3 mr-1" />
              Search
            </Button>
          )}
          
          {onRetry && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRetry}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}