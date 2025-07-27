import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    { id: "inter", name: "Inter", class: "font-sans" },
    { id: "playfair", name: "Playfair Display", class: "font-playfair" },
    { id: "dancing", name: "Dancing Script", class: "font-dancing" },
    { id: "arial", name: "Arial", class: "font-arial" }
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
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8 pb-24">
        {/* Font Selection */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
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
        <div className="mb-8">
          <input
            type="text"
            value={formData.headerText}
            onChange={(e) => setFormData({...formData, headerText: e.target.value})}
            className={`w-full text-5xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground ${selectedFont?.class}`}
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

        {/* Message Box */}
        <div className="mb-8">
          <Textarea
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            placeholder="Write your message here"
            className="w-full min-h-[120px] text-lg resize-none border-2 border-border rounded-2xl p-6 bg-card focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Gift Section */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-2xl">📩</span>
            <span className="text-lg font-medium min-w-[40px]">To</span>
            <Input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
              placeholder="Recipient's name"
              className="flex-1 h-12 text-lg border-2 rounded-2xl"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-2xl">@</span>
            <span className="text-lg font-medium min-w-[40px]"></span>
            <Input
              type="text"
              value={formData.venmoHandle}
              onChange={(e) => setFormData({...formData, venmoHandle: e.target.value})}
              placeholder="Venmo username"
              className="flex-1 h-12 text-lg border-2 rounded-2xl"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-2xl">💰</span>
            <span className="text-lg font-medium min-w-[40px]">$</span>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="Amount"
              className="flex-1 h-12 text-lg border-2 rounded-2xl"
              min="1"
              max="500"
            />
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