import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";

const Send = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    headerText: "Header",
    headerFont: "inter",
    coverArt: "photo-1500375592092-40eb2168fd21", // Default ocean wave
    message: "",
    recipientName: "",
    venmoHandle: "",
    amount: ""
  });

  const fontOptions = [
    { id: "inter", name: "Classic", class: "font-sans" },
    { id: "playfair", name: "Eclectic", class: "font-playfair" },
    { id: "dancing", name: "Fancy", class: "font-dancing" },
    { id: "arial", name: "Simple", class: "font-arial" }
  ];

  const coverArtOptions = [
    "photo-1500375592092-40eb2168fd21", // Ocean wave
    "photo-1465146344425-f00d5f5c8f07", // Orange flowers
    "photo-1500673922987-e212871fec22", // Yellow lights
    "photo-1582562124811-c09040d0a901", // Orange cat
    "photo-1535268647677-300dbf3d78d1", // Grey kitten
    "photo-1488590528505-98d2b5aba04b", // Laptop
    "photo-1487058792275-0ad4aaf24ca7", // Code monitor
    "photo-1649972904349-6e44c42644a7"  // Woman with laptop
  ];

  const handleSave = () => {
    // Save form data to localStorage for demo
    localStorage.setItem('treatData', JSON.stringify(formData));
    navigate('/send/complete');
  };

  const handleCoverArtEdit = () => {
    // Cycle through cover art options for demo
    const currentIndex = coverArtOptions.indexOf(formData.coverArt);
    const nextIndex = (currentIndex + 1) % coverArtOptions.length;
    setFormData({...formData, coverArt: coverArtOptions[nextIndex]});
  };

  const selectedFont = fontOptions.find(f => f.id === formData.headerFont);

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Logo */}
      <div className="max-w-2xl mx-auto px-6 pt-6">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
        >
          oowoo
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8 pb-24">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Header</h2>
          
          {/* Font Selection */}
          <div className="mb-6">
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

          {/* Header Input */}
          <input
            type="text"
            value={formData.headerText}
            onChange={(e) => setFormData({...formData, headerText: e.target.value})}
            className={`w-full text-5xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground text-center ${selectedFont?.class}`}
            placeholder="Header"
          />
        </div>

        {/* Cover Art */}
        <div className="relative mb-8 rounded-3xl overflow-hidden shadow-card">
          <img
            src={`https://images.unsplash.com/${formData.coverArt}?w=800&h=400&fit=crop`}
            alt="Cover art"
            className="w-full h-80 object-cover"
          />
          <button
            onClick={handleCoverArtEdit}
            className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm hover:bg-card text-foreground px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-soft"
          >
            <Edit size={16} />
            Edit
          </button>
        </div>

        {/* Sweet Message Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Sweet message</h2>
          <Textarea
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            placeholder="Hope you have a good week! ❣️"
            className="w-full min-h-[120px] text-lg resize-none border-2 border-border rounded-2xl p-6 bg-card focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Gift Section */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold">Gift</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-lg font-medium mb-2 block">📩 To:</Label>
              <Input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                placeholder="Recipient's name"
                className="w-full h-12 text-lg border-2 rounded-2xl"
              />
            </div>
            
            <div>
              <Label className="text-lg font-medium mb-2 block">Venmo username</Label>
              <Input
                type="text"
                value={formData.venmoHandle}
                onChange={(e) => setFormData({...formData, venmoHandle: e.target.value})}
                placeholder="@username"
                className="w-full h-12 text-lg border-2 rounded-2xl"
              />
            </div>
            
            <div>
              <Label className="text-lg font-medium mb-2 block">Amount</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="$0"
                className="w-full h-12 text-lg border-2 rounded-2xl"
                min="1"
                max="500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background to-background/80 backdrop-blur-sm p-6">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleSave}
            className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-primary hover:shadow-glow transition-all duration-300 border-0"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Send;