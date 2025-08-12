import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[100dvh] bg-gradient-background touch-pan-y overscroll-none">
      {/* Header */}
      <header className="w-full p-4 pb-2 md:p-6 md:pb-2 relative z-10">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
          >
            clink
          </button>
        </div>
      </header>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
          <button 
            onClick={() => {
              window.location.href = '/';
            }}
            className="text-primary hover:text-primary/80 underline font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
