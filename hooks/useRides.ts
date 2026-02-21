"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Ride } from "@/types/database";

export function useRides(userId: string | undefined, role: "rider" | "driver") {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const col = role === "rider" ? "rider_id" : "driver_id";

    const fetch = async () => {
      const { data } = await supabase
        .from("rides")
        .select("*")
        .eq(col, userId)
        .order("created_at", { ascending: false });
      setRides((data as Ride[]) ?? []);
      setLoading(false);
    };

    fetch();

    const sub = supabase
      .channel("rides")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rides", filter: `${col}=eq.${userId}` },
        () => { void fetch(); }
      )
      .subscribe();

    return () => { void sub.unsubscribe(); };
  }, [userId, role]);

  return { rides, loading };
}
