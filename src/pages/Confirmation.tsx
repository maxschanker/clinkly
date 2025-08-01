import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { encodeTreatData } from "@/lib/utils";

const Confirmation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [treatData, setTreatData] = useState<any>(null);
  const [treatSlug] = useState(() => Math.random().toString(36).substring(7));
  
  // Step completion state
  const [stepCompleted, setStepCompleted] = useState({
    share: false,
    venmo: false
  });
  
  const allStepsComplete = stepCompleted.share && stepCompleted.venmo;

  useEffect(() => {
    const data = localStorage.getItem('treatData');
    if (data) {
      setTreatData(JSON.parse(data));
    } else {
      navigate('/send');
    }
  }, [navigate]);

  const getTreatEmoji = (type: string) => {
    return "💝";
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
    const message = treatData.headerText || getTreatDescription(treatData.treatType) + " on me";
    return `${message} ${emoji} → oowoo.me/t/${treatSlug}`;
  };

  const shareOowoo = async () => {
    const encodedData = encodeTreatData({ ...treatData, slug: treatSlug, createdAt: new Date().toISOString() });
    const link = `${window.location.origin}/t/${treatSlug}${encodedData ? `?data=${encodedData}` : ''}`;
    const message = "I sent you a treat! ✨ Check it out:";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Oowoo Treat',
          text: message,
          url: link
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
      await navigator.clipboard.writeText(`${message} ${link}`);
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
    const amount = treatData.treatType === "custom" ? "25" : treatData.treatType;
    const note = generateVenmoMessage();
    const venmoUrl = `venmo://paycharge?txn=pay&recipients=${treatData.recipientHandle}&amount=${amount}&note=${encodeURIComponent(note)}`;
    window.open(venmoUrl, '_blank');
    setStepCompleted(prev => ({ ...prev, venmo: true }));
  };

  const handleCopyLink = async () => {
    const encodedData = encodeTreatData({ ...treatData, slug: treatSlug, createdAt: new Date().toISOString() });
    const link = `${window.location.origin}/t/${treatSlug}${encodedData ? `?data=${encodedData}` : ''}`;
    try {
      await navigator.clipboard.writeText(link);
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
    // Save treat data for the treat page
    localStorage.setItem('currentTreat', JSON.stringify({
      ...treatData,
      slug: treatSlug,
      createdAt: new Date().toISOString()
    }));
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
        <header className="w-full p-4 md:p-6 relative z-10">
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
        <div className="text-center mb-6 pt-2">
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
              <p className="text-sm text-muted-foreground">To: <span className="font-semibold text-foreground">{treatData.recipientName}</span></p>
              <p className="text-sm text-muted-foreground">From: <span className="font-semibold text-foreground">{treatData.senderName}</span></p>
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