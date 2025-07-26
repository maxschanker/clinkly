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
        <div className="text-center mb-8 pt-12">
          <div className="text-6xl mb-4 animate-bounce-gentle">🎉</div>
          <h1 className="text-3xl font-bold mb-2">Your treat is ready!</h1>
          <p className="text-muted-foreground">Time to spread some joy</p>
        </div>

        {/* Treat Preview Card */}
        <Card className="p-6 mb-6 bg-gradient-card shadow-card rounded-3xl border-0">
          <div className="text-center">
            <div className="text-4xl mb-3">{getTreatEmoji(treatData.treatType)}</div>
            <h3 className="font-bold text-lg mb-2">
              ${treatData.treatType === "custom" ? "25" : treatData.treatType} for {getTreatDescription(treatData.treatType)}
            </h3>
            <p className="text-muted-foreground mb-4">
              From {treatData.senderName} to {treatData.recipientHandle}
            </p>
            {treatData.message && (
              <div className="bg-white/50 rounded-2xl p-3 text-sm">
                "{treatData.message}"
              </div>
            )}
          </div>
        </Card>

        {/* Generated Message */}
        <Card className="p-4 mb-6 rounded-2xl border-2 border-primary/20 bg-primary/5">
          <div className="text-sm text-muted-foreground mb-2">Copy this for Venmo:</div>
          <div className="font-mono text-sm bg-white/70 rounded-xl p-3 break-all">
            {generateVenmoMessage()}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={copyMessage}
            className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            📋 Copy Message
          </Button>

          <Button
            onClick={openVenmo}
            variant="outline"
            className="w-full h-12 rounded-2xl border-2 border-primary/30 bg-white/70 hover:bg-primary/10"
          >
            💜 Open Venmo
          </Button>

          <Button
            onClick={previewTreat}
            variant="outline"
            className="w-full h-12 rounded-2xl border-2"
          >
            👀 Preview Treat
          </Button>
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