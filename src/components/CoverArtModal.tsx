import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Image, 
  FileImage, 
  Sparkles, 
  Loader2, 
  Upload, 
  AlertCircle,
  Settings,
  Key,
  Shuffle,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CoverArtModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string, type: 'photo' | 'gif' | 'poster' | 'upload') => void;
  currentSelection?: string;
}

interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description?: string;
  description?: string;
  user: {
    name: string;
  };
}

interface TenorGif {
  id: string;
  title: string;
  media_formats: {
    gif: { url: string };
    tinygif: { url: string };
    mediumgif: { url: string };
  };
  content_description: string;
}

// API Key Management
const getStoredApiKey = (service: 'unsplash' | 'tenor') => {
  return localStorage.getItem(`${service}_api_key`);
};

const setStoredApiKey = (service: 'unsplash' | 'tenor', key: string) => {
  localStorage.setItem(`${service}_api_key`, key);
};

// Default API keys (provided by user)
const DEFAULT_UNSPLASH_KEY = "oKBcWLxnF8NfnLawK_b0YBhuxTq1rysP3P34QxTu_uw";
const DEFAULT_TENOR_KEY = "AIzaSyCOczIXLn5_q-Px-QOczcLHXtoS0KDI9to";

// Enhanced curated poster collection with search capability
const POSTER_COLLECTION = [
  {
    id: "cosmic-celebration",
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop",
    title: "Cosmic Celebration",
    category: "Celebration",
    tags: ["party", "celebration", "cosmic", "night", "festive"]
  },
  {
    id: "retro-sunset",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    title: "Retro Sunset",
    category: "Vibes",
    tags: ["retro", "sunset", "aesthetic", "vibe", "chill"]
  },
  {
    id: "neon-gradient",
    url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop",
    title: "Neon Dreams",
    category: "Vibes",
    tags: ["neon", "gradient", "colorful", "modern", "electric"]
  },
  {
    id: "gift-celebration",
    url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop",
    title: "Gift Magic",
    category: "Celebration",
    tags: ["gift", "present", "celebration", "surprise", "magical"]
  },
  {
    id: "golden-hour",
    url: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&h=400&fit=crop",
    title: "Golden Hour",
    category: "Nature",
    tags: ["golden", "sunset", "warm", "nature", "beautiful"]
  },
  {
    id: "city-lights",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=400&fit=crop",
    title: "City Lights",
    category: "Urban",
    tags: ["city", "urban", "lights", "night", "modern"]
  },
  {
    id: "birthday-vibes",
    url: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&h=400&fit=crop",
    title: "Birthday Vibes",
    category: "Celebration",
    tags: ["birthday", "balloons", "celebration", "party", "colorful"]
  },
  {
    id: "ocean-waves",
    url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=400&fit=crop",
    title: "Ocean Waves",
    category: "Nature",
    tags: ["ocean", "waves", "peaceful", "nature", "blue"]
  },
  {
    id: "floral-bloom",
    url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=400&fit=crop",
    title: "Floral Bloom",
    category: "Nature",
    tags: ["flowers", "spring", "nature", "beautiful", "bloom"]
  },
  {
    id: "warm-lights",
    url: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=400&fit=crop",
    title: "Warm Lights",
    category: "Vibes",
    tags: ["warm", "lights", "cozy", "atmospheric", "magical"]
  }
];

