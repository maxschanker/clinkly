import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, Share2, Copy, Eye } from "lucide-react";

const Confirmation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [treatData, setTreatData] = useState<any>(null);
  const [treatSlug] = useState(() => Math.random().toString(36).substring(7));
  const [showPreview, setShowPreview] = useState(false);
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
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-12">
          <div className="text-6xl mb-4 animate-bounce-gentle">🎉</div>
          <h1 className="text-3xl font-bold mb-2">You just made someone's day</h1>
          <p className="text-muted-foreground text-lg">Let's send your oowoo their way!</p>
        </div>

        {/* Envelope Summary Card */}
        <Card className="p-6 mb-8 bg-gradient-card shadow-card rounded-3xl border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">📩</div>
              <div className="text-sm text-muted-foreground">Oowoo #{treatSlug}</div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-12">To:</span>
                <span className="font-bold">{treatData.recipientName || treatData.recipientHandle}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-12">From:</span>
                <span className="font-bold">{treatData.senderName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-12">Gift:</span>
                <span className="font-bold">
                  ${treatData.amount || (treatData.treatType === "custom" ? "25" : treatData.treatType)} {getTreatDescription(treatData.treatType || treatData.amount)}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 border-primary/20 bg-white/50 hover:bg-white/70 transition-all"
            >
              <Eye className="w-4 h-4 mr-2" />
              👀 Preview Oowoo
            </Button>
          </div>
        </Card>

        {/* Step 1: Share */}
        <Card className="p-6 mb-6 rounded-3xl border-0 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              completedSteps.shared 
                ? 'bg-primary text-primary-foreground shadow-glow' 
                : 'bg-primary/20 text-primary'
            }`}>
              {completedSteps.shared ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <h3 className="text-lg font-bold">Share Your Oowoo</h3>
          </div>
          <p className="text-muted-foreground mb-4 text-sm">
            Send the link to your recipient so they can see their surprise!
          </p>
          <div className="space-y-3">
            <Button
              onClick={shareOowoo}
              className="w-full h-12 rounded-2xl bg-gradient-primary hover:shadow-glow transition-all duration-300"
              disabled={completedSteps.shared}
            >
              <Share2 className="w-4 h-4 mr-2" />
              📱 Share It
            </Button>
            <Button
              onClick={copyLink}
              variant="outline"
              className="w-full h-10 rounded-2xl border-2 border-primary/30 bg-white/70 hover:bg-primary/10"
              disabled={completedSteps.shared}
            >
              <Copy className="w-4 h-4 mr-2" />
              🔗 Copy Link
            </Button>
          </div>
        </Card>

        {/* Step 2: Venmo */}
        <Card className="p-6 mb-6 rounded-3xl border-0 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              completedSteps.venmoSent 
                ? 'bg-primary text-primary-foreground shadow-glow' 
                : 'bg-primary/20 text-primary'
            }`}>
              {completedSteps.venmoSent ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <h3 className="text-lg font-bold">Send the Cash (Venmo)</h3>
          </div>
          <p className="text-muted-foreground mb-4 text-sm">
            Complete the gift by sending ${treatData.amount || (treatData.treatType === "custom" ? "25" : treatData.treatType)} to @{treatData.recipientHandle}
          </p>
          <Button
            onClick={openVenmo}
            className="w-full h-12 rounded-2xl bg-gradient-primary hover:shadow-glow transition-all duration-300"
            disabled={completedSteps.venmoSent}
          >
            💜 Open Venmo
          </Button>
        </Card>

        {/* Completion Status */}
        <div className="text-center mb-8">
          {allStepsCompleted ? (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
              <div className="text-2xl mb-2">✨</div>
              <p className="font-bold text-primary">Oowoo delivered!</p>
              <p className="text-sm text-muted-foreground">Your recipient will get the full experience</p>
            </div>
          ) : (
            <div className="bg-accent/50 border border-accent rounded-2xl p-4">
              <p className="text-sm text-muted-foreground">
                Complete both steps to deliver the full oowoo experience ✨
              </p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="text-center space-y-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/send')}
            className="text-muted-foreground hover:text-foreground"
          >
            Send Another Oowoo ✨
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md mx-auto rounded-3xl border-0 bg-gradient-card shadow-glow">
          <DialogHeader>
            <DialogTitle className="text-center">Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Header */}
            {treatData.headerText && (
              <div className="text-center">
                <h2 className={`text-3xl font-bold ${getFontClass(treatData.headerFont)}`}>
                  {treatData.headerText}
                </h2>
              </div>
            )}

            {/* Cover Art */}
            <div className="relative rounded-2xl overflow-hidden shadow-card">
              <img
                src={treatData.coverArt}
                alt="Cover art"
                className="w-full h-48 object-cover"
              />
            </div>

            {/* Message */}
            {treatData.message && (
              <div className="bg-white/70 rounded-2xl p-4">
                <p className="text-center italic">"{treatData.message}"</p>
              </div>
            )}

            {/* Gift Info */}
            <div className="text-center">
              <div className="text-4xl mb-2">{getTreatEmoji(treatData.treatType || treatData.amount)}</div>
              <p className="font-bold text-lg">
                ${treatData.amount || (treatData.treatType === "custom" ? "25" : treatData.treatType)} for {getTreatDescription(treatData.treatType || treatData.amount)}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                From {treatData.senderName}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Confirmation;