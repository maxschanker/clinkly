import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Image, 
  FileImage, 
  Sparkles, 
  Loader2, 
  Upload, 
  AlertCircle,
  Shuffle,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

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

// Default API keys
const DEFAULT_UNSPLASH_KEY = "oKBcWLxnF8NfnLawK_b0YBhuxTq1rysP3P34QxTu_uw";
const DEFAULT_TENOR_KEY = "AIzaSyCOczIXLn5_q-Px-QOczcLHXtoS0KDI9to";

// Enhanced curated poster collection with comprehensive search tags
const POSTER_COLLECTION = [
  {
    id: "cosmic-celebration",
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop",
    title: "Cosmic Celebration",
    category: "Celebration",
    tags: ["party", "celebration", "cosmic", "night", "festive", "birthday", "anniversary", "special", "event", "fun", "joy", "happy", "dance", "music", "fireworks", "sparkle", "magic", "wonder"]
  },
  {
    id: "retro-sunset",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    title: "Retro Sunset",
    category: "Vibes",
    tags: ["retro", "sunset", "aesthetic", "vibe", "chill", "nostalgia", "vintage", "peaceful", "calm", "relaxing", "warm", "orange", "pink", "dreamy", "soft", "romantic", "cozy", "atmosphere"]
  },
  {
    id: "neon-gradient",
    url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop",
    title: "Neon Dreams",
    category: "Vibes",
    tags: ["neon", "gradient", "colorful", "modern", "electric", "bright", "vibrant", "cyberpunk", "futuristic", "tech", "digital", "abstract", "bold", "striking", "contemporary", "cool", "trendy"]
  },
  {
    id: "gift-celebration",
    url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop",
    title: "Gift Magic",
    category: "Celebration",
    tags: ["gift", "present", "celebration", "surprise", "magical", "birthday", "holiday", "christmas", "giving", "love", "care", "thoughtful", "special", "wrapped", "ribbon", "bow", "generous"]
  },
  {
    id: "golden-hour",
    url: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&h=400&fit=crop",
    title: "Golden Hour",
    category: "Nature",
    tags: ["golden", "sunset", "warm", "nature", "beautiful", "serene", "peaceful", "calming", "light", "glow", "horizon", "sky", "outdoors", "landscape", "tranquil", "inspiring", "breathtaking"]
  },
  {
    id: "city-lights",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=400&fit=crop",
    title: "City Lights",
    category: "Urban",
    tags: ["city", "urban", "lights", "night", "modern", "metropolitan", "skyline", "buildings", "downtown", "vibrant", "energy", "bustling", "contemporary", "sophisticated", "elegant", "bright"]
  },
  {
    id: "birthday-vibes",
    url: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&h=400&fit=crop",
    title: "Birthday Vibes",
    category: "Celebration",
    tags: ["birthday", "balloons", "celebration", "party", "colorful", "fun", "happy", "festive", "cheerful", "joyful", "special day", "milestone", "anniversary", "wishes", "cake", "friends", "family"]
  },
  {
    id: "ocean-waves",
    url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=400&fit=crop",
    title: "Ocean Waves",
    category: "Nature",
    tags: ["ocean", "waves", "peaceful", "nature", "blue", "water", "sea", "calming", "relaxing", "meditation", "zen", "flowing", "rhythmic", "soothing", "natural", "pure", "fresh", "clean"]
  },
  {
    id: "floral-bloom",
    url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=400&fit=crop",
    title: "Floral Bloom",
    category: "Nature",
    tags: ["flowers", "spring", "nature", "beautiful", "bloom", "garden", "petals", "colorful", "fresh", "growth", "renewal", "life", "vibrant", "natural", "botanical", "delicate", "feminine", "romantic"]
  },
  {
    id: "warm-lights",
    url: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=400&fit=crop",
    title: "Warm Lights",
    category: "Vibes",
    tags: ["warm", "lights", "cozy", "atmospheric", "magical", "bokeh", "glow", "ambient", "mood", "intimate", "soft", "dreamy", "enchanting", "welcoming", "comfort", "home", "peaceful"]
  },
  {
    id: "abstract-art",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=400&fit=crop",
    title: "Abstract Flow",
    category: "Art",
    tags: ["abstract", "art", "creative", "modern", "artistic", "design", "pattern", "flowing", "dynamic", "colorful", "contemporary", "bold", "expressive", "unique", "vibrant", "stylish"]
  },
  {
    id: "mountain-vista",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    title: "Mountain Vista",
    category: "Nature",
    tags: ["mountains", "landscape", "nature", "majestic", "adventure", "hiking", "outdoors", "scenic", "panoramic", "inspiring", "freedom", "achievement", "journey", "exploration", "wilderness"]
  }
];

