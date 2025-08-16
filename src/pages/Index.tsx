import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import QRCode from "react-qr-code";
import { ClinkLoadingScreen } from "@/components/ClinkLoadingScreen";
import { useState, useEffect } from "react";
import { smartScrollToTop, trackUserScrolling } from "@/lib/scrollUtils";
import { 
  Heart, 
  Gift, 
  Users, 
  TrendingUp, 
  Sparkles,
  Check,
  ArrowRight,
  Star,
  Zap
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Clear any lingering edit data when starting fresh
    localStorage.removeItem('editData');
    
    // Track user scrolling to prevent interruptions
    const cleanup = trackUserScrolling();
    
    // Ensure loading screen shows for at least 1 second
    const minLoadingTime = setTimeout(() => {
      setShowLoading(false);
    }, 1000);

    return () => {
      clearTimeout(minLoadingTime);
      cleanup?.();
    };
  }, []);

  // Show loading screen while mobile detection is undefined or during minimum loading time
  if (isMobile === undefined || showLoading) {
    return <ClinkLoadingScreen />;
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-background flex flex-col relative overflow-hidden touch-pan-y overscroll-none">
      {/* Floating Sparkles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-32 w-2 h-2 bg-sparkle-1 rounded-full animate-sparkle animation-delay-1000 opacity-70"></div>
        <div className="absolute top-60 right-16 w-1 h-1 bg-sparkle-2 rounded-full animate-sparkle animation-delay-3000 opacity-80"></div>
        <div className="absolute top-20 left-20 w-1 h-1 bg-sparkle-3 rounded-full animate-sparkle animation-delay-2000 opacity-60"></div>
        <div className="absolute bottom-40 left-32 w-2 h-2 bg-sparkle-1 rounded-full animate-sparkle animation-delay-4000 opacity-50"></div>
      </div>

      {/* Header */}
      <header className="w-full p-4 pb-2 md:p-6 md:pb-2 relative z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={() => {
              localStorage.removeItem('editData');
              smartScrollToTop();
            }}
            className="text-2xl font-bold text-foreground hover:scale-105 transition-transform duration-200"
          >
            clink
          </button>
          
          {isMobile && (
            <button className="p-2 rounded-full bg-gradient-primary hover:shadow-glow transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </header>

      {isMobile ? (
        <>
          {/* Activity Notification */}
          <div className="px-4 mb-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-card backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-card animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Sarah just sent a clink</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-xs text-muted-foreground">New</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="px-4 mb-12 relative z-10">
            <div className="max-w-6xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                <span className="text-foreground">send money</span>
                <br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">that hits different</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Voice messages that feel like hugs. Because some moments deserve more than just money.
              </p>
            </div>
          </div>

          {/* Featured Clink Preview */}
          <div className="px-4 mb-12 relative z-10">
            <div className="max-w-sm mx-auto">
              <div className="bg-gradient-primary p-6 rounded-3xl shadow-glow relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🫶</div>
                  <h3 className="text-xl font-bold text-white mb-2">Birthday Love</h3>
                  <p className="text-white/80 text-sm">Happy birthday bestie! 💕</p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white text-sm font-medium">Voice Message</span>
                    <span className="text-white/80 text-xs">0:23</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <span className="text-3xl font-bold text-white">$25</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="px-4 mb-12 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-foreground mb-1">50K+</div>
                  <p className="text-sm text-muted-foreground">clinks sent</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground mb-1">98%</div>
                  <p className="text-sm text-muted-foreground">love rate</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground mb-1">24/7</div>
                  <p className="text-sm text-muted-foreground">good vibes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Templates */}
          <div className="px-4 mb-12 relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Trending Templates</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-card backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:shadow-glow transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🎂</div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">Birthday</h3>
                      <p className="text-xs text-muted-foreground">2.1k uses</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gradient-primary text-white px-2 py-1 rounded-full">Trending</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-card backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:shadow-glow transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">💕</div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">Love You</h3>
                      <p className="text-xs text-muted-foreground">1.8k uses</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gradient-primary text-white px-2 py-1 rounded-full">Hot</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-card backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:shadow-glow transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🎉</div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">Celebration</h3>
                      <p className="text-xs text-muted-foreground">1.5k uses</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">Popular</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-card backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:shadow-glow transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">🙏</div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">Thank You</h3>
                      <p className="text-xs text-muted-foreground">1.2k uses</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">Rising</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main CTA */}
          <div className="px-4 mb-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Button
                onClick={() => {
                  localStorage.removeItem('editData');
                  smartScrollToTop();
                  navigate('/send');
                }}
                className="h-16 px-8 text-xl font-bold rounded-full bg-gradient-primary hover:shadow-glow transition-all duration-500 transform hover:scale-105 shadow-button border border-white/20 w-full max-w-sm"
              >
                create your clink ✨
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Value Props */}
          <div className="px-4 mb-12 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Instant Impact</h3>
                  <p className="text-sm text-muted-foreground">Your voice + money = unforgettable moments</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Personal Touch</h3>
                  <p className="text-sm text-muted-foreground">Every clink carries your love and personality</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Stay Connected</h3>
                  <p className="text-sm text-muted-foreground">Share moments that matter, anywhere, anytime</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Checkmarks */}
          <div className="px-4 mb-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-card backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4 text-center">What makes clink special?</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Voice messages that feel like hugs</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Send money with meaning</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Beautiful, shareable experiences</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Secure and instant delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Desktop: QR Code Landing - Keep Original
        <div className="flex-1 flex items-start justify-center px-4 pt-8 md:pt-12 pb-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="bg-gradient-card p-12 rounded-3xl shadow-card backdrop-blur-sm border border-white/20">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
                <span className="bg-gradient-primary bg-clip-text text-transparent">clink</span> works best on mobile!
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 animate-fade-in">
                Scan the QR code below or visit on your phone to get started
              </p>
              
              <div className="flex justify-center mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-glow">
                  <QRCode
                    value="https://clink.ly"
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox="0 0 256 256"
                  />
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-8">
                Visit <span className="font-semibold bg-gradient-primary bg-clip-text text-transparent">clink.ly</span> on your mobile device
              </p>
              
              <div className="flex justify-center space-x-4 opacity-60">
                <div className="w-2 h-2 bg-sparkle-1 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-sparkle-2 rounded-full animate-pulse animation-delay-500"></div>
                <div className="w-2 h-2 bg-sparkle-3 rounded-full animate-pulse animation-delay-1000"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="w-full p-4 md:p-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            clink • 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
