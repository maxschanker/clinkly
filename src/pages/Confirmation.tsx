import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { recordShare } from "@/lib/treatService";

const Confirmation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [treatData, setTreatData] = useState<any>(null);
  const [treatSlug, setTreatSlug] = useState<string>("");
  
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

  const shareOowoo = async () => {
    if (!treatData || !treatSlug) {
      toast({
        title: "Error",
        description: "Treat data not available"
      });
      return;
    }

    // Use the shareUrl from backend if available, otherwise construct it
    const shareUrl = treatData.shareUrl || `${window.location.origin}/t/${treatSlug}`;
    const message = `${treatData.header_text || treatData.headerText || "Someone sent you a treat"} ✨`;
    
    console.log('✅ Sharing treat with URL:', shareUrl);
    
    // Record sharing analytics
    if (treatData.id) {
      try {
        await recordShare(treatData.id, navigator.share ? 'native_share' : 'clipboard');
      } catch (error) {
        console.error('Failed to record share:', error);
      }
    }
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Oowoo Treat',
          text: message,
          url: shareUrl
        });
        setStepCompleted(prev => ({ ...prev, share: true }));
        return;
      } catch (err) {
        console.log('Share cancelled or failed');
        return;
      }
    }
    
    // Fallback to copying link
    try {
      await navigator.clipboard.writeText(`${message} ${shareUrl}`);
      setStepCompleted(prev => ({ ...prev, share: true }));
      toast({
        title: "Copied! 📋",
        description: "Treat link copied to clipboard"
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
    const amount = treatData.amount || (treatData.treatType === "custom" ? "25" : treatData.treatType);
    const note = generateVenmoMessage();
    const venmoHandle = treatData.venmo_handle || treatData.venmoHandle || treatData.recipientHandle;
    const venmoUrl = `venmo://paycharge?txn=pay&recipients=${venmoHandle}&amount=${amount}&note=${encodeURIComponent(note)}`;
    window.open(venmoUrl, '_blank');
    setStepCompleted(prev => ({ ...prev, venmo: true }));
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
      venmoHandle: treatData.venmo_handle,
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
              oowoo
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
            {allStepsComplete ? 'Your treat is on its way!' : 'Your oowoo is wrapped and ready to go'}
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
            👀 Preview oowoo
          </Button>
        </div>

        {/* Two-Step Process */}
        <div className="space-y-6">
          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-3 mb-3 justify-center">
              <StepIndicator completed={stepCompleted.share} />
              <h3 className="text-lg font-bold">Step 1: Share your oowoo</h3>
            </div>
            <div className="space-y-3">
              <Button
                onClick={shareOowoo}
                className="w-full h-12 text-base font-bold rounded-2xl bg-gradient-primary hover:shadow-glow"
              >
                📤 Send It
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="w-full h-12 rounded-2xl border-2 border-primary/30 bg-white/70 hover:bg-primary/10"
              >
                🔗 Copy Link
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center gap-3 mb-3 justify-center">
              <StepIndicator completed={stepCompleted.venmo} />
              <h3 className="text-lg font-bold">Step 2: Send the $$ with Venmo</h3>
            </div>
            <Button
              onClick={openVenmo}
              className="w-full h-12 text-base font-bold rounded-2xl bg-gradient-primary hover:shadow-glow"
            >
              💰 Open Venmo
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
    </div>
  );
};

export default Confirmation;