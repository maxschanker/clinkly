import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const Send = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    senderName: "",
    recipientHandle: "",
    treatType: "5",
    message: "",
    theme: "primary"
  });

  const treatOptions = [
    { value: "5", label: "$5", emoji: "☕️", description: "coffee" },
    { value: "10", label: "$10", emoji: "🥗", description: "lunch" },
    { value: "custom", label: "Custom", emoji: "💝", description: "surprise" }
  ];

  const themes = [
    { id: "primary", name: "Sparkle Pink", bg: "bg-gradient-primary" },
    { id: "secondary", name: "Sunny Yellow", bg: "bg-gradient-secondary" },
    { id: "card", name: "Soft Cloud", bg: "bg-gradient-card" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save form data to localStorage for demo
    localStorage.setItem('treatData', JSON.stringify(formData));
    navigate('/send/complete');
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold mb-2">Send a Treat 🎁</h1>
          <p className="text-muted-foreground">Make someone's day with a little surprise</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sender Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Your name</label>
            <Input
              type="text"
              placeholder="Your beautiful name ✨"
              value={formData.senderName}
              onChange={(e) => setFormData({...formData, senderName: e.target.value})}
              className="rounded-2xl border-2 h-12"
              required
            />
          </div>

          {/* Recipient Handle */}
          <div>
            <label className="text-sm font-medium mb-2 block">Send to</label>
            <Input
              type="text"
              placeholder="@username (Venmo or CashApp)"
              value={formData.recipientHandle}
              onChange={(e) => setFormData({...formData, recipientHandle: e.target.value})}
              className="rounded-2xl border-2 h-12"
              required
            />
          </div>

          {/* Treat Type */}
          <div>
            <label className="text-sm font-medium mb-3 block">Pick a treat</label>
            <div className="grid grid-cols-3 gap-3">
              {treatOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`p-4 cursor-pointer transition-all border-2 rounded-2xl ${
                    formData.treatType === option.value
                      ? 'border-primary bg-primary/10 shadow-glow'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({...formData, treatType: option.value})}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="font-bold text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          {formData.treatType === "custom" && (
            <div>
              <Input
                type="number"
                placeholder="$25"
                className="rounded-2xl border-2 h-12"
                min="1"
                max="100"
              />
            </div>
          )}

          {/* Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">Sweet message</label>
            <Textarea
              placeholder="congrats on the new job! 🎉"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="rounded-2xl border-2 min-h-[80px] resize-none"
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {formData.message.length}/100 characters
            </div>
          </div>

          {/* Card Theme */}
          <div>
            <label className="text-sm font-medium mb-3 block">Choose a vibe</label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`relative cursor-pointer transition-all rounded-2xl overflow-hidden ${
                    formData.theme === theme.id ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  onClick={() => setFormData({...formData, theme: theme.id})}
                >
                  <div className={`h-16 ${theme.bg}`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-medium text-sm drop-shadow-lg">
                      {theme.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-primary hover:shadow-glow transition-all duration-300 border-0"
          >
            Continue to Send 🎁
          </Button>
        </form>

        {/* Back button */}
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="w-full mt-4 rounded-2xl border-2"
        >
          ← Back to Home
        </Button>
      </div>
    </div>
  );
};

export default Send;