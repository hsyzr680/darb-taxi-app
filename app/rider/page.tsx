"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/Layout/AppHeader";
import { RideRequestForm } from "@/components/Ride/RideRequestForm";
import { RideCard } from "@/components/Ride/RideCard";
import { RideChat } from "@/components/Chat/RideChat";
import { TimeAnalyticsCard } from "@/components/Ride/TimeAnalyticsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useRides } from "@/hooks/useRides";
import { useProfile } from "@/hooks/useProfile";
import { AnimatePresence, motion } from "framer-motion";

export default function RiderPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { profile, loading: profileLoading, upsertProfile } = useProfile(userId ?? undefined);
  const { rides, loading: ridesLoading } = useRides(userId ?? undefined, "rider");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth");
        return;
      }
      setUserId(data.user.id);
      upsertProfile({ role: "rider" });
    });
  }, []);

  const activeRide = rides.find(
    (r) =>
      !["cancelled", "rejected", "completed"].includes(r.status)
  );
  const selectedRide = activeRide ?? rides[0];

  if (profileLoading && !userId) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="container p-4">
          <Skeleton className="h-64 w-full max-w-md" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container p-4 space-y-6">
        {!activeRide && (
          <RideRequestForm
            riderId={userId!}
            onRideCreated={() => {}}
          />
        )}
        {ridesLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {rides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  currentUserId={userId!}
                  role="rider"
                  onUpdate={() => {}}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
        {selectedRide &&
          ["accepted", "driver_arrived", "in_progress"].includes(selectedRide.status) && (
            <div className="space-y-4">
              <RideChat rideId={selectedRide.id} userId={userId!} />
              <TimeAnalyticsCard ride={selectedRide} />
            </div>
          )}
      </main>
    </div>
  );
}
