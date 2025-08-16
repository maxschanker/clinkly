import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import QRCode from 'react-qr-code';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-background flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold text-text-primary mb-4">
              clink
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              This experience is designed for mobile. Scan the QR code below or visit on your phone.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-card mb-8 inline-block">
            <QRCode value="https://clink.ly" size={200} />
          </div>
          
          <p className="text-text-muted">
            Or visit <span className="text-primary font-semibold">clink.ly</span> on your mobile device
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-text-primary">clink</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/send')}
          className="text-text-primary border-border"
        >
          Sign up
        </Button>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-24">
        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-5xl font-bold text-text-primary mb-4 leading-tight">
            The simplest way to
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              build software
            </span>
          </h1>
          
          <p className="text-lg text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
            Develop, deploy, and scale applications visually with our AI-powered low-code platform.
          </p>

          <Button 
            onClick={() => navigate('/send')}
            className="bg-gradient-button text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-button hover:shadow-lg transition-all duration-300"
          >
            Get started free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>

        {/* Featured Product Showcase */}
        <section className="py-8">
          <div className="bg-gradient-card rounded-2xl p-6 shadow-card border border-white/20">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Featured Template
              </div>
              
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                E-commerce Dashboard
              </h3>
              
              <p className="text-text-secondary mb-6">
                Complete analytics dashboard with real-time data visualization and inventory management.
              </p>
            </div>

            {/* Mock Dashboard Preview */}
            <div className="bg-white/80 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg"></div>
                  <div>
                    <div className="w-20 h-3 bg-text-muted/20 rounded"></div>
                    <div className="w-16 h-2 bg-text-muted/10 rounded mt-1"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-text-muted/10 rounded"></div>
                  <div className="w-6 h-6 bg-text-muted/10 rounded"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gradient-primary/10 p-3 rounded-lg">
                  <div className="w-12 h-2 bg-primary/30 rounded mb-2"></div>
                  <div className="text-xl font-bold text-text-primary">$24.5k</div>
                  <div className="text-xs text-text-secondary">Revenue</div>
                </div>
                <div className="bg-gradient-primary/10 p-3 rounded-lg">
                  <div className="w-12 h-2 bg-primary/30 rounded mb-2"></div>
                  <div className="text-xl font-bold text-text-primary">1,234</div>
                  <div className="text-xs text-text-secondary">Orders</div>
                </div>
                <div className="bg-gradient-primary/10 p-3 rounded-lg">
                  <div className="w-12 h-2 bg-primary/30 rounded mb-2"></div>
                  <div className="text-xl font-bold text-text-primary">89%</div>
                  <div className="text-xs text-text-secondary">Growth</div>
                </div>
              </div>
              
              <div className="h-20 bg-gradient-primary/5 rounded-lg flex items-end gap-1 p-2">
                <div className="w-3 bg-primary h-8 rounded-sm"></div>
                <div className="w-3 bg-primary/70 h-12 rounded-sm"></div>
                <div className="w-3 bg-primary h-16 rounded-sm"></div>
                <div className="w-3 bg-primary/80 h-10 rounded-sm"></div>
                <div className="w-3 bg-primary h-14 rounded-sm"></div>
                <div className="w-3 bg-primary/60 h-8 rounded-sm"></div>
                <div className="w-3 bg-primary h-18 rounded-sm"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-secondary rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-accent rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm text-text-secondary">+2.3k users</span>
              </div>
              
              <Button 
                size="sm"
                onClick={() => navigate('/send')}
                className="bg-gradient-button text-white px-4 py-2 rounded-lg shadow-button"
              >
                Use template
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Ready to build something amazing?
          </h2>
          
          <p className="text-text-secondary mb-8">
            Join thousands of developers building the future with visual development.
          </p>

          <Button 
            onClick={() => navigate('/send')}
            size="lg"
            className="bg-gradient-button text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-button hover:shadow-lg transition-all duration-300"
          >
            Start building for free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Index;