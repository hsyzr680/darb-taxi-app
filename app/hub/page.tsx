"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/components/Layout/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { HeatmapSimulation } from "@/components/Hub/HeatmapSimulation";
import { SupportCenter } from "@/components/Hub/SupportCenter";

const REJECTION_LABELS: Record<string, string> = {
  traffic: "Traffic",
  too_far: "Too Far",
  vehicle_issue: "Vehicle Issue",
  personal: "Personal",
  other: "Other",
};

export default function HubPage() {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [rejections, setRejections] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const [pRes, rjRes, rRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("ride_rejections").select("*, rides(pickup_address, dropoff_address)").order("created_at", { ascending: false }).limit(50),
        supabase.from("rides").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      setProfiles(pRes.data ?? []);
      setRejections(rjRes.data ?? []);
      setRides(rRes.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const avgTimeToAccept = (() => {
    const withAccept = rides.filter((r) => r.accepted_at && r.requested_at);
    if (withAccept.length === 0) return 0;
    const total = withAccept.reduce((acc, r) => {
      const ms = new Date(r.accepted_at).getTime() - new Date(r.requested_at).getTime();
      return acc + ms / 60000;
    }, 0);
    return Math.round(total / withAccept.length);
  })();

  const avgTripDuration = (() => {
    const completed = rides.filter((r) => r.started_at && r.completed_at);
    if (completed.length === 0) return 0;
    const total = completed.reduce((acc, r) => {
      const ms = new Date(r.completed_at).getTime() - new Date(r.started_at).getTime();
      return acc + ms / 60000;
    }, 0);
    return Math.round(total / completed.length);
  })();

  const rejectionCounts = rejections.reduce((acc: Record<string, number>, r) => {
    acc[r.reason] = (acc[r.reason] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container p-4 space-y-6">
        <h1 className="text-2xl font-bold">{t("dashboard")} - Control Hub</h1>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">{t("riders")} & {t("drivers")}</TabsTrigger>
            <TabsTrigger value="analytics">{t("analytics")}</TabsTrigger>
            <TabsTrigger value="support">{t("support")}</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Name</th>
                          <th className="text-left py-2">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profiles.map((p) => (
                          <tr key={p.id} className="border-b">
                            <td className="py-2">{p.full_name || p.id.slice(0, 8)}</td>
                            <td className="py-2">{p.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Avg. Time to Accept</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{avgTimeToAccept} min</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Avg. Trip Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{avgTripDuration} min</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("rejections")} by Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {Object.entries(rejectionCounts).map(([reason, count]) => (
                      <li key={reason} className="flex justify-between">
                        <span>{REJECTION_LABELS[reason] ?? reason}</span>
                        <span>{count}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Recent Rejections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {rejections.slice(0, 20).map((r) => (
                    <div key={r.id} className="text-sm border-b pb-2">
                      <span className="font-medium">{REJECTION_LABELS[r.reason] ?? r.reason}</span>
                      {r.notes && <span className="text-muted-foreground"> - {r.notes}</span>}
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="mt-4">
              <HeatmapSimulation />
            </div>
          </TabsContent>

          <TabsContent value="support">
            <SupportCenter />
          </TabsContent>
        </Tabs>

        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/">Back to App</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
