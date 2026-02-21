import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Car, Loader2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await login.mutateAsync({
        username: formData.get("username") as string,
        password: formData.get("password") as string,
      });
    } catch (error) {
      // Error handled by hook/toast usually, but we could add local error state
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await register.mutateAsync({
        username: formData.get("username") as string,
        password: formData.get("password") as string,
        role: formData.get("role") as "rider" | "driver",
      });
    } catch (error) {
      // Error handled
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 bg-zinc-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        {/* City night driving */}
        
        <div className="relative z-10 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
              Your ride, <br/>
              <span className="text-primary">reimagined.</span>
            </h1>
            <p className="text-xl text-gray-400">
              Experience the future of transportation. Whether you're driving or riding, we get you there in style.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center gap-2 mb-2">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-display font-bold text-white">TaxiApp</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-6">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Enter your details to access your account</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" placeholder="john_doe" required className="bg-zinc-900/50 border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required className="bg-zinc-900/50 border-zinc-800" />
                </div>
                
                {login.error && (
                  <p className="text-sm text-destructive">{login.error.message}</p>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={login.isPending}
                >
                  {login.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Username</Label>
                  <Input id="reg-username" name="username" placeholder="Choose a username" required className="bg-zinc-900/50 border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input id="reg-password" name="password" type="password" required className="bg-zinc-900/50 border-zinc-800" />
                </div>
                
                <div className="space-y-2">
                  <Label>I want to be a...</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input type="radio" id="role-rider" name="role" value="rider" className="peer sr-only" defaultChecked />
                      <label htmlFor="role-rider" className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-zinc-800 bg-zinc-900/30 cursor-pointer transition-all peer-checked:border-primary peer-checked:bg-primary/10 hover:border-zinc-700">
                        <MapPin className="h-6 w-6 mb-2 text-muted-foreground peer-checked:text-primary" />
                        <span className="text-sm font-medium">Rider</span>
                      </label>
                    </div>
                    <div className="relative">
                      <input type="radio" id="role-driver" name="role" value="driver" className="peer sr-only" />
                      <label htmlFor="role-driver" className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-zinc-800 bg-zinc-900/30 cursor-pointer transition-all peer-checked:border-primary peer-checked:bg-primary/10 hover:border-zinc-700">
                        <Car className="h-6 w-6 mb-2 text-muted-foreground peer-checked:text-primary" />
                        <span className="text-sm font-medium">Driver</span>
                      </label>
                    </div>
                  </div>
                </div>

                {register.error && (
                  <p className="text-sm text-destructive">{register.error.message}</p>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={register.isPending}
                >
                  {register.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
