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
    <div className="min-h-[100dvh] bg-gradient-background flex flex-col relative overflow-hidden touch-pan-y overscroll-none">
      {/* Sparkle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-32 w-1 h-1 bg-sparkle-2 rounded-full animate-sparkle animation-delay-1000 opacity-70"></div>
        <div className="absolute top-60 right-16 w-1 h-1 bg-sparkle-1 rounded-full animate-sparkle animation-delay-3000 opacity-80"></div>
      </div>

      {/* Header */}
      <header className="w-full p-4 pb-2 md:p-6 md:pb-2 relative z-10">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => {
              // Clear edit data when clicking logo
              localStorage.removeItem('editData');
              smartScrollToTop();
            }}
            className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
          >
            clink
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8 md:pt-12 pb-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          {/* Card Container */}
          <div className="bg-gradient-card p-12 rounded-3xl shadow-card backdrop-blur-sm border border-white/20">
            {isMobile ? (
              <>
                {/* Mobile: Original Content */}
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight animate-fade-in">
                  Make it a moment
                </h2>
                
                {/* Emoji with glow effect */}
                <div className="relative mb-6">
                  <div className="text-7xl animate-bounce-gentle relative">
                    🫶
                    <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-30 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Get Started Button */}
                <Button
                  onClick={() => {
                    // Clear edit data when starting fresh clink
                    localStorage.removeItem('editData');
                    smartScrollToTop();
                    navigate('/send');
                  }}
                  className="h-16 px-16 text-xl font-semibold rounded-full bg-gradient-primary hover:shadow-glow transition-all duration-500 transform hover:scale-110 hover:rotate-1 shadow-button border border-white/20"
                >
                  Send a clink
                </Button>
                
                {/* Decorative elements */}
                <div className="flex justify-center space-x-4 mt-8 opacity-60">
                  <div className="w-2 h-2 bg-sparkle-1 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-sparkle-2 rounded-full animate-pulse animation-delay-500"></div>
                  <div className="w-2 h-2 bg-sparkle-3 rounded-full animate-pulse animation-delay-1000"></div>
                </div>
              </>
            ) : (
              <>
                {/* Desktop: QR Code Landing */}
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
                  <span className="bg-gradient-primary bg-clip-text text-transparent">clink</span> works best on mobile!
                </h2>
                
                <p className="text-lg text-muted-foreground mb-8 animate-fade-in">
                  Scan the QR code below or visit on your phone to get started
                </p>
                
                {/* QR Code */}
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
                
                {/* Decorative elements */}
                <div className="flex justify-center space-x-4 opacity-60">
                  <div className="w-2 h-2 bg-sparkle-1 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-sparkle-2 rounded-full animate-pulse animation-delay-500"></div>
                  <div className="w-2 h-2 bg-sparkle-3 rounded-full animate-pulse animation-delay-1000"></div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Minimalist Footer */}
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