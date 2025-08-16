import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { ClinkLoadingScreen } from "@/components/ClinkLoadingScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Heart, Share2, Headphones, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Clear any lingering editData from localStorage
    localStorage.removeItem('editData');
    
    // Clear scroll tracking data
    return () => {
      localStorage.removeItem('scrollPosition');
      localStorage.removeItem('scrollDirection');
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isMobile === undefined || showLoading) {
    return <ClinkLoadingScreen />;
  }

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-foreground">
            clink
          </h1>
          <p className="text-muted-foreground mb-8">
            This app is designed for mobile devices. Please visit on your phone for the best experience.
          </p>
          <div className="bg-card p-6 rounded-lg border mb-6">
            <QRCode
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={window.location.href}
              viewBox={`0 0 256 256`}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Scan the QR code with your phone
          </p>
        </div>
        
        <footer className="fixed bottom-4 text-center text-sm text-muted-foreground">
          © 2024 clink. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">clink</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/send')}
              className="haptic-light"
            >
              Create
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-clink-primary/10 text-clink-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Share voice messages beautifully
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your voice,{" "}
            <span className="text-clink-primary">their moment</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Create beautiful, personalized voice messages that capture emotions and create lasting memories. Perfect for birthdays, anniversaries, or just because.
          </p>
          
          <Button
            onClick={() => navigate('/send')}
            size="lg"
            className="bg-clink-primary hover:bg-clink-primary/90 text-white font-semibold px-8 py-3 haptic-medium group"
          >
            Start Creating
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Featured Preview */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-clink-primary/20 bg-gradient-to-br from-clink-surface to-clink-bg">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-clink-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Headphones className="w-8 h-8 text-clink-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Happy Birthday Sarah!</h3>
                <p className="text-sm text-muted-foreground">From Alex • 2 min ago</p>
              </div>
              
              <div className="bg-clink-primary/5 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 text-clink-primary">
                  <div className="w-2 h-2 bg-clink-primary rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-clink-primary rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-clink-primary rounded-full animate-pulse delay-200"></div>
                  <span className="text-sm font-medium ml-2">1:32</span>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button variant="ghost" size="sm" className="haptic-light">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="haptic-light">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Why choose clink?
          </h2>
          <p className="text-muted-foreground">
            The easiest way to share meaningful voice messages
          </p>
        </div>
        
        <div className="grid gap-6 max-w-2xl mx-auto">
          <Card className="haptic-light">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-clink-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-clink-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Quick & Simple</h3>
                  <p className="text-sm text-muted-foreground">
                    Record, customize, and share in under a minute. No sign-ups required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="haptic-light">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-clink-pink/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-clink-pink" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Personal Touch</h3>
                  <p className="text-sm text-muted-foreground">
                    Add custom colors, messages, and themes to make each clink unique.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="haptic-light">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-clink-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-6 h-6 text-clink-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Easy Sharing</h3>
                  <p className="text-sm text-muted-foreground">
                    Share via link, QR code, or directly through your favorite apps.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 mb-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to create your first clink?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start sharing meaningful voice messages today
          </p>
          <Button
            onClick={() => navigate('/send')}
            size="lg"
            className="bg-clink-primary hover:bg-clink-primary/90 text-white font-semibold px-8 py-3 haptic-medium group"
          >
            Create Your Clink
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">clink</h2>
          <p className="text-sm text-muted-foreground">
            © 2024 clink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;