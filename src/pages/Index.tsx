import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const navigate = useNavigate();

  const steps = [
    { emoji: "💖", title: "Pick a treat", desc: "Coffee, lunch, or custom" },
    { emoji: "✨", title: "Add your message", desc: "Make it personal & sweet" },
    { emoji: "🎁", title: "Send via Venmo", desc: "They'll love the surprise" }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Hero Section */}
      <div className="relative px-4 pt-16 pb-12">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        
        {/* Floating sparkles */}
        <div className="absolute top-20 left-8 text-2xl animate-sparkle">✨</div>
        <div className="absolute top-32 right-12 text-2xl animate-sparkle" style={{animationDelay: '0.5s'}}>💫</div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 text-2xl animate-sparkle" style={{animationDelay: '1s'}}>🌟</div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-md mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Send a treat.
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Make their day.
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            OnMe lets you send small gifts like coffee, lunch, or a hug — with a card they'll actually love.
          </p>
          
          <Button
            onClick={() => navigate('/send')}
            className="h-16 px-8 text-xl font-bold rounded-3xl bg-gradient-primary hover:shadow-glow transition-all duration-300 transform hover:scale-105"
          >
            💖 Send a Treat
          </Button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-4 py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How it works</h2>
          
          <div className="space-y-6">
            {steps.map((step, index) => (
              <Card 
                key={index}
                className="p-6 rounded-3xl bg-gradient-card shadow-card border-0 hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl animate-bounce-gentle" style={{animationDelay: `${index * 0.2}s`}}>
                    {step.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Sample Treats Preview */}
      <div className="px-4 py-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-center mb-6">See the magic ✨</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 rounded-2xl bg-gradient-primary text-white text-center border-0">
              <div className="text-2xl mb-2">☕️</div>
              <div className="font-bold text-sm">$5 for coffee</div>
              <div className="text-xs text-white/80 mt-1">from Sarah</div>
            </Card>
            
            <Card className="p-4 rounded-2xl bg-gradient-secondary text-white text-center border-0">
              <div className="text-2xl mb-2">🥗</div>
              <div className="font-bold text-sm">$10 for lunch</div>
              <div className="text-xs text-white/80 mt-1">from Alex</div>
            </Card>
          </div>
          
          <div className="text-center mt-6">
            <Button
              onClick={() => navigate('/t/demo123')}
              variant="outline"
              className="rounded-2xl border-2 bg-white/70 hover:bg-white"
            >
              👀 See a treat card
            </Button>
          </div>
        </div>
      </div>

      {/* Fun CTA Section */}
      <div className="px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-4xl mb-4 animate-float">🎉</div>
          <h2 className="text-2xl font-bold mb-3">Ready to spread some joy?</h2>
          <p className="text-muted-foreground mb-6">
            Small gestures, big smiles. That's what OnMe is all about.
          </p>
          
          <Button
            onClick={() => navigate('/send')}
            className="h-14 px-8 text-lg font-bold rounded-3xl bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            💫 Send Your First Treat
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-8 text-center">
        <div className="max-w-md mx-auto">
          <p className="text-sm text-muted-foreground">
            Built with love, not money movement 💖
          </p>
          <div className="mt-4 flex justify-center space-x-4 text-xs text-muted-foreground">
            <span>OnMe</span>
            <span>•</span>
            <span>Making treats magical</span>
            <span>•</span>
            <span>✨ Since 2024</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;