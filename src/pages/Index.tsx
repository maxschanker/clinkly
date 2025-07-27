import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-background flex flex-col">
      {/* Header */}
      <header className="w-full p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            oowoo
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Main Message */}
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
            Show someone you love them
          </h2>
          
          {/* Emoji with gentle animation */}
          <div className="text-6xl mb-12 animate-bounce-gentle">
            🫶
          </div>
          
          {/* Get Started Button */}
          <Button
            onClick={() => navigate('/send')}
            className="h-16 px-16 text-xl font-semibold rounded-full bg-gradient-primary hover:shadow-glow transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </Button>
        </div>
      </div>
      
      {/* Minimalist Footer */}
      <footer className="w-full p-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            oowoo • 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;