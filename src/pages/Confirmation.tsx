import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { recordShare } from "@/lib/treatService";
import { loadTreatData, clearAllTreatData, saveTreatData } from "@/lib/utils";

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

  // Add cleanup on page unload/reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only clear if we have completed the flow
      if (stepCompleted.share && stepCompleted.venmo) {
        clearAllTreatData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [stepCompleted.share, stepCompleted.venmo]);
  
  const allStepsComplete = stepCompleted.share && stepCompleted.venmo;

  // Clear data when flow is completed
  useEffect(() => {
    if (allStepsComplete) {
      console.log('🎉 All steps completed, scheduling data cleanup');
      // Small delay to ensure UI updates complete
      const timeoutId = setTimeout(() => {
        clearAllTreatData();
        console.log('🧹 Treat data cleared after successful completion');
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [allStepsComplete]);

  useEffect(() => {
    // Use enhanced storage system to load treat data
    const data = loadTreatData('treatData');
    if (data) {
      console.log('✅ Loaded fresh treat data from enhanced storage');
      setTreatData(data);
      
      // Set the slug from the backend response
      if (data.slug) {
        setTreatSlug(data.slug);
      }
    } else {
      console.log('❌ No valid treat data found, redirecting to send page');
      navigate('/send');
    }

    // Cleanup function to clear data when component unmounts or completes
    return () => {
      // Clear data if both steps are completed
      if (stepCompleted.share && stepCompleted.venmo) {
        console.log('🧹 Cleaning up completed treat data');
        clearAllTreatData();
      }
    };
  }, [navigate, stepCompleted.share, stepCompleted.venmo]);

  const getTreatEmoji = (type: string) => {
    return "✨";
  };

  const getTreatDescription = (type: string) => {
    switch (type) {
      case "5": return "coffee";
      case "10": return "lunch";
      default: return "clink";
    }
  };

  const generateVenmoMessage = () => {
    if (!treatData) return "";
    const emoji = getTreatEmoji(treatData.treat_type || treatData.treatType);
    const message = treatData.header_text || treatData.headerText || getTreatDescription(treatData.treat_type || treatData.treatType) + " on me";
    return `${message} ${emoji} sent you a clink 💌`;
  };

  const shareClinkOnly = async () => {
    if (!treatData || !treatSlug) {
      toast({
        title: "Error",
        description: "Clink data not available"
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

    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'clink',
          text: message,
          url: shareUrl
        });
        setStepCompleted(prev => ({ ...prev, share: true, venmo: true })); // Mark both as complete since no Venmo needed
      } catch (err) {
        console.log('Share cancelled or failed');
        return;
      }
    } else {
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(`${message} ${shareUrl}`);
        setStepCompleted(prev => ({ ...prev, share: true, venmo: true })); // Mark both as complete since no Venmo needed
        
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
  };

  const shareClinkAndPromptVenmo = async () => {
    if (!treatData || !treatSlug) {
      toast({
        title: "Error",
        description: "Clink data not available"
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
          title: 'clink',
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
    const timestamp = Date.now();
    
    // Try venmo:// scheme instead of https to potentially avoid web caching
    const venmoUrl = `venmo://paycharge?txn=pay&audience=public&amount=${amount}&note=${encodeURIComponent(note)}&ts=${timestamp}`;
    
    try {
      // Open Venmo with the transaction
      window.open(venmoUrl, '_blank');
      setStepCompleted(prev => ({ ...prev, venmo: true }));
      setShowVenmoModal(false);
      
      // Clear Venmo cache after a delay to prevent parameter persistence
      setTimeout(() => {
        try {
          // Open a "neutral" Venmo link with empty parameters to overwrite cache
          const neutralUrl = 'venmo://paycharge?amount=&note=';
          const hiddenWindow = window.open(neutralUrl, '_blank');
          // Close it immediately so user doesn't see it
          if (hiddenWindow) {
            setTimeout(() => hiddenWindow.close(), 100);
          }
        } catch (cleanupError) {
          // Silently fail - cache clearing is optional
          console.log('Cache cleanup failed:', cleanupError);
        }
      }, 3000);
      
    } catch (error) {
      // Fallback to https scheme if venmo:// fails
      try {
        const fallbackUrl = `https://venmo.com/?txn=pay&audience=public&amount=${amount}&note=${encodeURIComponent(note)}&ts=${timestamp}`;
        window.open(fallbackUrl, '_blank');
        setStepCompleted(prev => ({ ...prev, venmo: true }));
        setShowVenmoModal(false);
      } catch (fallbackError) {
        toast({
          title: "Can't open Venmo",
          description: "Please open Venmo manually to send the payment.",
          duration: 5000,
        });
      }
    }
  };

  const handleCopyLink = async () => {
    if (!treatData || !treatSlug) {
      toast({
        title: "Error",
        description: "Clink data not available"
      });
      return;
    }

    // Use the shareUrl from backend if available, otherwise construct it
    const shareUrl = treatData.shareUrl || `${window.location.origin}/t/${treatSlug}`;
    
    console.log('🔗 Copying link:', shareUrl);
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Mark both steps as complete since copying the link indicates user satisfaction
      setStepCompleted(prev => ({ ...prev, share: true, venmo: true }));
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
      voice_memo_url: treatData.voice_memo_url,
      slug: treatSlug,
      createdAt: new Date().toISOString()
    };
    
    saveTreatData('currentTreat', previewData, true); // Mark as preview
    window.scrollTo(0, 0);
    navigate(`/t/${treatSlug}?preview=true`); // Navigate with preview parameter
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
            {allStepsComplete ? 'Your clink is on its way!' : 'Your clink is wrapped and ready to go'}
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
            <h3 className="text-lg font-bold mb-3">Deliver your clink!</h3>
            {treatData.amount ? (
              <Button
                onClick={shareClinkAndPromptVenmo}
                className="w-full h-12 text-base font-bold rounded-2xl bg-gradient-primary hover:shadow-glow"
              >
                📨 Send your clink + Venmo
              </Button>
            ) : (
              <Button
                onClick={shareClinkOnly}
                className="w-full h-12 text-base font-bold rounded-2xl bg-gradient-primary hover:shadow-glow"
              >
                📨 Send your clink
              </Button>
            )}
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
        <div className="mt-8 text-center">
          {allStepsComplete ? (
            <Button
              variant="outline"
              onClick={() => {
                window.scrollTo(0, 0);
                navigate('/');
              }}
              className="border-border bg-background hover:bg-accent hover:text-accent-foreground"
            >
              Send another clink ✨
            </Button>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={() => {
                  // Transform backend data back to frontend format for editing
                  const editData = {
                    headerText: treatData.header_text || '',
                    headerFont: treatData.font_id?.replace('font-', '') || 'inter',
                    coverArt: treatData.cover_art_content || '',
                    coverArtType: treatData.cover_art_type === 'image' ? 'poster' : treatData.cover_art_type,
                    message: treatData.message || '',
                    senderName: treatData.sender_name || '',
                    recipientName: treatData.recipient_name || '',
                    amount: treatData.amount?.toString() || ''
                  };
                  
                  // Save the edit data and voice memo info
                  saveTreatData('editData', {
                    ...editData,
                    voiceMemoUrl: treatData.voice_memo_url,
                    addCash: !!treatData.amount
                  });
                  
                  window.scrollTo(0, 0);
                  navigate('/send');
                }}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                ← Back to Edit
              </Button>
            </div>
          )}
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