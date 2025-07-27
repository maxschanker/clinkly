import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),
});

const Index = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Store user data in sessionStorage for use in Send page
    sessionStorage.setItem('userData', JSON.stringify(values));
    setIsModalOpen(false);
    navigate('/send');
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col relative overflow-hidden">
      {/* Sparkle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-32 w-1 h-1 bg-sparkle-2 rounded-full animate-sparkle animation-delay-1000 opacity-70"></div>
        <div className="absolute top-60 right-16 w-1 h-1 bg-sparkle-1 rounded-full animate-sparkle animation-delay-3000 opacity-80"></div>
      </div>

      {/* Header */}
      <header className="w-full p-4 md:p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-secondary bg-clip-text text-transparent drop-shadow-sm">
            oowoo
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8 md:pt-12 pb-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          {/* Card Container */}
          <div className="bg-gradient-card p-12 rounded-3xl shadow-card backdrop-blur-sm border border-white/20">
            {/* Main Message */}
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight animate-fade-in">
              Show someone you love them
            </h2>
            
            {/* Emoji with glow effect */}
            <div className="relative mb-6">
              <div className="text-7xl animate-bounce-gentle relative">
                🫶
                <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-30 animate-pulse"></div>
              </div>
            </div>
            
            {/* Get Started Button */}
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-16 px-16 text-xl font-semibold rounded-full bg-gradient-primary hover:shadow-glow transition-all duration-500 transform hover:scale-110 hover:rotate-1 shadow-button border border-white/20"
            >
              Get Started
            </Button>
            
            {/* Decorative elements */}
            <div className="flex justify-center space-x-4 mt-8 opacity-60">
              <div className="w-2 h-2 bg-sparkle-1 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-sparkle-2 rounded-full animate-pulse animation-delay-500"></div>
              <div className="w-2 h-2 bg-sparkle-3 rounded-full animate-pulse animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Minimalist Footer */}
      <footer className="w-full p-4 md:p-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            oowoo • 2024
          </p>
        </div>
      </footer>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-card border border-white/20 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-foreground">
              Let's get started! ✨
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Your Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                        className="h-12 text-base bg-background/80 border-white/20 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your phone number"
                        type="tel"
                        {...field}
                        className="h-12 text-base bg-background/80 border-white/20 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-primary hover:shadow-glow transition-all duration-300 border border-white/20"
              >
                Let's go! 🚀
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;