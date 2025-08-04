import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { recordShare } from "@/lib/treatService";

const Confirmation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [treatData, setTreatData] = useState<any>(null);
  const [treatSlug, setTreatSlug] = useState<string>("");
  const [showVenmoModal, setShowVenmoModal] = useState(false);
  
  // Step completion state
  const [stepCompleted, setStepCompleted] = useState({
    share: false,
    venmo: false
  });
  
  const allStepsComplete = stepCompleted.share && stepCompleted.venmo;

  useEffect(() => {
    const data = localStorage.getItem('treatData');
    if (data) {
      const parsedData = JSON.parse(data);
      setTreatData(parsedData);
      
      // Set the slug from the backend response
      if (parsedData.slug) {
        setTreatSlug(parsedData.slug);
      }
    } else {
      navigate('/send');
    }
  }, [navigate]);

  const getTreatEmoji = (type: string) => {
    return "✨";
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
    const emoji = getTreatEmoji(treatData.treat_type || treatData.treatType);
    const message = treatData.header_text || treatData.headerText || getTreatDescription(treatData.treat_type || treatData.treatType) + " on me";
    return `${message} ${emoji} → ${window.location.origin}/t/${treatSlug}`;
  };

  const shareClinkAndPromptVenmo = async () => {
    if (!treatData || !treatSlug) {
      toast({
        title: "Error",
        description: "Treat data not available"
      });
      return;
    }

    // Use the shareUrl from backend if available, otherwise construct it
    const shareUrl = treatData.shareUrl || `${window.location.origin}/t/${treatSlug}`;
    const message = `${treatData.header_text || treatData.headerText || "Someone sent you a clink"} ✨`;
    
    console.log('✅ Sharing treat with URL:', shareUrl);
    
    // Record sharing analytics
    if (treatData.id) {
      try {
        await recordShare(treatData.id, navigator.share ? 'native_share' : 'clipboard');
      } catch (error) {
        console.error('Failed to record share:', error);
      }
    }

    let shareSuccessful = false;
    
    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'clink Treat',
          text: message,
          url: shareUrl
        });
        shareSuccessful = true;
        setStepCompleted(prev => ({ ...prev, share: true }));
      } catch (err) {
        console.log('Share cancelled or failed');
        return;
      }
    } else {
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(`${message} ${shareUrl}`);
        shareSuccessful = true;
        setStepCompleted(prev => ({ ...prev, share: true }));
        
        toast({
          title: "Copied! 📋",
          description: "Link copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Oops!",
          description: "Couldn't copy link"
        });
        return;
      }
    }

    // If share was successful, show Venmo modal
    if (shareSuccessful) {
      setShowVenmoModal(true);
    }
  };

  const openVenmo = () => {
    if (!treatData) return;
    const amount = treatData.amount || (treatData.treatType === "custom" ? "25" : treatData.treatType);
    const note = generateVenmoMessage();
    const venmoUrl = `venmo://paycharge?txn=pay&amount=${amount}&note=${encodeURIComponent(note)}`;
    
    try {
      window.open(venmoUrl, '_blank');
      setStepCompleted(prev => ({ ...prev, venmo: true }));
      setShowVenmoModal(false);
      
      toast({
        title: "🎉 Perfect!",
        description: "Venmo is opening to send the $$!",
      });
    } catch (error) {
      toast({
        title: "Can't open Venmo",
        description: "Please open Venmo manually to send the payment.",
        duration: 5000,
      });
    }
  };

  const handleCopyLink = async () => {
    if (!treatData || !treatSlug) {
      toast({
        title: "Error",
        description: "Treat data not available"
      });
      return;
    }

    // Use the shareUrl from backend if available, otherwise construct it
    const shareUrl = treatData.shareUrl || `${window.location.origin}/t/${treatSlug}`;
    
    console.log('🔗 Copying link:', shareUrl);
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStepCompleted(prev => ({ ...prev, share: true }));
      toast({
        title: "Copied! 📋",
        description: "Link copied to clipboard"
      });
    } catch (err) {
      toast({
        title: "Oops!",
        description: "Couldn't copy link"
      });
    }
  };

  // Step Indicator Component with circular checkmarks (inline version)
  const StepIndicator = ({ completed }: { completed: boolean }) => (
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
      completed 
        ? 'bg-green-500 border-green-500' 
        : 'bg-muted border-muted-foreground/30'
    }`}>
      {completed && (
        <svg 
          className="w-4 h-4 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      )}
    </div>
  );

  const previewTreat = () => {
    // Transform backend data format to frontend format for preview
    const previewData = {
      senderName: treatData.sender_name,
      recipientName: treatData.recipient_name,
      headerText: treatData.header_text,
      headerFont: treatData.font_id?.replace('font-', '') || 'playfair',
      message: treatData.message,
      amount: treatData.amount,
      coverArt: treatData.cover_art_content,
      coverArtType: treatData.cover_art_type,
      treatType: treatData.treat_type,
      slug: treatSlug,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('currentTreat', JSON.stringify(previewData));
    window.scrollTo(0, 0);
    navigate(`/t/${treatSlug}`);
  };

  if (!treatData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="w-full p-4 pb-2 md:p-6 md:pb-2 relative z-10">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                navigate('/');
              }}
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
            >
              clink
            </button>
          </div>
        </header>

        {/* Success Header */}
        <div className="text-center mb-6">
          <div className={`text-6xl mb-4 ${allStepsComplete ? 'animate-sparkle' : 'animate-bounce-gentle'}`}>
            {allStepsComplete ? '✨' : '🎉'}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {allStepsComplete ? 'Perfect! All done!' : 'You made someone\'s day!'}
          </h1>
          <p className="text-muted-foreground">
            {allStepsComplete ? 'Your treat is on its way!' : 'Your clink is wrapped and ready to go'}
          </p>
        </div>

        {/* Envelope Card */}
        <Card className="p-6 mb-4 bg-gradient-card shadow-card rounded-3xl border-0 relative" onClick={previewTreat}>
          <div className="text-center">
            <div className="text-5xl mb-4">💌</div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">To: <span className="font-semibold text-foreground">{treatData.recipient_name || treatData.recipientName}</span></p>
              <p className="text-sm text-muted-foreground">From: <span className="font-semibold text-foreground">{treatData.sender_name || treatData.senderName}</span></p>
            </div>
          </div>
        </Card>

        {/* Preview Button */}
        <div className="text-center mb-6">
          <Button
            onClick={previewTreat}
            variant="outline"
            size="sm"
            className="rounded-xl border-2 border-primary/30 bg-white/70 hover:bg-primary/10"
          >
            👀 Preview clink
          </Button>
        </div>

        {/* Single Action */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-3">Send the $$ with Venmo</h3>
            <p className="text-sm text-muted-foreground mb-4">(You'll choose who it's for inside Venmo)</p>
            <Button
              onClick={shareClinkAndPromptVenmo}
              className="w-full h-12 text-base font-bold rounded-2xl bg-gradient-primary hover:shadow-glow"
            >
              📨 Send Your Clink + Venmo
            </Button>
          </div>
          
          {/* Fallback copy option */}
          <div className="text-center">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 border-primary/30 bg-white/70 hover:bg-primary/10"
            >
              🔗 Copy Link Only
            </Button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 text-center space-y-3">
          <Button
            variant="ghost"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/send');
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            Send Another ✨
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/');
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </Button>
        </div>
      </div>

      {/* Venmo Modal */}
      <Dialog open={showVenmoModal} onOpenChange={setShowVenmoModal}>
        <DialogContent className="max-w-sm mx-auto bg-gradient-card border-0 rounded-3xl shadow-glow">
          <div className="text-center space-y-6 py-6">
            <div className="text-5xl mb-2">🎉</div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">
                Venmo is ready!
              </h2>
              <p className="text-base text-foreground">
                Just pick who it's for inside 👌
              </p>
            </div>
            <Button
              onClick={openVenmo}
              className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-primary hover:shadow-glow transform hover:scale-105 transition-all duration-200"
            >
              💸 Open Venmo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Confirmation;