export const CoverArtModal = ({ open, onOpenChange, onSelect, currentSelection }: CoverArtModalProps) => {
  const { toast } = useToast();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [posterSearchQuery, setPosterSearchQuery] = useState("");
  const [filteredPosters, setFilteredPosters] = useState(POSTER_COLLECTION);
  
  // API results
  const [unsplashPhotos, setUnsplashPhotos] = useState<UnsplashPhoto[]>([]);
  const [tenorGifs, setTenorGifs] = useState<TenorGif[]>([]);
  
  // Loading states
  const [isSearchingPhotos, setIsSearchingPhotos] = useState(false);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState("posters");
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [customUnsplashKey, setCustomUnsplashKey] = useState("");
  const [customTenorKey, setCustomTenorKey] = useState("");
  
  // Error states
  const [errors, setErrors] = useState<{
    unsplash?: string;
    tenor?: string;
  }>({});

  // Initialize API keys
  useEffect(() => {
    const unsplashKey = getStoredApiKey('unsplash');
    const tenorKey = getStoredApiKey('tenor');
    
    if (unsplashKey) setCustomUnsplashKey(unsplashKey);
    if (tenorKey) setCustomTenorKey(tenorKey);
  }, []);

  // Filter posters based on search
  useEffect(() => {
    if (!posterSearchQuery.trim()) {
      setFilteredPosters(POSTER_COLLECTION);
      return;
    }

    const filtered = POSTER_COLLECTION.filter(poster => 
      poster.title.toLowerCase().includes(posterSearchQuery.toLowerCase()) ||
      poster.category.toLowerCase().includes(posterSearchQuery.toLowerCase()) ||
      poster.tags.some(tag => tag.toLowerCase().includes(posterSearchQuery.toLowerCase()))
    );
    
    setFilteredPosters(filtered);
  }, [posterSearchQuery]);

  // Load trending GIFs on modal open
  useEffect(() => {
    if (open && activeTab === "gifs" && tenorGifs.length === 0) {
      searchGifs();
    }
  }, [open, activeTab]);

  // Search Unsplash photos
  const searchPhotos = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearchingPhotos(true);
    setErrors(prev => ({ ...prev, unsplash: undefined }));
    
    try {
      const apiKey = getStoredApiKey('unsplash') || DEFAULT_UNSPLASH_KEY;
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${apiKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setUnsplashPhotos(data.results);
      } else {
        setUnsplashPhotos([]);
        toast({
          title: "No photos found",
          description: `No results for "${query}". Try a different search term.`,
        });
      }
    } catch (error) {
      console.error('Error searching photos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to search photos';
      setErrors(prev => ({ ...prev, unsplash: errorMessage }));
      toast({
        title: "Search failed",
        description: "Unable to search photos. Check your API key or try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearchingPhotos(false);
    }
  }, [toast]);

  // Search Tenor GIFs
  const searchGifs = useCallback(async (query: string = "celebration") => {
    setIsLoadingGifs(true);
    setErrors(prev => ({ ...prev, tenor: undefined }));
    
    try {
      const apiKey = getStoredApiKey('tenor') || DEFAULT_TENOR_KEY;
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${apiKey}&limit=20&media_filter=gif&contentfilter=high`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setTenorGifs(data.results);
      } else {
        setTenorGifs([]);
        toast({
          title: "No GIFs found",
          description: `No results for "${query}". Try a different search term.`,
        });
      }
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch GIFs';
      setErrors(prev => ({ ...prev, tenor: errorMessage }));
      toast({
        title: "GIF search failed",
        description: "Unable to search GIFs. Check your API key or try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingGifs(false);
    }
  }, [toast]);

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "gifs" && tenorGifs.length === 0) {
      searchGifs();
    }
  };

  // Handle search
  const handleSearch = () => {
    if (activeTab === "photos") {
      searchPhotos(searchQuery);
    } else if (activeTab === "gifs") {
      searchGifs(searchQuery || "celebration");
    }
  };

  // Handle random search
  const handleRandomSearch = () => {
    const randomTerms = [
      "celebration", "party", "gift", "surprise", "joy", "happiness",
      "nature", "sunset", "ocean", "flowers", "mountains", "sky",
      "abstract", "colorful", "gradient", "neon", "art", "design"
    ];
    const randomTerm = randomTerms[Math.floor(Math.random() * randomTerms.length)];
    setSearchQuery(randomTerm);
    
    if (activeTab === "photos") {
      searchPhotos(randomTerm);
    } else if (activeTab === "gifs") {
      searchGifs(randomTerm);
    }
  };

  // Save API keys
  const saveApiKeys = () => {
    if (customUnsplashKey.trim()) {
      setStoredApiKey('unsplash', customUnsplashKey.trim());
    }
    if (customTenorKey.trim()) {
      setStoredApiKey('tenor', customTenorKey.trim());
    }
    setShowApiSettings(false);
    toast({
      title: "API keys saved",
      description: "Your API keys have been saved locally.",
    });
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onSelect(dataUrl, 'upload');
      toast({
        title: "Image uploaded",
        description: "Your custom image has been selected.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Choose Cover Art
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiSettings(!showApiSettings)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              API Settings
            </Button>
          </div>
          
          {showApiSettings && (
            <div className="mt-4 p-4 border border-border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Configuration
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Unsplash Access Key</label>
                  <Input
                    placeholder="Enter your Unsplash API key (optional)"
                    value={customUnsplashKey}
                    onChange={(e) => setCustomUnsplashKey(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tenor API Key</label>
                  <Input
                    placeholder="Enter your Tenor API key (optional)"
                    value={customTenorKey}
                    onChange={(e) => setCustomTenorKey(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button onClick={saveApiKeys} size="sm">
                  Save Keys
                </Button>
              </div>
            </div>
          )}
        </DialogHeader>
        
        <div className="flex flex-col h-[70vh]">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="posters" className="flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  Curated
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
              
              {/* Search Bar */}
              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder={
                      activeTab === "posters" ? "Search curated posters..." :
                      activeTab === "photos" ? "Search photos..." : 
                      "Search GIFs..."
                    }
                    value={activeTab === "posters" ? posterSearchQuery : searchQuery}
                    onChange={(e) => {
                      if (activeTab === "posters") {
                        setPosterSearchQuery(e.target.value);
                      } else {
                        setSearchQuery(e.target.value);
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                </div>
                
                {activeTab !== "posters" && (
                  <>
                    <Button 
                      onClick={handleSearch} 
                      disabled={isSearchingPhotos || isLoadingGifs}
                      size="default"
                    >
                      {(isSearchingPhotos || isLoadingGifs) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleRandomSearch}
                      size="default"
                      title="Random search"
                    >
                      <Shuffle className="w-4 h-4" />
                    </Button>
                  </>
                )}
                
                {/* Custom Upload */}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" size="default" asChild>
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </span>
                  </Button>
                </label>
              </div>
              
              {/* Error Display */}
              {(errors.unsplash || errors.tenor) && (
                <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {activeTab === "photos" ? errors.unsplash : errors.tenor}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 px-6 pb-6">
              {/* Curated Posters Tab */}
              <TabsContent value="posters" className="mt-4 h-full">
                <ScrollArea className="h-full">
                  {filteredPosters.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredPosters.map((poster) => (
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
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-2 left-2">
                              <p className="text-white font-medium text-sm">{poster.title}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {poster.category}
                                </Badge>
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <FileImage className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">No posters found</p>
                      <p className="text-muted-foreground">Try a different search term</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              {/* Photos Tab */}
              <TabsContent value="photos" className="mt-4 h-full">
                <ScrollArea className="h-full">
                  {unsplashPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {unsplashPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className={cn(
                            "group relative aspect-[2/1] rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                            currentSelection === photo.urls.regular
                              ? "border-primary shadow-glow"
                              : "border-transparent hover:border-border"
                          )}
                          onClick={() => onSelect(photo.urls.regular, 'photo')}
                        >
                          <img
                            src={photo.urls.small}
                            alt={photo.alt_description || photo.description || "Photo"}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-2 left-2">
                              <p className="text-white/90 text-xs">by {photo.user.name}</p>
                            </div>
                          </div>
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
              
              {/* GIFs Tab */}
              <TabsContent value="gifs" className="mt-4 h-full">
                <ScrollArea className="h-full">
                  {isLoadingGifs ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : tenorGifs.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {tenorGifs.map((gif) => (
                        <div
                          key={gif.id}
                          className={cn(
                            "group relative aspect-[2/1] rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                            currentSelection === gif.media_formats?.gif?.url
                              ? "border-primary shadow-glow"
                              : "border-transparent hover:border-border"
                          )}
                          onClick={() => onSelect(gif.media_formats?.gif?.url, 'gif')}
                        >
                          <img
                            src={gif.media_formats?.tinygif?.url || gif.media_formats?.mediumgif?.url}
                            alt={gif.content_description || gif.title}
                            loading="lazy"
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