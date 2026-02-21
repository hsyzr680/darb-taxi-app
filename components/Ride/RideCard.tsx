"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/utils";
import type { Ride } from "@/types/database";
import { motion } from "framer-motion";
import { cancelRide } from "@/services/rideService";
import { InvoiceButton } from "./InvoiceButton";

interface RideCardProps {
  ride: Ride;
  currentUserId: string;
  role: "rider" | "driver";
  onUpdate: () => void;
}

const statusLabels: Record<string, string> = {
  requested: "Ride Requested",
  accepted: "Driver on the way",
  driver_arrived: "Arrived",
  in_progress: "Trip in Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export function RideCard({ ride, currentUserId, role, onUpdate }: RideCardProps) {
  const { t, locale } = useLanguage();
  const canCancel =
    (role === "rider" && ["requested", "accepted"].includes(ride.status)) ||
    (role === "driver" && ["requested", "accepted"].includes(ride.status));

  const handleCancel = async () => {
    try {
      await cancelRide(ride.id, role === "rider" ? "rider" : "driver");
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const price =
    ride.final_price ?? ride.base_price * ride.surge_multiplier;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Badge variant={ride.status === "completed" ? "default" : "secondary"}>
            {statusLabels[ride.status] ?? ride.status}
          </Badge>
          <span className="text-lg font-semibold">{formatPrice(price, locale)}</span>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <span className="text-muted-foreground">From:</span> {ride.pickup_address}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">To:</span> {ride.dropoff_address}
          </p>
          {canCancel && (
            <Button variant="destructive" size="sm" onClick={handleCancel}>
              {t("cancelRide")}
            </Button>
          )}
          {ride.status === "completed" && (
            <InvoiceButton ride={ride} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
