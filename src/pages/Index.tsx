import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ClinkLoadingScreen } from "@/components/ClinkLoadingScreen";
import { useState, useEffect } from "react";
import { smartScrollToTop, trackUserScrolling } from "@/lib/scrollUtils";
import { ActivityBar } from "@/components/ActivityBar";
import { HeroCard } from "@/components/HeroCard";
import { StatsSection } from "@/components/StatsSection";
import { TemplatesSection } from "@/components/TemplatesSection";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Clear any lingering edit data when starting fresh
    localStorage.removeItem('editData');
    
    // Track user scrolling to prevent interruptions
    const cleanup = trackUserScrolling();
    
    // Ensure loading screen shows for at least 1 second
    const minLoadingTime = setTimeout(() => {
      setShowLoading(false);
    }, 1000);

    return () => {
      clearTimeout(minLoadingTime);
      cleanup?.();
    };
  }, []);

  // Show loading screen while mobile detection is undefined or during minimum loading time
  if (isMobile === undefined || showLoading) {
    return <ClinkLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Activity Bar */}
      <ActivityBar />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => {
              localStorage.removeItem('editData');
              smartScrollToTop();
            }}
            className="text-2xl font-bold text-gray-900"
          >
            clink
          </button>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
          </nav>
          
          <Button 
            variant="outline"
            onClick={() => {
              localStorage.removeItem('editData');
              smartScrollToTop();
              navigate('/send');
            }}
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Voice messages that
              <br />
              become moments
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Turn your voice into beautiful, shareable experiences that your friends and family will treasure forever.
            </p>
          </div>

          <HeroCard />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <StatsSection />
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <TemplatesSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to create your first clink?
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Join thousands of people sharing meaningful voice messages
          </p>
          <Button
            onClick={() => {
              localStorage.removeItem('editData');
              smartScrollToTop();
              navigate('/send');
            }}
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg font-semibold px-12 py-4 rounded-full h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start creating now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">clink</h3>
              <p className="text-gray-400">
                Voice messages that become moments
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Templates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 clink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;