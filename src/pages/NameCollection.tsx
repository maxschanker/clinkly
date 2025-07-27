import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const NameCollection = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    // Get the phone number from previous step
    const tempPhone = sessionStorage.getItem('tempPhone');
    if (!tempPhone) {
      // If no phone number, redirect to phone collection
      navigate('/collect-phone');
      return;
    }
    setPhone(tempPhone);
  }, [navigate]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Combine name and phone number
    const userData = {
      name: values.name,
      phone: phone
    };
    
    // Store complete user data
    sessionStorage.setItem('userData', JSON.stringify(userData));
    
    // Add to existing users (simulate backend)
    const existingUsers = JSON.parse(sessionStorage.getItem('existingUsers') || '[]');
    existingUsers.push(phone);
    sessionStorage.setItem('existingUsers', JSON.stringify(existingUsers));
    
    // Clean up temp storage
    sessionStorage.removeItem('tempPhone');
    
    // Navigate to send page
    navigate('/send');
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
              What should we call you? ✨
            </CardTitle>
            <p className="text-muted-foreground">
              Just your first name is perfect
            </p>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                
                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-primary hover:shadow-glow transition-all duration-300 border border-white/20"
                >
                  Let's start sending treats! 🚀
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

export default NameCollection;