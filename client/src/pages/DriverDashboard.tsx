import { Layout } from "@/components/ui/Layout";
import { Map } from "@/components/Map";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DriverCard } from "@/components/DriverCard";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "@/hooks/use-location";
import { useActiveTrips } from "@/hooks/use-trips";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { coords, toggleAvailability } = useLocation();
  const { data: activeTrips, isLoading: loadingTrips } = useActiveTrips();
  
  // Local optimistic state for immediate UI feedback
  const [isOnline, setIsOnline] = useState(user?.isAvailable ?? false);

  const handleToggle = (checked: boolean) => {
    setIsOnline(checked);
    toggleAvailability.mutate(checked);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Left Column: Status & Trips List */}
        <div className="lg:col-span-1 flex flex-col h-full gap-6">
          {/* Status Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-white">Driver Status</h2>
                <p className="text-sm text-muted-foreground">{isOnline ? "You are online and visible" : "You are offline"}</p>
              </div>
              <div className={`p-3 rounded-full ${isOnline ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-500'}`}>
                <Zap className="w-6 h-6" fill={isOnline ? "currentColor" : "none"} />
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <Switch id="online-mode" checked={isOnline} onCheckedChange={handleToggle} />
              <Label htmlFor="online-mode" className="font-medium cursor-pointer">
                {isOnline ? "Accepting Rides" : "Offline Mode"}
              </Label>
            </div>
          </div>

          {/* Active Trips Feed */}
          <div className="flex-1 bg-zinc-900/20 border border-border rounded-2xl p-4 overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 px-2">Nearby Requests</h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {!isOnline ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p>Go online to see requests</p>
                </div>
              ) : loadingTrips ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : activeTrips && activeTrips.length > 0 ? (
                activeTrips.map(trip => (
                  <DriverCard key={trip.id} trip={trip} />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                  <p>No active ride requests nearby.</p>
                  <p className="text-xs mt-2">We'll notify you when one appears.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Map */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-3xl overflow-hidden border border-border shadow-2xl relative min-h-[400px]">
          <Map 
            center={coords ? [coords.lat, coords.lng] : undefined}
            markers={coords ? [{ position: [coords.lat, coords.lng], title: "You", type: "driver" }] : []}
          />
          {/* Overlay info */}
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-xs font-mono text-white/70 border border-white/10 z-[400]">
            GPS: {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Locating..."}
          </div>
        </div>
      </div>
    </Layout>
  );
}
