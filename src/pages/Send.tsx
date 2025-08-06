import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit } from "lucide-react";
import { CoverArtModal } from "@/components/CoverArtModal";
import { createTreat, type TreatData } from "@/lib/treatService";
import { useToast } from "@/hooks/use-toast";
import { saveTreatData, cleanupStaleData } from "@/lib/utils";

const Send = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Clean up stale data on component mount
  useEffect(() => {
    cleanupStaleData();
  }, []);
  const [formData, setFormData] = useState({
    headerText: "",
    headerFont: "inter",
    coverArt: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=400&fit=crop", // Default ocean wave
    coverArtType: "poster" as 'photo' | 'gif' | 'poster',
    message: "",
    senderName: "",
    recipientName: "",
    amount: ""
  });
  const [addCash, setAddCash] = useState(false);
  const [showCoverArtModal, setShowCoverArtModal] = useState(false);

  const fontOptions = [
    { id: "inter", name: "Classic", class: "font-sans" },
    { id: "playfair", name: "Electric", class: "font-playfair" },
    { id: "dancing", name: "Fancy", class: "font-dancing" },
    { id: "arial", name: "Simple", class: "font-arial" }
  ];


  const handleSave = async () => {
    if (!formData.senderName || !formData.recipientName) {
      toast({
        title: "Missing Information",
        description: "Please fill in both sender and recipient names.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const treatData: TreatData = {
        header_text: formData.headerText || "Someone sent you a clink",
        font_id: `font-${formData.headerFont}`,
        cover_art_type: formData.coverArtType === 'poster' ? 'image' : formData.coverArtType,
        cover_art_content: formData.coverArt,
        message: formData.message,
        sender_name: formData.senderName,
        recipient_name: formData.recipientName,
        amount: addCash && formData.amount ? parseFloat(formData.amount) : undefined,
        theme: 'gradient-warm',
        treat_type: 'coffee',
        is_public: true
      };

      const result = await createTreat(treatData);
      
      // Save the result for the confirmation page using enhanced storage
      saveTreatData('treatData', {
        ...result.treat,
        shareUrl: result.shareUrl
      });
      
      
      window.scrollTo(0, 0);
      navigate('/send/complete');
    } catch (error) {
      console.error('Error creating treat:', error);
      toast({
        title: "Error",
        description: "Failed to create clink. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverArtSelect = (url: string, type: 'photo' | 'gif' | 'poster') => {
    setFormData({...formData, coverArt: url, coverArtType: type});
    setShowCoverArtModal(false);
  };

  const selectedFont = fontOptions.find(f => f.id === formData.headerFont);


  return (
    <div className="min-h-screen bg-gradient-background">
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

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-2 pb-24">
        {/* Header Input */}
        <div className="mb-8">
          <Input
            value={formData.headerText}
            onChange={(e) => {
              if (e.target.value.length <= 25) {
                setFormData({...formData, headerText: e.target.value});
              }
            }}
            placeholder="Header"
            className={`w-full bg-transparent border-none outline-none placeholder:text-muted-foreground text-center resize-none leading-tight min-h-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${selectedFont?.class} ${
              formData.headerText.length > 20 ? "text-2xl" : 
              formData.headerText.length > 12 ? "text-4xl" : "text-5xl"
            } font-bold h-auto py-2`}
            maxLength={25}
          />
        </div>

        {/* Font Selection */}
        <div className="mb-8">
          <div className="flex gap-2 justify-center flex-wrap">
            {fontOptions.map((font) => (
              <button
                key={font.id}
                onClick={() => setFormData({...formData, headerFont: font.id})}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.headerFont === font.id
                    ? 'bg-primary text-primary-foreground shadow-button'
                    : 'bg-card hover:bg-accent text-foreground border border-border'
                }`}
              >
                <span className={font.class}>{font.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cover Art */}
        <div className="relative mb-8 rounded-3xl overflow-hidden shadow-card">
          {formData.coverArtType === 'gif' ? (
            <img
              src={formData.coverArt}
              alt="Cover art GIF"
              className="w-full h-80 object-cover"
            />
          ) : (
            <img
              src={formData.coverArt}
              alt="Cover art"
              className="w-full h-80 object-cover"
            />
          )}
          <button
            onClick={() => setShowCoverArtModal(true)}
            className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm hover:bg-card text-foreground px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-soft"
          >
            <Edit size={16} />
            Edit
          </button>
        </div>

        {/* Sweet Message Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Sweet message</h2>
          <div className="relative">
            <Textarea
              value={formData.message}
              onChange={(e) => {
                if (e.target.value.length <= 300) {
                  setFormData({...formData, message: e.target.value});
                }
              }}
              placeholder="Hope you have a good week! ❣️"
              className="w-full min-h-[120px] text-lg resize-none border-2 border-border rounded-2xl p-6 bg-card focus:border-primary focus:ring-2 focus:ring-primary/20"
              maxLength={300}
            />
            <div className={`text-sm mt-2 text-right ${
              formData.message.length >= 280 ? 'text-destructive' : 
              formData.message.length >= 250 ? 'text-yellow-600' : 
              'text-muted-foreground'
            }`}>
              {formData.message.length}/300
            </div>
          </div>
        </div>

        {/* Gift Section */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-bold">Gift details</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-lg font-medium mb-2 block">🎁 To:</Label>
              <Input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                placeholder="Their name"
                className="w-full h-12 text-lg border-2 rounded-2xl"
              />
            </div>
            
            <div>
              <Label className="text-lg font-medium mb-2 block">💌 From:</Label>
              <Input
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                placeholder="Your name"
                className="w-full h-12 text-lg border-2 rounded-2xl"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">💸 Add a little cash?</Label>
              <Switch
                checked={addCash}
                onCheckedChange={setAddCash}
              />
            </div>

            {addCash && (
              <div>
                <Label className="text-lg font-medium mb-2 block">💲 Amount ($)</Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg font-medium text-foreground pointer-events-none">
                    $
                  </div>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0"
                    className="w-full h-12 text-lg border-2 rounded-2xl pl-8"
                    min="1"
                    max="500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background to-background/80 backdrop-blur-sm p-6">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-primary hover:shadow-glow transition-all duration-300 border-0 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Cover Art Modal */}
      <CoverArtModal
        open={showCoverArtModal}
        onOpenChange={setShowCoverArtModal}
        onSelect={handleCoverArtSelect}
        currentSelection={formData.coverArt}
      />
    </div>
  );
};

export default Send;