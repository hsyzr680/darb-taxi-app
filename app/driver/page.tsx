"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/Layout/AppHeader";
import { RideCard } from "@/components/Ride/RideCard";
import { RideChat } from "@/components/Chat/RideChat";
import { TimeAnalyticsCard } from "@/components/Ride/TimeAnalyticsCard";
import { RejectReasonDialog } from "@/components/Ride/RejectReasonDialog";
import { DriverAvailability } from "@/components/Driver/DriverAvailability";
import { Skeleton } from "@/components/ui/skeleton";
import { useRides } from "@/hooks/useRides";
import { useAvailableRides } from "@/hooks/useAvailableRides";
import { useProfile } from "@/hooks/useProfile";
import {
  acceptRide,
  rejectRide,
  driverArrived,
  startRide,
  completeRide,
} from "@/services/rideService";
import type { Ride } from "@/types/database";
import type { RejectionReason } from "@/types/database";
import { AnimatePresence, motion } from "framer-motion";

export default function DriverPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [showReject, setShowReject] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { profile, loading: profileLoading, upsertProfile } = useProfile(userId ?? undefined);
  const { rides, loading: ridesLoading } = useRides(userId ?? undefined, "driver");
  const { rides: availableRides } = useAvailableRides();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth");
        return;
      }
      setUserId(data.user.id);
      upsertProfile({ role: "driver" });
    });
  }, []);

  const pendingRides = availableRides;
  const activeRide = rides.find((r) =>
    ["accepted", "driver_arrived", "in_progress"].includes(r.status)
  );

  const handleAccept = async (rideId: string) => {
    try {
      await acceptRide(rideId, userId!);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (rideId: string, reason: RejectionReason, notes?: string) => {
    try {
      await rejectRide(rideId, userId!, reason, notes);
      setShowReject(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleArrived = async (rideId: string) => {
    try {
      await driverArrived(rideId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = async (rideId: string) => {
    try {
      await startRide(rideId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (rideId: string) => {
    try {
      await completeRide(rideId);
    } catch (e) {
      console.error(e);
    }
  };

  if (profileLoading && !userId) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="container p-4">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container p-4 space-y-6">
        <DriverAvailability driverId={userId} />

        {showReject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="rounded-lg bg-card p-6 max-w-sm w-full">
              <RejectReasonDialog
                onConfirm={(reason, notes) => handleReject(showReject, reason, notes)}
                onCancel={() => setShowReject(null)}
              />
            </div>
          </div>
        )}

        {pendingRides.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold">New Ride Requests</h2>
            {pendingRides.map((ride) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border p-4 space-y-2"
              >
                <p>{ride.pickup_address} → {ride.dropoff_address}</p>
                <p className="text-lg font-bold">
                  {ride.base_price * ride.surge_multiplier} SAR
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(ride.id)}
                    className="rounded bg-primary px-4 py-2 text-primary-foreground"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setShowReject(ride.id)}
                    className="rounded border px-4 py-2"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {ridesLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {rides.map((ride) => (
                <div key={ride.id} className="space-y-2">
                  <RideCard
                    ride={ride}
                    currentUserId={userId!}
                    role="driver"
                    onUpdate={() => {}}
                  />
                  {ride.driver_id === userId &&
                    ride.status === "accepted" && (
                      <button
                        onClick={() => handleArrived(ride.id)}
                        className="w-full rounded bg-primary py-2 text-primary-foreground"
                      >
                        I&apos;ve Arrived
                      </button>
                    )}
                  {ride.status === "driver_arrived" && (
                    <button
                      onClick={() => handleStart(ride.id)}
                      className="w-full rounded bg-primary py-2 text-primary-foreground"
                    >
                      Start Trip
                    </button>
                  )}
                  {ride.status === "in_progress" && (
                    <button
                      onClick={() => handleComplete(ride.id)}
                      className="w-full rounded bg-primary py-2 text-primary-foreground"
                    >
                      Complete Trip
                    </button>
                  )}
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {activeRide && (
          <div className="space-y-4">
            <RideChat rideId={activeRide.id} userId={userId!} />
            <TimeAnalyticsCard ride={activeRide} />
          </div>
        )}
      </main>
    </div>
  );
}
