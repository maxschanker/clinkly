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
    // Try to get treat data from localStorage (for demo)
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
      senderName: "Sarah ✨",
      recipientHandle: "@friend",
      treatType: "5",
      message: "congrats on the new job! you deserve this 🎉",
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
        {/* Magic Header */}
        <div className="text-center mb-8 pt-12">
          <div className="relative">
            <div className="text-2xl animate-sparkle absolute -top-2 -left-2">✨</div>
            <div className="text-2xl animate-sparkle absolute -top-2 -right-2" style={{animationDelay: '0.5s'}}>✨</div>
            <div className="text-2xl animate-sparkle absolute -bottom-2 left-1/2 transform -translate-x-1/2" style={{animationDelay: '1s'}}>✨</div>
            <h1 className="text-2xl font-bold mb-2">You've got a treat!</h1>
          </div>
          <p className="text-muted-foreground">Someone's thinking of you</p>
        </div>

        {/* Main Treat Card */}
        <Card className={`p-8 mb-6 ${getThemeGradient(treatData.theme)} shadow-glow rounded-3xl border-0 relative overflow-hidden`}>
          {/* Floating sparkles */}
          <div className="absolute top-4 right-4 text-white/70 animate-float">✨</div>
          <div className="absolute bottom-4 left-4 text-white/70 animate-float" style={{animationDelay: '1s'}}>💫</div>
          
          <div className="text-center text-white relative z-10">
            <div className="text-6xl mb-4 animate-bounce-gentle">
              {getTreatEmoji(treatData.treatType)}
            </div>
            
            <h2 className="text-2xl font-bold mb-2">
              ${treatData.treatType === "custom" ? "25" : treatData.treatType} for {getTreatDescription(treatData.treatType)}
            </h2>
            
            <p className="text-white/90 mb-4 text-lg">
              from {treatData.senderName}
            </p>
            
            {treatData.message && (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                <p className="text-white font-medium">
                  "{treatData.message}"
                </p>
              </div>
            )}
            
            <div className="text-white/70 text-sm">
              Sent with love via OnMe 💖
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/send')}
            className="w-full h-14 text-lg font-bold rounded-2xl bg-white hover:bg-white/90 text-primary shadow-card transition-all duration-300"
          >
            💖 Send One Back
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={copyVenmoHandle}
              variant="outline"
              className="h-12 rounded-2xl border-2 bg-white/70 hover:bg-white"
            >
              📋 Copy Their Venmo
            </Button>

            <Button
              onClick={shareThis}
              variant="outline"
              className="h-12 rounded-2xl border-2 bg-white/70 hover:bg-white"
            >
              📤 Share This
            </Button>
          </div>
        </div>

        {/* Fun Stats */}
        <Card className="mt-6 p-4 rounded-2xl bg-white/50 border-0">
          <div className="text-center text-sm text-muted-foreground">
            <p>This treat was created with ✨ magic</p>
            <p className="mt-1">Share the love → onme.to</p>
          </div>
        </Card>

        {/* Bottom Navigation */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Discover OnMe
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Treat;