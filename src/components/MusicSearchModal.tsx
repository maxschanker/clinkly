
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Music, Play, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: string;
}

interface MusicSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSongSelect: (song: Song) => void;
}

export function MusicSearchModal({ open, onOpenChange, onSongSelect }: MusicSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const searchSongs = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      console.log('Searching for songs with query:', searchQuery);
      
      const { data, error } = await supabase.functions.invoke('search-youtube', {
        body: { query: searchQuery, maxResults: 12 }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Search results received:', data);
      setSearchResults(data.results || []);
      
      if (!data.results || data.results.length === 0) {
        toast({
          title: "No Results",
          description: "No songs found for your search. Try different keywords.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error searching songs:', error);
      
      // More specific error handling
      let errorMessage = "Failed to search for songs. Please try again.";
      if (error.message?.includes('YouTube API key')) {
        errorMessage = "YouTube API configuration issue. Please contact support.";
      } else if (error.message?.includes('quota')) {
        errorMessage = "Search limit reached. Please try again later.";
      }
      
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSongSelect = (song: Song) => {
    console.log('Song selected:', song);
    onSongSelect(song);
    onOpenChange(false);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchSongs();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Add Music
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a song..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={searchSongs} 
            disabled={!searchQuery.trim() || isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!hasSearched && (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Search for songs to add to your clink</p>
              <p className="text-sm mt-2">Try searching for artist names, song titles, or albums</p>
            </div>
          )}

          {isSearching && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-muted-foreground">Searching for songs...</p>
            </div>
          )}

          {hasSearched && !isSearching && searchResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No songs found for "{searchQuery}"</p>
              <p className="text-sm mt-2">Try different keywords or check your spelling</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            {searchResults.map((song) => (
              <button
                key={song.id}
                onClick={() => handleSongSelect(song)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors text-left"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={song.thumbnailUrl}
                    alt={song.title}
                    className="w-16 h-12 object-cover rounded"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{song.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {song.duration}
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
