import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { smartScrollToTop } from "@/lib/scrollUtils";

export const HeroCard = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl p-12 text-white text-center max-w-3xl mx-auto">
      {/* Trending Badge */}
      <div className="absolute top-6 left-6">
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-3 py-1">
          ✨ TRENDING
        </Badge>
      </div>
      
      {/* Sparkle Icon */}
      <div className="absolute top-6 right-6 text-2xl">
        ✨
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Turn your voice
          <br />
          into a moment
        </h1>
        
        <p className="text-xl opacity-90 max-w-md mx-auto">
          Send voice messages that turn into beautiful, shareable moments
        </p>

        <Button
          onClick={() => {
            localStorage.removeItem('editData');
            smartScrollToTop();
            navigate('/send');
          }}
          className="bg-white text-purple-600 hover:bg-gray-100 text-lg font-semibold px-8 py-4 rounded-full h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Create your clink
        </Button>
      </div>
    </div>
  );
};