import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Main Content */}
      <div className="text-center max-w-lg mx-auto">
        {/* App Name */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">oowoo</h1>
        </div>
        
        {/* Main Message */}
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
          Show someone you love them 🫶
        </h2>
        
        {/* Get Started Button */}
        <Button
          onClick={() => navigate('/send')}
          className="h-14 px-12 text-lg font-semibold rounded-full"
        >
          Get Started
        </Button>
      </div>
      
      {/* Simple Footer */}
      <footer className="absolute bottom-8 text-center">
        <p className="text-sm text-muted-foreground">
          oowoo • 2024
        </p>
      </footer>
    </div>
  );
};

export default Index;