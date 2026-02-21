"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Ride } from "@/types/database";

export function useAvailableRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("rides")
        .select("*")
        .eq("status", "requested")
        .order("created_at", { ascending: false });
      setRides((data as Ride[]) ?? []);
      setLoading(false);
    };

    fetch();

    const sub = supabase
      .channel("available_rides")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rides", filter: "status=eq.requested" },
        () => { void fetch(); }
      )
      .subscribe();

    return () => { void sub.unsubscribe(); };
  }, []);

  return { rides, loading };
}
