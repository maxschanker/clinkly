import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getTreat, recordShare, type TreatResponse } from "@/lib/treatService";
import { retrieveTreatData } from "@/lib/utils";

const Treat = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [treatData, setTreatData] = useState<TreatResponse | any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTreat = async () => {
      if (!slug) return;
      
      console.log('Treat page loading, slug:', slug);
      setIsLoading(true);
      
      try {
        // 1. First check if this is preview mode (localStorage data)
        const previewData = localStorage.getItem('currentTreat');
        if (previewData) {
          try {
            const parsed = JSON.parse(previewData);
            if (parsed.slug === slug) {
              console.log('✅ Using localStorage data (preview mode)');
              setTreatData(parsed);
              setIsPreviewMode(true);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing localStorage data:', error);
          }
        }

        // 2. Try to fetch from backend using the new service
        console.log('Fetching treat from backend...');
        const result = await getTreat(slug);
        
        if (result.success && result.treat) {
          console.log('✅ Successfully fetched treat from backend');
          
          // Map backend response to expected format
          const mappedData = {
            id: result.treat.id,
            slug: result.treat.slug,
            headerText: result.treat.header_text,
            headerFont: result.treat.font_id.replace('font-', ''),
            senderName: result.treat.sender_name,
            recipientName: result.treat.recipient_name,
            venmoHandle: result.treat.venmo_handle,
            amount: result.treat.amount,
            treatType: result.treat.treat_type,
            message: result.treat.message,
            coverArt: result.treat.cover_art_content,
            coverArtType: result.treat.cover_art_type,
            theme: result.treat.theme,
            createdAt: result.treat.created_at,
            isPublic: result.treat.is_public
          };
          
          setTreatData(mappedData);
          setIsPreviewMode(false);
        } else {
          throw new Error('Treat not found');
        }
      } catch (error) {
        console.error('Error loading treat:', error);
        
        // 3. Fallback to URL params (backwards compatibility)
        const urlParams = new URLSearchParams(location.search);
        const retrievedData = retrieveTreatData(urlParams);
        
        if (retrievedData && retrievedData.senderName) {
          console.log('✅ Successfully retrieved data from URL/storage (fallback)');
          setTreatData({
            ...retrievedData,
            slug: slug
          });
          setIsPreviewMode(false);
        } else {
          // 4. Show error state
          console.warn('❌ No valid treat data found');
          setTreatData({
            headerText: "Oops! Something went wrong",
            headerFont: "font-sans",
            senderName: "cheerly System",
            recipientHandle: "@you",
            treatType: "5",
            message: "We couldn't load this treat. The link might be expired or invalid. Ask the sender to send it again!",
            coverArt: "",
            coverArtType: "gradient",
            theme: "primary",
            slug: slug,
            createdAt: new Date().toISOString(),
            isError: true
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTreat();
  }, [slug, location.search]);

  const getTreatEmoji = (type: string) => {
    switch (type) {
      case "5": return "☕️";
      case "10": return "🥗";
      default: return "💝";
    }
  };

  const getTreatDescription = (type: string) => {
    switch (type) {
      case "5": return "coffee";
      case "10": return "lunch";
      default: return "treat";
    }
  };

  const getFontClass = (fontId: string) => {
    switch (fontId) {
      case "playfair": return "font-playfair";
      case "dancing": return "font-dancing";
      case "arial": return "font-arial";
      default: return "font-sans";
    }
  };

  const copyVenmoHandle = async () => {
    if (!treatData) return;
    try {
      await navigator.clipboard.writeText(treatData.senderName.replace(/[^a-zA-Z0-9]/g, ''));
      toast({
        title: "Copied! 📋",
        description: "Venmo handle copied to clipboard"
      });
    } catch (err) {
      toast({
        title: "Oops!",
        description: "Couldn't copy handle"
      });
    }
  };

  const shareThis = async () => {
    const url = window.location.href;
    const text = `Someone sent me a treat! Check it out ✨`;
    
    // Record sharing analytics
    if (treatData?.id) {
      try {
        await recordShare(treatData.id, navigator.share ? 'native_share' : 'clipboard');
      } catch (error) {
        console.error('Failed to record share:', error);
      }
    }
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'cheerly Treat',
          text: text,
          url: url
        });
        toast({
          title: "Shared! 📤",
          description: "Thanks for sharing the love!"
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied! 🔗",
          description: "Share this link with friends"
        });
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied! 🔗",
        description: "Share this link with friends"
      });
    }
  };

  if (isLoading || !treatData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-background">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">✨</div>
          <p className="text-muted-foreground">Loading your treat...</p>
        </div>
      </div>
    );
  }

  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case "secondary": return "bg-gradient-secondary";
      case "card": return "bg-gradient-card";
      default: return "bg-gradient-primary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="w-full p-4 pb-2 md:p-6 md:pb-2 relative z-10">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                navigate('/');
              }}
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
            >
              cheerly
            </button>
            
            {isPreviewMode && (
              <Button
                variant="ghost"
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate('/send/complete');
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Exit Preview
              </Button>
            )}
          </div>
        </header>

        {/* 1. "[From] sent you something 💌" */}
        <div className="text-center mb-6 pt-8 md:pt-12">
          <p className="text-lg text-muted-foreground">
            <span className="font-bold">{treatData.senderName}</span> sent you something 💌
          </p>
        </div>

        {/* 2. Header */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="text-2xl animate-sparkle absolute -top-2 -left-2">✨</div>
            <div className="text-2xl animate-sparkle absolute -top-2 -right-2" style={{animationDelay: '0.5s'}}>✨</div>
            <div className="text-2xl animate-sparkle absolute -bottom-2 left-1/2 transform -translate-x-1/2" style={{animationDelay: '1s'}}>✨</div>
            <h1 className={`text-3xl font-bold mb-2 ${getFontClass(treatData.headerFont)}`}>
              {treatData.headerText || `$${treatData.treatType === "custom" ? "25" : treatData.treatType} ${getTreatDescription(treatData.treatType)} treat`}
            </h1>
          </div>
        </div>

        {/* 3. Cover Art Image */}
        <div className="mb-8">
          <Card className={`shadow-glow rounded-3xl border-0 relative overflow-hidden aspect-square ${treatData.coverArt ? 'bg-black' : getThemeGradient(treatData.theme)}`}>
            {/* Floating sparkles */}
            <div className="absolute top-4 right-4 text-white/70 animate-float z-20">✨</div>
            <div className="absolute bottom-4 left-4 text-white/70 animate-float z-20" style={{animationDelay: '1s'}}>💫</div>
            
            {treatData.coverArt ? (
              <img 
                src={treatData.coverArt} 
                alt="Cover art" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white relative z-10">
                <div className="text-8xl animate-bounce-gentle">
                  {getTreatEmoji(treatData.treatType)}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* 4. "check your venmo 😉" */}
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-foreground">
            check your venmo 😉
          </p>
        </div>

        {/* 5. Sweet message */}
        {treatData.message && (
          <Card className="mb-8 p-6 rounded-3xl bg-white/80 border-0 shadow-card">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground italic">
                "{treatData.message}"
              </p>
              <div className="mt-3 text-sm text-muted-foreground">
                💖 Sent with love via cheerly
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons - Only show in non-preview mode and not for error states */}
        {!isPreviewMode && !treatData.isError && (
          <div className="space-y-3">
            <Button
              onClick={shareThis}
              className="w-full h-14 text-lg font-bold rounded-2xl bg-white hover:bg-white/90 text-primary shadow-card transition-all duration-300"
            >
              📤 Share This
            </Button>

            <Button
              onClick={() => {
                window.scrollTo(0, 0);
                navigate('/');
              }}
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 bg-white/70 hover:bg-white"
            >
              💖 Send One Back
            </Button>
          </div>
        )}

        {/* Error state actions */}
        {treatData.isError && (
          <div className="space-y-3">
            <Button
              onClick={() => {
                window.scrollTo(0, 0);
                navigate('/');
              }}
              className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-primary hover:shadow-glow"
            >
              🏠 Go to Homepage
            </Button>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-8 text-center">
          {isPreviewMode ? (
            <Button
              variant="ghost"
              onClick={() => {
                window.scrollTo(0, 0);
                navigate('/send/complete');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Exit Preview
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="text-center">
                <button
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate('/');
                  }}
                  className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
                >
                  cheerly
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Treat;