import { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { Map } from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useCreateTrip, useTrip } from "@/hooks/use-trips";
import { useLocation as useGeoLocation } from "@/hooks/use-location";
import { Loader2, MapPin, Navigation, Car } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RiderDashboard() {
  const { coords } = useGeoLocation();
  const createTrip = useCreateTrip();
  const [currentTripId, setCurrentTripId] = useState<number | undefined>();
  
  // Polling for the current trip if one is active
  const { data: activeTrip } = useTrip(currentTripId);

  const [stage, setStage] = useState<"pickup" | "dropoff" | "confirm" | "waiting">("pickup");
  const [pickup, setPickup] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    if (stage === "pickup") {
      setPickup({ lat, lng, address: "Selected Location" });
    } else if (stage === "dropoff") {
      setDropoff({ lat, lng, address: "Destination Location" });
    }
  };

  const calculatePrice = () => {
    // Fake pricing algorithm based on simple distance
    if (!pickup || !dropoff) return 0;
    const dist = Math.sqrt(Math.pow(dropoff.lat - pickup.lat, 2) + Math.pow(dropoff.lng - pickup.lng, 2));
    return Math.floor(dist * 100000); // Rough estimate in cents
  };

  const handleBook = async () => {
    if (!pickup || !dropoff) return;
    
    try {
      const trip = await createTrip.mutateAsync({
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        pickupAddress: pickup.address,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        dropoffAddress: dropoff.address,
        price: calculatePrice(),
      });
      setCurrentTripId(trip.id);
      setStage("waiting");
    } catch (e) {
      console.error(e);
    }
  };

  // Markers for the map
  const markers = [];
  if (pickup) markers.push({ position: [pickup.lat, pickup.lng] as [number, number], title: "Pickup", type: "pickup" as const });
  if (dropoff) markers.push({ position: [dropoff.lat, dropoff.lng] as [number, number], title: "Dropoff", type: "dropoff" as const });
  // Add user location marker if available
  if (coords) markers.push({ position: [coords.lat, coords.lng] as [number, number], title: "You", type: "driver" as const });

  return (
    <Layout fullWidth>
      <div className="relative h-full w-full">
        <Map 
          center={coords ? [coords.lat, coords.lng] : undefined}
          markers={markers}
          onLocationSelect={stage === "pickup" || stage === "dropoff" ? handleMapClick : undefined}
          selecting={stage === "pickup" || stage === "dropoff"}
          className="h-full w-full"
        />

        {/* Floating UI Panel */}
        <div className="absolute bottom-0 left-0 right-0 md:top-8 md:left-8 md:right-auto md:w-[400px] md:bottom-auto p-4 z-[500]">
          <AnimatePresence mode="wait">
            {!activeTrip ? (
              <motion.div 
                key="booking-flow"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-2xl"
              >
                <h2 className="text-2xl font-display font-bold text-white mb-6">Where to?</h2>
                
                {/* Steps Visualizer */}
                <div className="flex items-center mb-8 px-2">
                  <div className={`w-3 h-3 rounded-full ${stage === 'pickup' ? 'bg-primary ring-4 ring-primary/20' : 'bg-primary/50'}`} />
                  <div className="flex-1 h-0.5 bg-zinc-800 mx-2" />
                  <div className={`w-3 h-3 rounded-full ${stage === 'dropoff' ? 'bg-primary ring-4 ring-primary/20' : dropoff ? 'bg-primary/50' : 'bg-zinc-700'}`} />
                  <div className="flex-1 h-0.5 bg-zinc-800 mx-2" />
                  <div className={`w-3 h-3 rounded-full ${stage === 'confirm' ? 'bg-primary ring-4 ring-primary/20' : 'bg-zinc-700'}`} />
                </div>

                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border transition-all ${stage === 'pickup' ? 'bg-zinc-900 border-primary' : 'bg-zinc-900/50 border-zinc-800'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs uppercase text-muted-foreground font-semibold">Pickup</label>
                      {stage === 'pickup' && <span className="text-xs text-primary animate-pulse">Select on map</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        {pickup ? (
                          <p className="text-white font-medium">{pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}</p>
                        ) : (
                          <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-white" onClick={() => setStage('pickup')}>Set pickup location</Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border transition-all ${stage === 'dropoff' ? 'bg-zinc-900 border-primary' : 'bg-zinc-900/50 border-zinc-800'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs uppercase text-muted-foreground font-semibold">Dropoff</label>
                      {stage === 'dropoff' && <span className="text-xs text-primary animate-pulse">Select on map</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        {dropoff ? (
                          <p className="text-white font-medium">{dropoff.lat.toFixed(4)}, {dropoff.lng.toFixed(4)}</p>
                        ) : (
                          <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-white" onClick={() => setStage('dropoff')} disabled={!pickup}>
                            {pickup ? "Set destination" : "Enter pickup first"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4">
                    {stage === "pickup" && (
                      <Button className="w-full h-12 text-base" disabled={!pickup} onClick={() => setStage("dropoff")}>
                        Next: Set Destination
                      </Button>
                    )}
                    {stage === "dropoff" && (
                      <Button className="w-full h-12 text-base" disabled={!dropoff} onClick={() => setStage("confirm")}>
                        Review Ride
                      </Button>
                    )}
                    {stage === "confirm" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl">
                          <span className="text-muted-foreground">Total Estimate</span>
                          <span className="text-2xl font-bold text-white">${(calculatePrice() / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1 h-12" onClick={() => setStage("dropoff")}>Back</Button>
                          <Button className="flex-[2] h-12 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleBook} disabled={createTrip.isPending}>
                            {createTrip.isPending ? <Loader2 className="animate-spin" /> : "Confirm & Book Ride"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="trip-active"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-display font-bold text-white">Current Ride</h2>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeTrip.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    activeTrip.status === 'in_progress' ? 'bg-green-500/20 text-green-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {activeTrip.status.replace('_', ' ')}
                  </div>
                </div>

                {activeTrip.status === "pending" && (
                  <div className="flex flex-col items-center py-8 space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                      <div className="relative bg-zinc-900 p-4 rounded-full border border-zinc-800">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    </div>
                    <p className="text-center text-muted-foreground">Looking for nearby drivers...</p>
                  </div>
                )}

                {activeTrip.status === "accepted" && (
                  <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl">
                    <div className="bg-zinc-800 p-3 rounded-full">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Driver is on the way!</p>
                      <p className="text-sm text-muted-foreground">Arriving in ~5 mins</p>
                    </div>
                  </div>
                )}

                {activeTrip.status === "in_progress" && (
                   <div className="text-center py-4">
                     <p className="text-2xl font-bold text-white animate-pulse">En Route</p>
                     <p className="text-muted-foreground">Sit back and relax.</p>
                   </div>
                )}

                <div className="space-y-2 text-sm">
                   <div className="flex justify-between text-muted-foreground">
                     <span>Pickup</span>
                     <span className="text-white font-medium">{pickup?.lat.toFixed(3)}, {pickup?.lng.toFixed(3)}</span>
                   </div>
                   <div className="flex justify-between text-muted-foreground">
                     <span>Dropoff</span>
                     <span className="text-white font-medium">{dropoff?.lat.toFixed(3)}, {dropoff?.lng.toFixed(3)}</span>
                   </div>
                </div>

                {['completed', 'cancelled'].includes(activeTrip.status) && (
                  <Button className="w-full" onClick={() => {
                    setCurrentTripId(undefined);
                    setStage("pickup");
                    setPickup(null);
                    setDropoff(null);
                  }}>
                    Book New Ride
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
