import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import QRCode from "react-qr-code";
import { ClinkLoadingScreen } from "@/components/ClinkLoadingScreen";
import { useState, useEffect } from "react";
import { smartScrollToTop, trackUserScrolling } from "@/lib/scrollUtils";

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
    <div className="min-h-[100dvh] bg-gradient-sunset overflow-hidden relative">
      {/* Enhanced Sparkle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-2 h-2 bg-sparkle-1 rounded-full animate-sparkle opacity-80"></div>
        <div className="absolute top-32 left-16 w-1 h-1 bg-sparkle-2 rounded-full animate-sparkle animation-delay-1000"></div>
        <div className="absolute bottom-40 right-32 w-3 h-3 bg-sparkle-3 rounded-full animate-pulse-glow animation-delay-2000"></div>
        <div className="absolute bottom-60 left-20 w-1 h-1 bg-sparkle-1 rounded-full animate-sparkle animation-delay-3000"></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-sparkle-2 rounded-full animate-float animation-delay-1500"></div>
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-sparkle-3 rounded-full animate-sparkle animation-delay-500"></div>
      </div>

      {/* Minimalist Header */}
      <header className="relative z-10 p-6">
        <button
          onClick={() => {
            localStorage.removeItem('editData');
            smartScrollToTop();
          }}
          className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:scale-105 transition-all duration-300 font-space tracking-tight"
        >
          clink
        </button>
      </header>

      {isMobile ? (
        /* Mobile: Magazine-Style Hero */
        <div className="flex-1 flex flex-col justify-center px-6 pb-20 relative z-10">
          {/* Hero Statement */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="block text-foreground font-space">Send love</span>
              <span className="block bg-gradient-primary bg-clip-text text-transparent animate-pulse-glow font-space">
                that hits different
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 font-medium max-w-md mx-auto leading-relaxed">
              Voice messages, memories, and good vibes delivered with style ✨
            </p>
          </div>

          {/* Interactive Elements */}
          <div className="space-y-8">
            {/* Main CTA */}
            <div className="text-center">
              <Button
                onClick={() => {
                  localStorage.removeItem('editData');
                  smartScrollToTop();
                  navigate('/send');
                }}
                className="h-16 px-12 text-xl font-bold rounded-full bg-gradient-primary hover:shadow-warm transition-all duration-500 transform hover:scale-105 shadow-warm border-2 border-white/20 hover:border-white/40 font-space tracking-wide"
              >
                Create a clink ✨
              </Button>
            </div>

            {/* Social Proof */}
            <div className="text-center space-y-3">
              <div className="flex justify-center items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full border-2 border-white animate-pulse"></div>
                  <div className="w-8 h-8 bg-gradient-secondary rounded-full border-2 border-white animate-pulse animation-delay-300"></div>
                  <div className="w-8 h-8 bg-sparkle-3 rounded-full border-2 border-white animate-pulse animation-delay-600"></div>
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  Join thousands spreading good vibes
                </span>
              </div>
            </div>
          </div>

          {/* Floating Action Hints */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-2xl mb-2 animate-bounce-gentle">🎵</div>
              <div className="text-xs text-muted-foreground font-medium">Voice notes</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-2xl mb-2 animate-heart-beat">💝</div>
              <div className="text-xs text-muted-foreground font-medium">Add cash</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="text-2xl mb-2 animate-wiggle">📸</div>
              <div className="text-xs text-muted-foreground font-medium">Cover art</div>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop: Improved QR Experience */
        <div className="flex-1 flex flex-col justify-center px-6 pb-20 relative z-10">
          <div className="max-w-lg mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              <span className="block text-foreground font-space">Experience</span>
              <span className="block bg-gradient-primary bg-clip-text text-transparent font-space">
                clink on mobile
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              The magic happens on your phone — scan to start creating
            </p>
            
            {/* Enhanced QR Code */}
            <div className="relative mb-8">
              <div className="bg-white p-8 rounded-3xl shadow-warm border-4 border-white/50 inline-block">
                <QRCode
                  value="https://clink.ly"
                  size={180}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox="0 0 256 256"
                />
              </div>
              {/* Floating elements around QR */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-sparkle-1 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-sparkle-2 rounded-full animate-sparkle"></div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
              <p className="text-sm font-medium">
                Visit{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent font-bold">
                  clink.ly
                </span>{" "}
                on your mobile device
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-muted-foreground font-medium">
          Made with ✨ by clink • 2024
        </p>
      </footer>
    </div>
  );
};

export default Index;