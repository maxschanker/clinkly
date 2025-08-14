import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit } from "lucide-react";
import { CoverArtModal } from "@/components/CoverArtModal";
import { CompactVoiceMemoRecorder } from "@/components/CompactVoiceMemoRecorder";
import { BackgroundColorPicker } from "@/components/BackgroundColorPicker";
import { createTreat, uploadVoiceMemo, uploadCoverArt, type TreatData } from "@/lib/treatService";
import { useToast } from "@/hooks/use-toast";
import { saveTreatData, cleanupStaleData, loadTreatData } from "@/lib/utils";
import { smartScrollToTop, trackUserScrolling } from "@/lib/scrollUtils";

const Send = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingCoverArt, setIsUploadingCoverArt] = useState(false);
  const amountFieldRef = useRef<HTMLDivElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);
  const recipientInputRef = useRef<HTMLInputElement>(null);
  const senderInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const isAutoScrollingRef = useRef(false);
  
  const [formData, setFormData] = useState({
    headerText: "",
    headerFont: "inter",
    coverArt: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=400&fit=crop", // Default ocean wave
    coverArtType: "poster" as 'photo' | 'gif' | 'poster' | 'upload',
    message: "",
    senderName: "",
    recipientName: "",
    amount: "",
    backgroundColor: "background"
  });
  const [addCash, setAddCash] = useState(false);
  const [showCoverArtModal, setShowCoverArtModal] = useState(false);
  const [voiceMemoBlob, setVoiceMemoBlob] = useState<Blob | null>(null);
  const [existingVoiceMemoUrl, setExistingVoiceMemoUrl] = useState<string | null>(null);
  const isLoadingEditDataRef = useRef(false);

  // Clean up stale data on component mount and load edit data if available
  useEffect(() => {
    cleanupStaleData();
    
    // Check for edit data from confirmation page
    const editData = loadTreatData('editData');
    if (editData) {
      isLoadingEditDataRef.current = true;
      
      setFormData({
        headerText: editData.headerText || '',
        headerFont: editData.headerFont || 'inter',
        coverArt: editData.coverArt || 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=400&fit=crop',
        coverArtType: editData.coverArtType || 'poster',
        message: editData.message || '',
        senderName: editData.senderName || '',
        recipientName: editData.recipientName || '',
        amount: editData.amount || '',
        backgroundColor: editData.backgroundColor || 'background'
      });
      
      if (editData.addCash) {
        setAddCash(true);
      }
      
      // Load voice memo URL if present
      if (editData.voiceMemoUrl) {
        setExistingVoiceMemoUrl(editData.voiceMemoUrl);
      }
      
      // Clear the edit data immediately after loading (fixed key)
      localStorage.removeItem('editData');
      
      // Reset loading flag after state updates
      setTimeout(() => {
        isLoadingEditDataRef.current = false;
      }, 100);
    }

    // Cleanup function to clear edit data when navigating away
    return () => {
      localStorage.removeItem('editData');
    };
  }, []);

  // Auto-scroll and focus on amount field when cash toggle is enabled
  useEffect(() => {
    if (addCash && amountFieldRef.current && !isLoadingEditDataRef.current) {
      // Set flag to disable scroll detection during auto-scroll
      isAutoScrollingRef.current = true;
      
      setTimeout(() => {
        // Scroll to center the amount field for better visibility
        amountFieldRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        // Focus the amount input after a brief delay for better UX
        setTimeout(() => {
          if (amountInputRef.current) {
            amountInputRef.current.focus();
            // Set focus timestamp to protect from scroll dismissal
            const focusEvent = new FocusEvent('focus', { bubbles: true });
            Object.defineProperty(focusEvent, 'target', { value: amountInputRef.current });
            document.dispatchEvent(focusEvent);
          }
          // Clear the flag after smooth scroll animation completes (1200ms total protection)
          setTimeout(() => {
            isAutoScrollingRef.current = false;
          }, 1200);
        }, 300);
      }, 200);
    }
  }, [addCash]);

  // Smart scroll detection with focus protection to prevent keyboard auto-close
  useEffect(() => {
    const focusTimestamps = new Map<HTMLElement, number>();
    let scrollTimeout: NodeJS.Timeout | null = null;
    let previousScrollY = window.scrollY;

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        focusTimestamps.set(target, Date.now());
      }
    };

    const handleScroll = () => {
      // Don't process scroll events during auto-scroll
      if (isAutoScrollingRef.current) {
        return;
      }
      
      const currentScrollY = window.scrollY;
      const scrollDistance = Math.abs(currentScrollY - previousScrollY);
      
      // Clear any existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Only blur on moderate scroll (>15px) with brief focus protection
      if (scrollDistance > 15) {
        const now = Date.now();
        const refs = [
          headerInputRef.current,
          messageTextareaRef.current,
          recipientInputRef.current,
          senderInputRef.current,
          amountInputRef.current
        ];

        refs.forEach(ref => {
          if (ref && document.activeElement === ref) {
            const focusTime = focusTimestamps.get(ref) || 0;
            // Only blur if focused for more than 400ms (protects against keyboard opening)
            if (now - focusTime > 400) {
              ref.blur();
            }
          }
        });
      }
      
      previousScrollY = currentScrollY;
    };

    document.addEventListener('focusin', handleFocus);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('focusin', handleFocus);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  const fontOptions = [
    { id: "inter", name: "Classic", class: "font-sans" },
    { id: "playfair", name: "Electric", class: "font-playfair" },
    { id: "dancing", name: "Fancy", class: "font-dancing" },
    { id: "arial", name: "Simple", class: "font-arial" }
  ];


  const handleSave = async () => {
    // Check for required header text
    if (!formData.headerText || !formData.headerText.trim()) {
      toast({
        title: "Header Required",
        description: "Please add a header to personalize your clink.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.senderName || !formData.recipientName) {
      toast({
        title: "Missing Information",
        description: "Please fill in both sender and recipient names.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Upload voice memo if present
      let voiceMemoUrl = null;
      if (voiceMemoBlob) {
        try {
          const { file_url } = await uploadVoiceMemo(voiceMemoBlob);
          voiceMemoUrl = file_url;
        } catch (error) {
          toast({
            title: "Voice memo upload failed",
            description: "Your clink will be saved without the voice memo.",
            variant: "destructive"
          });
        }
      }

      console.log('🔍 SEND DEBUG - formData.backgroundColor:', formData.backgroundColor);
      
      const treatData: TreatData = {
        header_text: formData.headerText.trim(),
        font_id: `font-${formData.headerFont}`,
        cover_art_type: formData.coverArtType === 'poster' ? 'image' : formData.coverArtType,
        cover_art_content: formData.coverArt,
        message: formData.message,
        sender_name: formData.senderName,
        recipient_name: formData.recipientName,
        amount: addCash && formData.amount ? parseFloat(formData.amount) : undefined,
        theme: 'gradient-warm',
        treat_type: 'coffee',
        is_public: true,
        voice_memo_url: voiceMemoUrl,
        background_color: formData.backgroundColor
      };
      
      console.log('🔍 SEND DEBUG - treatData object:', treatData);
      console.log('🔍 SEND DEBUG - treatData.background_color:', treatData.background_color);

      const result = await createTreat(treatData);
      
      // Save the result for the confirmation page using enhanced storage
      saveTreatData('treatData', {
        ...result.treat,
        shareUrl: result.shareUrl
      });
      
      smartScrollToTop();
      navigate('/send/complete');
    } catch (error) {
      console.error('Error creating treat:', error);
      toast({
        title: "Error",
        description: "Failed to create clink. Please try again.",
        variant: "destructive"
        });
      } finally {
        setIsUploadingCoverArt(false);
      }
  };

  const handleCoverArtSelect = async (url: string | File, type: 'photo' | 'gif' | 'poster' | 'upload') => {
    if (type === 'upload' && url instanceof File) {
      // Handle file upload
      try {
        setIsUploadingCoverArt(true);
        const uploadResult = await uploadCoverArt(url);
        setFormData({...formData, coverArt: uploadResult.file_url, coverArtType: 'upload'});
        // Close modal after successful upload
        setShowCoverArtModal(false);
      } catch (error: any) {
        console.error('Upload failed:', error);
        
        // Show specific error message
        const errorMessage = error.message || "Failed to upload your image. Please try again.";
        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      } finally {
        setIsUploadingCoverArt(false);
      }
    } else {
      setFormData({...formData, coverArt: url as string, coverArtType: type});
    }
    setShowCoverArtModal(false);
  };

  const selectedFont = fontOptions.find(f => f.id === formData.headerFont);

  const getThemeBackground = (backgroundColorFromData?: string) => {
    const colorId = backgroundColorFromData || "background";
    switch (colorId) {
      case "background": return "bg-gradient-background";
      case "hero": return "bg-gradient-hero";
      case "sunset": return "bg-gradient-sunset";
      case "soft-peach": return "bg-soft-peach";
      case "warm-cream": return "bg-warm-cream";
      case "golden-mist": return "bg-golden-mist";
      case "coral-blush": return "bg-coral-blush";
      case "sunset-glow": return "bg-sunset-glow";
      default: return "bg-gradient-background";
    }
  };


  return (
    <div className={`min-h-[100dvh] ${getThemeBackground(formData.backgroundColor)} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-16 w-3 h-3 bg-sparkle-1 rounded-full animate-pulse-glow"></div>
        <div className="absolute bottom-32 left-20 w-2 h-2 bg-sparkle-2 rounded-full animate-sparkle animation-delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-sparkle-3 rounded-full animate-float animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              localStorage.removeItem('editData');
              smartScrollToTop();
              navigate('/');
            }}
            className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:scale-105 transition-all duration-300 font-space"
          >
            clink
          </button>
          <div className="text-sm text-muted-foreground font-medium">
            Create your vibe ✨
          </div>
        </div>
      </header>

      {/* Scrapbook Layout */}
      <div className="relative z-10 px-4 pb-32">
        <div className="max-w-lg mx-auto space-y-6">
          
          {/* Hero Cover Art Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-primary rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-1 border border-white/20">
              <div className="relative rounded-3xl overflow-hidden">
                {formData.coverArtType === 'gif' ? (
                  <img
                    src={formData.coverArt}
                    alt="Cover art GIF"
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <img
                    src={formData.coverArt}
                    alt="Cover art"
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Header Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Input
                    ref={headerInputRef}
                    value={formData.headerText}
                    onChange={(e) => {
                      if (e.target.value.length <= 25) {
                        setFormData({...formData, headerText: e.target.value});
                      }
                    }}
                    placeholder="Add your headline..."
                    className={`bg-transparent border-none text-white text-center placeholder:text-white/70 focus-visible:ring-0 ${selectedFont?.class} ${
                      formData.headerText.length > 20 ? "text-2xl" : 
                      formData.headerText.length > 12 ? "text-3xl" : "text-4xl"
                    } font-bold shadow-[0_0_20px_rgba(0,0,0,0.8)]`}
                    maxLength={25}
                  />
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setShowCoverArtModal(true)}
                  disabled={isUploadingCoverArt}
                  className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-2 rounded-full flex items-center gap-2 transition-all font-medium disabled:opacity-50"
                >
                  <Edit size={16} />
                  {isUploadingCoverArt ? 'Uploading...' : 'Edit'}
                </button>
              </div>
            </div>
          </div>

          {/* Font Style Selector */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-sm font-medium text-muted-foreground mb-3">Text Style</div>
            <div className="flex gap-2 flex-wrap">
              {fontOptions.map((font) => (
                <button
                  key={font.id}
                  onClick={() => setFormData({...formData, headerFont: font.id})}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.headerFont === font.id
                      ? 'bg-gradient-primary text-white shadow-warm'
                      : 'bg-white/20 hover:bg-white/30 text-foreground'
                  }`}
                >
                  <span className={font.class}>{font.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">💭</div>
              <div className="text-lg font-bold text-foreground">Your message</div>
            </div>
            <Textarea
              ref={messageTextareaRef}
              value={formData.message}
              onChange={(e) => {
                if (e.target.value.length <= 300) {
                  setFormData({...formData, message: e.target.value});
                }
              }}
              placeholder="Hope you have the best day ever! Can't wait to see you ✨"
              className="w-full min-h-[100px] text-base bg-white/20 border border-white/30 rounded-xl p-4 placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              maxLength={300}
            />
            <div className={`text-xs mt-2 text-right ${
              formData.message.length >= 280 ? 'text-destructive' : 
              formData.message.length >= 250 ? 'text-yellow-600' : 
              'text-muted-foreground'
            }`}>
              {formData.message.length}/300
            </div>
          </div>

          {/* Interactive Elements Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Voice Memo */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-center mb-3">
                <div className="text-2xl mb-1 animate-pulse-glow">🎵</div>
                <div className="text-sm font-medium text-foreground">Voice note</div>
              </div>
              <CompactVoiceMemoRecorder 
                onVoiceMemoChange={setVoiceMemoBlob}
                existingUrl={existingVoiceMemoUrl}
              />
            </div>

            {/* Background Picker */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-center mb-3">
                <div className="text-2xl mb-1">🎨</div>
                <div className="text-sm font-medium text-foreground">Background</div>
              </div>
              <BackgroundColorPicker
                selectedColor={formData.backgroundColor}
                onColorChange={(color) => setFormData({...formData, backgroundColor: color})}
              />
            </div>
          </div>

          {/* Recipient Details Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">💌</div>
              <div className="text-lg font-bold text-foreground">Send to</div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">🎁 To</Label>
                <Input
                  ref={recipientInputRef}
                  value={formData.recipientName}
                  onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                  placeholder="Their name"
                  className="w-full h-12 text-base bg-white/20 border border-white/30 rounded-xl px-4 placeholder:text-muted-foreground/70 focus:border-primary"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">✨ From</Label>
                <Input
                  ref={senderInputRef}
                  value={formData.senderName}
                  onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                  placeholder="Your name"
                  className="w-full h-12 text-base bg-white/20 border border-white/30 rounded-xl px-4 placeholder:text-muted-foreground/70 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Cash Option Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="text-2xl animate-heart-beat">💝</div>
                <div className="text-lg font-bold text-foreground">Add some love</div>
              </div>
              <Switch
                checked={addCash}
                onCheckedChange={setAddCash}
              />
            </div>
            
            {addCash && (
              <div ref={amountFieldRef} className="space-y-3">
                <div className="text-sm text-muted-foreground">Perfect for coffee, lunch, or just because ✨</div>
                
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[5, 10, 20].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setFormData({...formData, amount: amount.toString()})}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                        formData.amount === amount.toString()
                          ? 'bg-gradient-primary text-white'
                          : 'bg-white/20 hover:bg-white/30 text-foreground'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground font-medium">$</div>
                  <Input
                    ref={amountInputRef}
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0"
                    className="w-full h-12 text-base bg-white/20 border border-white/30 rounded-xl pl-8 pr-4 placeholder:text-muted-foreground/70 focus:border-primary"
                    min="1"
                    max="500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-4 right-4 z-50">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full h-16 text-lg font-bold rounded-2xl bg-gradient-primary text-white hover:shadow-warm transition-all duration-500 transform hover:scale-105 shadow-warm disabled:opacity-50 border-2 border-white/20"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating your clink...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                Send this clink ✨
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Cover Art Modal */}
      <CoverArtModal
        open={showCoverArtModal}
        onOpenChange={setShowCoverArtModal}
        onSelect={handleCoverArtSelect}
        currentSelection={formData.coverArt}
        isUploadingCoverArt={isUploadingCoverArt}
      />
    </div>
  );
};

export default Send;