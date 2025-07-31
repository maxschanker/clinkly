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

  const copyMessage = async () => {
    const message = generateVenmoMessage();
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "Copied! 📋",
        description: "Message copied to clipboard"
      });
    } catch (err) {
      toast({
        title: "Oops!",
        description: "Couldn't copy message"
      });
    }
  };

  const openVenmo = () => {
    if (!treatData) return;
    const amount = treatData.treatType === "custom" ? "25" : treatData.treatType;
    const note = generateVenmoMessage();
    const venmoUrl = `venmo://paycharge?txn=pay&recipients=${treatData.recipientHandle}&amount=${amount}&note=${encodeURIComponent(note)}`;
    window.open(venmoUrl, '_blank');
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

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-md mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6 pt-12">
          <div className="text-6xl mb-4 animate-bounce-gentle">🎉</div>
          <h1 className="text-3xl font-bold mb-2">You made someone's day!</h1>
          <p className="text-muted-foreground">Your oowoo is wrapped and ready to go</p>
        </div>

        {/* Envelope Card */}
        <Card className="p-6 mb-4 bg-gradient-card shadow-card rounded-3xl border-0 relative">
          <div className="text-center">
            <div className="text-5xl mb-4">💌</div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">To: <span className="font-semibold text-foreground">{treatData.recipientHandle}</span></p>
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
            <div className="space-y-3">
              <Button
                onClick={copyMessage}
                className="w-full h-12 text-base font-bold rounded-2xl bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                📤 Send It
              </Button>
              <Button
                onClick={async () => {
                  const link = `${window.location.origin}/t/${treatSlug}`;
                  try {
                    await navigator.clipboard.writeText(link);
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
                }}
                variant="outline"
                className="w-full h-12 rounded-2xl border-2 border-primary/30 bg-white/70 hover:bg-primary/10"
              >
                🔗 Copy Link
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-center">Step 2: Send the $$ with Venmo</h3>
            <Button
              onClick={openVenmo}
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 border-primary/30 bg-white/70 hover:bg-primary/10"
            >
              💜 Open Venmo
            </Button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 text-center space-y-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/send')}
            className="text-muted-foreground hover:text-foreground"
          >
            Send Another Treat ✨
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
    </div>
  );
};

export default Confirmation;