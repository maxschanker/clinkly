import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
    const link = `${window.location.origin}/t/${treatSlug}`;
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
    const link = `${window.location.origin}/t/${treatSlug}`;
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

  // Progress Pill Component
  const ProgressPill = ({ step, completed }: { step: string; completed: boolean }) => (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-primary transition-all duration-700 ease-out ${
            completed ? 'w-full' : 'w-0'
          }`}
        />
      </div>
      <div className={`text-xs font-medium transition-colors duration-300 ${
        completed ? 'text-primary' : 'text-muted-foreground'
      }`}>
        {step}
      </div>
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
        {/* Success Header */}
        <div className="text-center mb-6 pt-12">
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
        <Card className="p-6 mb-4 bg-gradient-card shadow-card rounded-3xl border-0 relative">
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
            <h3 className="text-lg font-bold mb-3 text-center">Step 1: Share your Oowoo</h3>
            <ProgressPill step="Share" completed={stepCompleted.share} />
            <div className="space-y-3">
              <Button
                onClick={shareOowoo}
                disabled={stepCompleted.share}
                className={`w-full h-12 text-base font-bold rounded-2xl transition-all duration-300 ${
                  stepCompleted.share 
                    ? 'bg-primary/20 text-primary border-primary/30 cursor-default' 
                    : 'bg-gradient-primary hover:shadow-glow'
                }`}
              >
                {stepCompleted.share ? '✅ Done!' : '📤 Send It'}
              </Button>
              <Button
                onClick={handleCopyLink}
                disabled={stepCompleted.share}
                variant="outline"
                className={`w-full h-12 rounded-2xl border-2 transition-all duration-300 ${
                  stepCompleted.share
                    ? 'border-primary/30 bg-primary/10 text-primary cursor-default'
                    : 'border-primary/30 bg-white/70 hover:bg-primary/10'
                }`}
              >
                {stepCompleted.share ? '✅ Done!' : '🔗 Copy Link'}
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-center">Step 2: Send the $$ with Venmo</h3>
            <ProgressPill step="Venmo" completed={stepCompleted.venmo} />
            <Button
              onClick={openVenmo}
              disabled={stepCompleted.venmo}
              className={`w-full h-12 text-base font-bold rounded-2xl transition-all duration-300 ${
                stepCompleted.venmo
                  ? 'bg-primary/20 text-primary border-primary/30 cursor-default'
                  : 'bg-gradient-primary hover:shadow-glow'
              }`}
            >
              {stepCompleted.venmo ? '✅ Done!' : '💰 Open Venmo'}
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
            Send Another Treat ✨
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