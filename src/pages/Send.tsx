import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";

const Send = () => {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hiddenMeasureRef = useRef<HTMLDivElement>(null);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState({
    headerText: "",
    headerFont: "inter",
    coverArt: "photo-1500375592092-40eb2168fd21", // Default ocean wave
    message: "",
    recipientName: "",
    venmoHandle: "",
    amount: "",
    senderName: ""
  });

  const fontOptions = [
    { id: "inter", name: "Classic", class: "font-sans" },
    { id: "playfair", name: "Electric", class: "font-playfair" },
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
    // Save form data to localStorage for demo, mapping to expected structure
    const treatData = {
      ...formData,
      recipientHandle: formData.venmoHandle,
      treatType: formData.amount
    };
    localStorage.setItem('treatData', JSON.stringify(treatData));
    navigate('/send/complete');
  };

  const handleCoverArtEdit = () => {
    // Cycle through cover art options for demo
    const currentIndex = coverArtOptions.indexOf(formData.coverArt);
    const nextIndex = (currentIndex + 1) % coverArtOptions.length;
    setFormData({...formData, coverArt: coverArtOptions[nextIndex]});
  };

  const selectedFont = fontOptions.find(f => f.id === formData.headerFont);

  // Enhanced text wrapping detection using hidden duplicate element
  useEffect(() => {
    if (hiddenMeasureRef.current && textareaRef.current) {
      const hiddenElement = hiddenMeasureRef.current;
      const textarea = textareaRef.current;
      
      // Copy styles to hidden element for accurate measurement
      const computedStyle = getComputedStyle(textarea);
      hiddenElement.style.fontSize = computedStyle.fontSize;
      hiddenElement.style.fontFamily = computedStyle.fontFamily;
      hiddenElement.style.fontWeight = computedStyle.fontWeight;
      hiddenElement.style.letterSpacing = computedStyle.letterSpacing;
      hiddenElement.style.width = computedStyle.width;
      hiddenElement.style.padding = computedStyle.padding;
      hiddenElement.style.border = computedStyle.border;
      hiddenElement.style.boxSizing = computedStyle.boxSizing;
      
      // Set text content and measure
      hiddenElement.textContent = formData.headerText || "Header";
      const hiddenHeight = hiddenElement.scrollHeight;
      const lineHeight = parseInt(computedStyle.lineHeight) || 24;
      
      // More accurate multi-line detection
      const isWrapped = hiddenHeight > lineHeight * 1.5;
      setIsMultiLine(isWrapped);
      
      // Update textarea height to fit content (max 2 lines)
      const maxHeight = lineHeight * 2;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(hiddenHeight, maxHeight) + 'px';
    }
  }, [formData.headerText, formData.headerFont]);

  // Handle typing state for placeholder
  const handleHeaderTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 60) {
      setFormData({...formData, headerText: value});
      setIsTyping(value.length > 0);
    }
  };

  // Dynamic font sizing with better breakpoints for multi-line
  const getHeaderFontSize = () => {
    const length = formData.headerText.length;
    if (isMultiLine) {
      // Smaller sizes for multi-line text
      if (length > 40) return "text-xl";
      if (length > 25) return "text-2xl";
      return "text-3xl";
    } else {
      // Original sizes for single line
      if (length > 30) return "text-2xl";
      if (length > 15) return "text-4xl";
      return "text-5xl";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Logo */}
      <div className="max-w-2xl mx-auto px-6 pt-6">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-bold bg-gradient-secondary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          oowoo
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8 pb-24">
        {/* Header Input */}
        <div className={`relative ${isMultiLine ? "mb-6" : "mb-4"}`}>
          {/* Hidden element for accurate text measurement */}
          <div
            ref={hiddenMeasureRef}
            className={`absolute -top-[9999px] left-0 pointer-events-none whitespace-pre-wrap text-center font-bold ${selectedFont?.class} ${getHeaderFontSize()}`}
            aria-hidden="true"
          />
          
          {/* Custom placeholder overlay */}
          {!isTyping && (
            <div 
              className={`absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-center font-bold ${selectedFont?.class} ${getHeaderFontSize()}`}
              style={{ 
                lineHeight: textareaRef.current?.style.lineHeight || 'normal'
              }}
            >
              Header
            </div>
          )}
          
          <Textarea
            ref={textareaRef}
            value={formData.headerText}
            onChange={handleHeaderTextChange}
            className={`w-full bg-transparent border-none outline-none text-center resize-none leading-tight min-h-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${selectedFont?.class} ${getHeaderFontSize()} font-bold`}
            style={{
              wordWrap: "break-word",
              whiteSpace: "pre-wrap",
              overflow: "hidden",
              color: isTyping ? 'inherit' : 'transparent'
            }}
            onFocus={() => setIsTyping(formData.headerText.length > 0)}
            onBlur={() => setIsTyping(formData.headerText.length > 0)}
          />
        </div>

        {/* Font Selection */}
        <div className={`${isMultiLine ? "mb-6" : "mb-8"}`}>
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
              <Label className="text-lg font-medium mb-2 block">👤 Your name</Label>
              <Input
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                placeholder="Your name"
                className="w-full h-12 text-lg border-2 rounded-2xl"
              />
            </div>
            
            <div>
              <Label className="text-lg font-medium mb-2 block">👤 Venmo username</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg text-foreground font-medium z-10">@</span>
                <Input
                  type="text"
                  value={formData.venmoHandle}
                  onChange={(e) => setFormData({...formData, venmoHandle: e.target.value})}
                  placeholder="username"
                  className="w-full h-12 text-lg border-2 rounded-2xl pl-8"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-lg font-medium mb-2 block">💲Amount</Label>
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