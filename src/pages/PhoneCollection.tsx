import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),
});

const PhoneCollection = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    // Simulate checking if phone number exists
    // In a real app, this would be an API call
    const existingUsers = JSON.parse(sessionStorage.getItem('existingUsers') || '[]');
    const phoneExists = existingUsers.includes(values.phone);
    
    if (phoneExists) {
      // Phone exists, get existing user data and go to send page
      const userData = { phone: values.phone, name: 'Existing User' }; // In real app, fetch from backend
      sessionStorage.setItem('userData', JSON.stringify(userData));
      navigate('/send');
    } else {
      // New phone number, store it and go to name collection
      sessionStorage.setItem('tempPhone', values.phone);
      navigate('/collect-name');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col relative overflow-hidden">
      {/* Animated background sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="p-6 relative z-10">
        <h1 className="text-3xl font-bold text-center text-white/90">
          oowoo
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <Card className="w-full max-w-md bg-gradient-card border border-white/20 backdrop-blur-sm shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              What's your number? 📱
            </CardTitle>
            <p className="text-muted-foreground">
              We'll use this to send your special treats
            </p>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  disabled={isLoading}
                  className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-primary hover:shadow-glow transition-all duration-300 border border-white/20"
                >
                  {isLoading ? "Checking..." : "Continue ✨"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center relative z-10">
        <p className="text-white/60 text-sm">
          Send treats, spread joy 💝
        </p>
      </footer>
    </div>
  );
};

export default PhoneCollection;