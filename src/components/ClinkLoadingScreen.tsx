import React from 'react';

export const ClinkLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center relative overflow-hidden">
      {/* Sparkle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-32 w-1 h-1 bg-sparkle-2 rounded-full animate-sparkle animation-delay-1000 opacity-70"></div>
        <div className="absolute top-60 right-16 w-1 h-1 bg-sparkle-1 rounded-full animate-sparkle animation-delay-3000 opacity-80"></div>
        <div className="absolute bottom-40 left-32 w-1 h-1 bg-sparkle-3 rounded-full animate-sparkle animation-delay-2000 opacity-60"></div>
        <div className="absolute bottom-60 left-16 w-1 h-1 bg-sparkle-2 rounded-full animate-sparkle animation-delay-4000 opacity-75"></div>
      </div>

      {/* Main Loading Content */}
      <div className="text-center relative z-10">
        {/* Clink Logo/Text */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-pulse">
            clink
          </h1>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-sparkle-1 rounded-full animate-bounce animation-delay-0"></div>
          <div className="w-3 h-3 bg-sparkle-2 rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-3 h-3 bg-sparkle-3 rounded-full animate-bounce animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
};