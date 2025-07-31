import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Share2, Copy, Eye } from "lucide-react";

const Confirmation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [treatData, setTreatData] = useState<any>(null);
  const [treatSlug] = useState(() => Math.random().toString(36).substring(7));
  
  const [completedSteps, setCompletedSteps] = useState({
    shared: false,
    venmoSent: false
  });

  useEffect(() => {
    const data = localStorage.getItem('treatData');
    if (data) {
      setTreatData(JSON.parse(data));
    } else {
      navigate('/send');
    }
  }, [navigate]);

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

  const generateVenmoMessage = () => {
    if (!treatData) return "";
    const emoji = getTreatEmoji(treatData.treatType);
    const description = getTreatDescription(treatData.treatType);
    return `${description} on me ${emoji} → onme.to/t/${treatSlug}`;
  };

  const shareOowoo = async () => {
    const shareUrl = `${window.location.origin}/t/${treatSlug}`;
    const shareText = `${treatData?.senderName || 'Someone'} sent you an oowoo! 💝`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          url: shareUrl
        });
        setCompletedSteps(prev => ({ ...prev, shared: true }));
        toast({
          title: "Shared! ✨",
          description: "Your oowoo is on its way"
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copy link
      copyLink();
    }
  };

  const copyLink = async () => {
    const shareUrl = `${window.location.origin}/t/${treatSlug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCompletedSteps(prev => ({ ...prev, shared: true }));
      toast({
        title: "Link copied! 🔗",
        description: "Share it with your recipient"
      });
    } catch (err) {
      toast({
        title: "Oops!",
        description: "Couldn't copy link"
      });
    }
  };

  const openVenmo = () => {
    if (!treatData) return;
    const amount = treatData.amount || treatData.treatType === "custom" ? "25" : treatData.treatType;
    const note = generateVenmoMessage();
    const venmoUrl = `venmo://paycharge?txn=pay&recipients=${treatData.recipientHandle}&amount=${amount}&note=${encodeURIComponent(note)}`;
    window.open(venmoUrl, '_blank');
    setCompletedSteps(prev => ({ ...prev, venmoSent: true }));
    toast({
      title: "Venmo opened! 💜",
      description: "Complete your payment to deliver the oowoo"
    });
  };

  const previewTreat = () => {
    // Save treat data for the treat page
    localStorage.setItem('currentTreat', JSON.stringify({
      ...treatData,
      slug: treatSlug,
      createdAt: new Date().toISOString()
    }));
    navigate(`/t/${treatSlug}`);
  };

  if (!treatData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const getFontClass = (fontId: string) => {
    switch (fontId) {
      case "playfair": return "font-playfair";
      case "dancing": return "font-dancing";
      case "arial": return "font-arial";
      default: return "font-sans";
    }
  };

  const allStepsCompleted = completedSteps.shared && completedSteps.venmoSent;

  return (
    <div className="min-h-screen bg-gradient-background p-4 flex items-center justify-center">
      <div className="max-w-md mx-auto w-full max-h-[80vh] overflow-y-auto">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🎉</div>
          <h1 className="text-xl font-bold">Oowoo Ready!</h1>
        </div>

        {/* Mini Summary with Preview */}
        <Card className="p-4 mb-6 bg-gradient-card shadow-card rounded-3xl border-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                ${treatData.amount || (treatData.treatType === "custom" ? "25" : treatData.treatType)} {getTreatDescription(treatData.treatType || treatData.amount)} → @{treatData.recipientHandle}
              </p>
            </div>
            <Button
              onClick={previewTreat}
              variant="outline"
              size="sm"
              className="rounded-2xl border-primary/30 bg-white/50 hover:bg-white/70"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          </div>
        </Card>

        {/* Single Unified Action Card */}
        <Card className="p-6 mb-6 rounded-3xl border-0 bg-card/50 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareOowoo}
                className="h-12 rounded-2xl bg-gradient-primary hover:shadow-glow transition-all duration-300 relative"
                disabled={completedSteps.shared}
              >
                <div className="flex flex-col items-center">
                  <Share2 className="w-4 h-4 mb-1" />
                  <span className="text-xs">Share Link</span>
                </div>
                {completedSteps.shared && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </Button>
              
              <Button
                onClick={openVenmo}
                className="h-12 rounded-2xl bg-gradient-primary hover:shadow-glow transition-all duration-300 relative"
                disabled={completedSteps.venmoSent}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm mb-1">💜</span>
                  <span className="text-xs">Venmo</span>
                </div>
                {completedSteps.venmoSent && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </Button>
            </div>

            {/* Copy Link Alternative */}
            {!completedSteps.shared && (
              <Button
                onClick={copyLink}
                variant="outline"
                size="sm"
                className="w-full rounded-2xl border-primary/30 bg-white/70 hover:bg-primary/10"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link Instead
              </Button>
            )}
          </div>
        </Card>

        {/* Smart Success State */}
        {allStepsCompleted && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
              <span className="text-lg">✨</span>
              <span className="text-sm font-medium text-primary">Oowoo delivered!</span>
            </div>
          </div>
        )}

        {/* Minimized Footer */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/send')}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Send Another ✨
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;