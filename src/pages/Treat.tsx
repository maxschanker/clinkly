import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Treat = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [treatData, setTreatData] = useState<any>(null);

  useEffect(() => {
    // Try to get treat data from localStorage (preview data from Confirmation page)
    const data = localStorage.getItem('currentTreat');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.slug === slug) {
        setTreatData(parsed);
        return;
      }
    }

    // Fallback demo data if no localStorage data
    setTreatData({
      headerText: "$5 coffee treat",
      headerFont: "font-sans",
      senderName: "Sarah ✨",
      recipientHandle: "@friend",
      treatType: "5",
      message: "congrats on the new job! you deserve this 🎉",
      coverArt: "",
      coverArtType: "gradient",
      theme: "primary",
      slug: slug,
      createdAt: new Date().toISOString()
    });
  }, [slug]);

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
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'OnMe Treat',
          text: text,
          url: url
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

  if (!treatData) {
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
        {/* 1. "[From] sent you something 💌" */}
        <div className="text-center mb-6 pt-8">
          <p className="text-lg text-muted-foreground">
            <span className="font-medium">{treatData.senderName}</span> sent you something 💌
          </p>
        </div>

        {/* 2. Header */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="text-2xl animate-sparkle absolute -top-2 -left-2">✨</div>
            <div className="text-2xl animate-sparkle absolute -top-2 -right-2" style={{animationDelay: '0.5s'}}>✨</div>
            <div className="text-2xl animate-sparkle absolute -bottom-2 left-1/2 transform -translate-x-1/2" style={{animationDelay: '1s'}}>✨</div>
            <h1 className={`text-3xl font-bold mb-2 ${treatData.headerFont || 'font-sans'}`}>
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
                💖 Sent with love via oowoo
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={shareThis}
            className="w-full h-14 text-lg font-bold rounded-2xl bg-white hover:bg-white/90 text-primary shadow-card transition-all duration-300"
          >
            📤 Share This
          </Button>

          <Button
            onClick={() => navigate('/send')}
            variant="outline"
            className="w-full h-12 rounded-2xl border-2 bg-white/70 hover:bg-white"
          >
            💖 Send One Back
          </Button>
        </div>

        {/* Footer Logo */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
          >
            oowoo
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Discover oowoo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Treat;