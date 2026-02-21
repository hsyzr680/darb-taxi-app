"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface GeoPoint {
  lat: number;
  lng: number;
  count: number;
}

export function HeatmapSimulation() {
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("ride_requests_geo")
        .select("lat, lng");
      const rows = (data ?? []) as { lat: number; lng: number }[];
      const buckets: Record<string, { lat: number; lng: number; count: number }> = {};
      const round = (n: number, d: number) => Math.round(n * d) / d;
      rows.forEach((r) => {
        const key = `${round(r.lat, 100)}_${round(r.lng, 100)}`;
        if (!buckets[key]) buckets[key] = { lat: r.lat, lng: r.lng, count: 0 };
        buckets[key].count++;
      });
      setPoints(Object.values(buckets).sort((a, b) => b.count - a.count));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="h-64 animate-pulse rounded-lg bg-muted" />;

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Request Heatmap (Simulated)</h3>
        <p className="text-sm text-muted-foreground">
          Request density by area. Larger = more requests.
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 rounded-lg border bg-muted/30 overflow-hidden">
          {points.slice(0, 50).map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary/60 pointer-events-none"
              style={{
                left: `${((p.lng - 46.5) / 0.5) * 50 + 50}%`,
                top: `${((24.9 - p.lat) / 0.5) * 50 + 50}%`,
                width: Math.min(24, 8 + p.count * 3),
                height: Math.min(24, 8 + p.count * 3),
                marginLeft: -Math.min(12, 4 + (p.count * 3) / 2),
                marginTop: -Math.min(12, 4 + (p.count * 3) / 2),
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Heatmap overlay (Riyadh region)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
