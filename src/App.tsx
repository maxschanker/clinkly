import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PhoneCollection from "./pages/PhoneCollection";
import NameCollection from "./pages/NameCollection";
import Send from "./pages/Send";
import Confirmation from "./pages/Confirmation";
import Treat from "./pages/Treat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/collect-phone" element={<PhoneCollection />} />
          <Route path="/collect-name" element={<NameCollection />} />
          <Route path="/send" element={<Send />} />
          <Route path="/send/complete" element={<Confirmation />} />
          <Route path="/done" element={<Confirmation />} />
          <Route path="/t/:slug" element={<Treat />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