export const CoverArtModal = ({ open, onOpenChange, onSelect, currentSelection }: CoverArtModalProps) => {
  const { toast } = useToast();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [posterSearchQuery, setPosterSearchQuery] = useState("");
  const [filteredPosters, setFilteredPosters] = useState(POSTER_COLLECTION);
  
  // API results and pagination
  const [unsplashPhotos, setUnsplashPhotos] = useState<UnsplashPhoto[]>([]);
  const [tenorGifs, setTenorGifs] = useState<TenorGif[]>([]);
  const [unsplashPage, setUnsplashPage] = useState(1);
  const [tenorPos, setTenorPos] = useState("");
  const [posterPage, setPosterPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  
  // Loading states
  const [isSearchingPhotos, setIsSearchingPhotos] = useState(false);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const [isLoadingMorePhotos, setIsLoadingMorePhotos] = useState(false);
  const [isLoadingMoreGifs, setIsLoadingMoreGifs] = useState(false);
  const [isLoadingMorePosters, setIsLoadingMorePosters] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState("posters");
  
  // Error states
  const [errors, setErrors] = useState<{
    unsplash?: string;
    tenor?: string;
  }>({});
  
  // Pagination states
  const [hasMorePhotos, setHasMorePhotos] = useState(true);
  const [hasMoreGifs, setHasMoreGifs] = useState(true);
  const [hasMorePosters, setHasMorePosters] = useState(true);

  // Check if we have more posters to show
  useEffect(() => {
    const totalVisible = posterPage * ITEMS_PER_PAGE;
    setHasMorePosters(totalVisible < filteredPosters.length);
  }, [posterPage, filteredPosters]);

  // Filter posters based on search and reset pagination
  useEffect(() => {
    if (!posterSearchQuery.trim()) {
      setFilteredPosters(POSTER_COLLECTION);
    } else {
      const filtered = POSTER_COLLECTION.filter(poster => 
        poster.title.toLowerCase().includes(posterSearchQuery.toLowerCase()) ||
        poster.category.toLowerCase().includes(posterSearchQuery.toLowerCase()) ||
        poster.tags.some(tag => tag.toLowerCase().includes(posterSearchQuery.toLowerCase()))
      );
      setFilteredPosters(filtered);
    }
    setPosterPage(1); // Reset to first page when search changes
  }, [posterSearchQuery]);

  // Load default content when modal opens or tab changes
  useEffect(() => {
    if (open) {
      if (activeTab === "gifs" && tenorGifs.length === 0) {
        searchGifs();
      } else if (activeTab === "photos" && unsplashPhotos.length === 0) {
        // Load default photos with popular search terms
        searchPhotos("celebration", 1, false);
      }
    }
  }, [open, activeTab]);

  // Search Unsplash photos with pagination
  const searchPhotos = useCallback(async (query: string, page: number = 1, append: boolean = false) => {
    if (!query.trim()) return;
    
    if (!append) {
      setIsSearchingPhotos(true);
      setUnsplashPhotos([]);
      setUnsplashPage(1);
    } else {
      setIsLoadingMorePhotos(true);
    }
    setErrors(prev => ({ ...prev, unsplash: undefined }));
    
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${ITEMS_PER_PAGE}&page=${page}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${DEFAULT_UNSPLASH_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        if (append) {
          setUnsplashPhotos(prev => [...prev, ...data.results]);
        } else {
          setUnsplashPhotos(data.results);
        }
        setHasMorePhotos(data.results.length === ITEMS_PER_PAGE && page < 10); // Limit to 10 pages
      } else {
        if (!append) {
          setUnsplashPhotos([]);
          toast({
            title: "No photos found",
            description: `No results for "${query}". Try a different search term.`,
          });
        }
        setHasMorePhotos(false);
      }
    } catch (error) {
      console.error('Error searching photos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to search photos';
      setErrors(prev => ({ ...prev, unsplash: errorMessage }));
      if (!append) {
        toast({
          title: "Search failed",
          description: "Unable to search photos. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSearchingPhotos(false);
      setIsLoadingMorePhotos(false);
    }
  }, [toast]);

  // Search Tenor GIFs with pagination
  const searchGifs = useCallback(async (query: string = "celebration", pos: string = "", append: boolean = false) => {
    if (!append) {
      setIsLoadingGifs(true);
      setTenorGifs([]);
      setTenorPos("");
    } else {
      setIsLoadingMoreGifs(true);
    }
    setErrors(prev => ({ ...prev, tenor: undefined }));
    
    try {
      let url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${DEFAULT_TENOR_KEY}&limit=${ITEMS_PER_PAGE}&media_filter=gif&contentfilter=high`;
      if (pos) {
        url += `&pos=${pos}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        if (append) {
          setTenorGifs(prev => [...prev, ...data.results]);
        } else {
          setTenorGifs(data.results);
        }
        setTenorPos(data.next || "");
        setHasMoreGifs(!!data.next && data.results.length === ITEMS_PER_PAGE);
      } else {
        if (!append) {
          setTenorGifs([]);
          toast({
            title: "No GIFs found",
            description: `No results for "${query}". Try a different search term.`,
          });
        }
        setHasMoreGifs(false);
      }
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch GIFs';
      setErrors(prev => ({ ...prev, tenor: errorMessage }));
      if (!append) {
        toast({
          title: "GIF search failed",
          description: "Unable to search GIFs. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingGifs(false);
      setIsLoadingMoreGifs(false);
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
      searchPhotos(searchQuery, 1, false);
      setUnsplashPage(1);
    } else if (activeTab === "gifs") {
      searchGifs(searchQuery || "celebration", "", false);
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
      searchPhotos(randomTerm, 1, false);
      setUnsplashPage(1);
    } else if (activeTab === "gifs") {
      searchGifs(randomTerm, "", false);
    }
  };

  // Load more functions for infinite scroll
  const loadMorePhotos = useCallback(() => {
    if (hasMorePhotos && !isLoadingMorePhotos) {
      const nextPage = unsplashPage + 1;
      setUnsplashPage(nextPage);
      searchPhotos(searchQuery || "celebration", nextPage, true);
    }
  }, [hasMorePhotos, isLoadingMorePhotos, unsplashPage, searchQuery, searchPhotos]);

  const loadMoreGifs = useCallback(() => {
    if (hasMoreGifs && !isLoadingMoreGifs) {
      searchGifs(searchQuery || "celebration", tenorPos, true);
    }
  }, [hasMoreGifs, isLoadingMoreGifs, searchQuery, tenorPos, searchGifs]);

  const loadMorePosters = useCallback(() => {
    if (hasMorePosters && !isLoadingMorePosters) {
      setIsLoadingMorePosters(true);
      setTimeout(() => {
        setPosterPage(prev => prev + 1);
        setIsLoadingMorePosters(false);
      }, 300);
    }
  }, [hasMorePosters, isLoadingMorePosters]);

  // Infinite scroll hooks
  const photosSentinelRef = useInfiniteScroll({
    hasMore: hasMorePhotos,
    loading: isLoadingMorePhotos,
    onLoadMore: loadMorePhotos
  });

  const gifsSentinelRef = useInfiniteScroll({
    hasMore: hasMoreGifs,
    loading: isLoadingMoreGifs,
    onLoadMore: loadMoreGifs
  });

  const postersSentinelRef = useInfiniteScroll({
    hasMore: hasMorePosters,
    loading: isLoadingMorePosters,
    onLoadMore: loadMorePosters
  });

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
      <DialogContent className="max-w-5xl w-full max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-0 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Choose Cover Art
            </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
            <div className="px-6 flex-shrink-0">
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
            
            <div className="flex-1 min-h-0 px-6 pb-6">
              {/* Curated Posters Tab */}
              <TabsContent value="posters" className="mt-4 h-full">
                <ScrollArea className="h-full">
                  <div className="pr-4">
                    {filteredPosters.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {filteredPosters.slice(0, posterPage * ITEMS_PER_PAGE).map((poster) => (
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
                        
                        {/* Infinite scroll sentinel */}
                        {hasMorePosters && (
                          <div ref={postersSentinelRef} className="flex justify-center py-4">
                            {isLoadingMorePosters && (
                              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <FileImage className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No posters found</p>
                        <p className="text-muted-foreground">Try a different search term</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              {/* Photos Tab */}
              <TabsContent value="photos" className="mt-4 h-full">
                <ScrollArea className="h-full">
                  <div className="pr-4">
                    {isSearchingPhotos ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} className="aspect-[2/1] rounded-lg" />
                        ))}
                      </div>
                    ) : unsplashPhotos.length > 0 ? (
                      <div className="space-y-4">
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
                        
                        {/* Infinite scroll sentinel */}
                        {hasMorePhotos && (
                          <div ref={photosSentinelRef} className="flex justify-center py-4">
                            {isLoadingMorePhotos && (
                              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Image className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">Beautiful photos loaded!</p>
                        <p className="text-muted-foreground">Search above to find specific themes</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              {/* GIFs Tab */}
              <TabsContent value="gifs" className="mt-4 h-full">
                <ScrollArea className="h-full">
                  <div className="pr-4">
                    {isLoadingGifs ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} className="aspect-[2/1] rounded-lg" />
                        ))}
                      </div>
                    ) : tenorGifs.length > 0 ? (
                      <div className="space-y-4">
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
                                src={gif.media_formats?.gif?.url || gif.media_formats?.mediumgif?.url || gif.media_formats?.tinygif?.url}
                                alt={gif.content_description || gif.title}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-2 left-2">
                                  <p className="text-white/90 text-xs truncate max-w-32">{gif.title}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Infinite scroll sentinel */}
                        {hasMoreGifs && (
                          <div ref={gifsSentinelRef} className="flex justify-center py-4">
                            {isLoadingMoreGifs && (
                              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">Search for GIFs</p>
                        <p className="text-muted-foreground">Try searching for "celebration", "cute", or "funny"</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};