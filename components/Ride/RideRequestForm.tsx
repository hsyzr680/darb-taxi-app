"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import {
  calculateBasePrice,
  getSurgeMultiplier,
  createRide,
  type CreateRideInput,
} from "@/services/rideService";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";

interface RideRequestFormProps {
  riderId: string;
  onRideCreated: () => void;
}

export function RideRequestForm({ riderId, onRideCreated }: RideRequestFormProps) {
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateRideInput>({
    pickupLat: 24.7136,
    pickupLng: 46.6753,
    pickupAddress: "Riyadh, Saudi Arabia",
    dropoffLat: 24.7243,
    dropoffLng: 46.7054,
    dropoffAddress: "Riyadh Downtown",
  });

  const basePrice = calculateBasePrice(
    form.pickupLat,
    form.pickupLng,
    form.dropoffLat,
    form.dropoffLng
  );
  const surge = getSurgeMultiplier();
  const estimated = Math.round(basePrice * surge * 100) / 100;
  const isPeak = surge > 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRide(form, riderId);
      onRideCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("requestRide")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Pickup</Label>
              <Input
                value={form.pickupAddress}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pickupAddress: e.target.value }))
                }
                placeholder="Pickup address"
              />
            </div>
            <div>
              <Label>Dropoff</Label>
              <Input
                value={form.dropoffAddress}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dropoffAddress: e.target.value }))
                }
                placeholder="Dropoff address"
              />
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">{t("estimatedPrice")}</p>
              <p className="text-2xl font-bold">{formatPrice(estimated, locale)}</p>
              {isPeak && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {t("peakSurge")} (x{surge})
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : t("requestRide")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
