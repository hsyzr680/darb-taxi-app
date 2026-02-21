"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DriverAvailabilityProps {
  driverId: string | null;
}

export function DriverAvailability({ driverId }: DriverAvailabilityProps) {
  const [available, setAvailable] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!driverId) return;
    const load = async () => {
      const { data } = await supabase
        .from("drivers")
        .select("is_available")
        .eq("id", driverId)
        .single();
      setAvailable(data?.is_available ?? false);
    };
    load();
  }, [driverId]);

  const handleChange = async (v: boolean) => {
    if (!driverId) return;
    await supabase.from("drivers").upsert(
      { id: driverId, is_available: v },
      { onConflict: "id" }
    );
    setAvailable(v);
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="available"
        checked={available}
        onCheckedChange={handleChange}
      />
      <Label htmlFor="available">Available for rides</Label>
    </div>
  );
}
