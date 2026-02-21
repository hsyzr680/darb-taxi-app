"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data as Profile | null);
      setLoading(false);
    };

    fetch();
  }, [userId]);

  const upsertProfile = async (updates: Partial<Profile>) => {
    if (!userId) return;
    const { data } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() }, { onConflict: "id" })
      .select()
      .single();
    setProfile(data as Profile);
  };

  return { profile, loading, upsertProfile };
}
