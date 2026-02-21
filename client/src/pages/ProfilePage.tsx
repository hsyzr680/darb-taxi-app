import { Layout } from "@/components/ui/Layout";
import { useAuth } from "@/hooks/use-auth";
import { User, Shield, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-display font-bold text-white">My Profile</h1>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-zinc-800 to-zinc-900 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-24 h-24 rounded-full bg-zinc-950 border-4 border-zinc-950 flex items-center justify-center text-zinc-500">
                 <User className="w-10 h-10" />
              </div>
            </div>
          </div>
          
          <div className="pt-12 pb-8 px-8">
            <div className="flex justify-between items-start">
               <div>
                 <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
                 <p className="text-muted-foreground capitalize">{user?.role}</p>
               </div>
               <Button variant="outline">Edit Profile</Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-center">
                <div className="flex justify-center mb-2 text-primary">
                  <Star className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-white">4.9</div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-center">
                <div className="flex justify-center mb-2 text-blue-500">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-white">Verified</div>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-center">
                <div className="flex justify-center mb-2 text-purple-500">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-white">2y</div>
                <div className="text-xs text-muted-foreground">Member Since</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h3 className="text-lg font-bold text-white mb-4">Account Settings</h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                <span className="text-zinc-300">Email Notifications</span>
                <span className="text-sm text-primary">Enabled</span>
             </div>
             <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                <span className="text-zinc-300">Two-Factor Auth</span>
                <span className="text-sm text-muted-foreground">Disabled</span>
             </div>
             <div className="flex items-center justify-between py-3">
                <span className="text-destructive">Delete Account</span>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
