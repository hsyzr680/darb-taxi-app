import { User, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Trip } from "@shared/schema";
import { useUpdateTripStatus } from "@/hooks/use-trips";

interface DriverCardProps {
  trip: Trip;
}

export function DriverCard({ trip }: DriverCardProps) {
  const updateStatus = useUpdateTripStatus();

  const handleAccept = () => {
    updateStatus.mutate({ id: trip.id, status: "accepted" });
  };

  const handleComplete = () => {
    updateStatus.mutate({ id: trip.id, status: "completed" });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-5 shadow-lg mb-4 hover:border-primary/50 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white font-display">New Request</h3>
          <p className="text-sm text-muted-foreground">Estimated Fare</p>
          <p className="text-2xl font-bold text-primary">${(trip.price / 100).toFixed(2)}</p>
        </div>
        <div className="bg-secondary/50 p-2 rounded-lg">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-0.5 h-full bg-border -my-1" />
            <div className="w-3 h-3 rounded-full bg-accent mt-6" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Pickup</p>
              <p className="text-sm font-medium text-white truncate">{trip.pickupAddress}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Dropoff</p>
              <p className="text-sm font-medium text-white truncate">{trip.dropoffAddress}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {trip.status === "pending" && (
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleAccept}
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending ? "Accepting..." : "Accept Ride"}
          </Button>
        )}
        
        {trip.status === "accepted" && (
          <Button 
            className="flex-1"
            onClick={() => updateStatus.mutate({ id: trip.id, status: "in_progress" })}
          >
            Start Ride
          </Button>
        )}

        {trip.status === "in_progress" && (
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleComplete}
          >
            Complete Ride
          </Button>
        )}
      </div>
    </motion.div>
  );
}
