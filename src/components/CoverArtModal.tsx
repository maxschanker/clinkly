import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Image, FileImage, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverArtModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string, type: 'photo' | 'gif' | 'poster') => void;
  currentSelection?: string;
}

// Curated poster collection
const POSTER_COLLECTION = [
  {
    id: "retro-sunset",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    title: "Retro Sunset",
    category: "Vibes"
  },
  {
    id: "neon-gradient",
    url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop",
    title: "Neon Dreams",
    category: "Vibes"
  },
  {
    id: "cosmic-waves",
    url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=400&fit=crop",
    title: "Cosmic Waves",
    category: "Abstract"
  },
  {
    id: "golden-hour",
    url: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&h=400&fit=crop",
    title: "Golden Hour",
    category: "Nature"
  },
  {
    id: "city-lights",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=400&fit=crop",
    title: "City Lights",
    category: "Urban"
  },
  {
    id: "ocean-waves",
    url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=400&fit=crop",
    title: "Ocean Waves",
    category: "Nature"
  },
  {
    id: "floral-bloom",
    url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=400&fit=crop",
    title: "Floral Bloom",
    category: "Nature"
  },
  {
    id: "warm-lights",
    url: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=400&fit=crop",
    title: "Warm Lights",
    category: "Vibes"
  }
];

export const CoverArtModal = ({ open, onOpenChange, onSelect, currentSelection }: CoverArtModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [gifs, setGifs] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const [activeTab, setActiveTab] = useState("posters");

  // Search Unsplash photos
  const searchPhotos = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Using Unsplash Source API for simplicity
      const searchTerms = query.split(' ');
      const results = searchTerms.map((term, index) => ({
        id: `search-${index}`,
        url: `https://source.unsplash.com/800x400/?${encodeURIComponent(query)}&${Date.now()}&${index}`,
        alt: `${query} ${index + 1}`,
        description: `${query} photo ${index + 1}`
      }));
      
      // Generate multiple variations
      const additionalResults = Array.from({ length: 8 }, (_, i) => ({
        id: `search-${searchTerms.length + i}`,
        url: `https://source.unsplash.com/800x400/?${encodeURIComponent(query)}&v=${i + 1}`,
        alt: `${query} ${i + 1}`,
        description: `${query} variation ${i + 1}`
      }));
      
      setSearchResults([...results, ...additionalResults]);
    } catch (error) {
      console.error('Error searching photos:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Search Tenor GIFs
  const searchGifs = async (query: string = "celebration") => {
    setIsLoadingGifs(true);
    try {
      const apiKey = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCl0"; // Public Tenor key
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${apiKey}&limit=20&media_filter=gif`
      );
      const data = await response.json();
      
      setGifs(data.results || []);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      // Fallback to sample GIFs
      setGifs([]);
    } finally {
      setIsLoadingGifs(false);
    }
  };

  // Load default GIFs when tab is opened
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "gifs" && gifs.length === 0) {
      searchGifs();
    }
  };

  const handleSearch = () => {
    if (activeTab === "photos") {
      searchPhotos(searchQuery);
    } else if (activeTab === "gifs") {
      searchGifs(searchQuery || "celebration");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Choose Cover Art
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-[70vh]">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="posters" className="flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  Posters
                </TabsTrigger>
                <TabsTrigger value="photos" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Photos
                </TabsTrigger>
                <TabsTrigger value="gifs" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  GIFs
                </TabsTrigger>
              </TabsList>
              
              {/* Search Bar for Photos and GIFs */}
              {(activeTab === "photos" || activeTab === "gifs") && (
                <div className="flex gap-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder={activeTab === "photos" ? "Search photos..." : "Search GIFs..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isSearching || isLoadingGifs}>
                    {(isSearching || isLoadingGifs) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex-1 px-6 pb-6">
              <TabsContent value="posters" className="mt-4 h-full">
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {POSTER_COLLECTION.map((poster) => (
                      <div
                        key={poster.id}
                        className={cn(
                          "group relative aspect-[2/1] rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                          currentSelection === poster.url
                            ? "border-primary shadow-glow"
                            : "border-transparent hover:border-border"
                        )}
                        onClick={() => onSelect(poster.url, 'poster')}
                      >
                        <img
                          src={poster.url}
                          alt={poster.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2">
                            <p className="text-white font-medium text-sm">{poster.title}</p>
                            <p className="text-white/80 text-xs">{poster.category}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="photos" className="mt-4 h-full">
                <ScrollArea className="h-full">
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {searchResults.map((photo) => (
                        <div
                          key={photo.id}
                          className={cn(
                            "group relative aspect-[2/1] rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                            currentSelection === photo.url
                              ? "border-primary shadow-glow"
                              : "border-transparent hover:border-border"
                          )}
                          onClick={() => onSelect(photo.url, 'photo')}
                        >
                          <img
                            src={photo.url}
                            alt={photo.alt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Image className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">Search for photos</p>
                      <p className="text-muted-foreground">Try searching for themes like "nature", "city", or "abstract"</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="gifs" className="mt-4 h-full">
                <ScrollArea className="h-full">
                  {isLoadingGifs ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : gifs.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {gifs.map((gif) => (
                        <div
                          key={gif.id}
                          className={cn(
                            "group relative aspect-[2/1] rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                            currentSelection === gif.media_formats?.gif?.url
                              ? "border-primary shadow-glow"
                              : "border-transparent hover:border-border"
                          )}
                          onClick={() => onSelect(gif.media_formats?.gif?.url || gif.url, 'gif')}
                        >
                          <img
                            src={gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url}
                            alt={gif.content_description}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">Search for GIFs</p>
                      <p className="text-muted-foreground">Try searching for "celebration", "cute", or "funny"</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};