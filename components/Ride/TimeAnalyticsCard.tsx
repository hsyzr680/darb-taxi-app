"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Ride } from "@/types/database";
import { format, differenceInMinutes } from "date-fns";

interface TimeAnalyticsCardProps {
  ride: Ride;
}

export function TimeAnalyticsCard({ ride }: TimeAnalyticsCardProps) {
  const requested = ride.requested_at ? new Date(ride.requested_at) : null;
  const accepted = ride.accepted_at ? new Date(ride.accepted_at) : null;
  const arrived = ride.driver_arrived_at ? new Date(ride.driver_arrived_at) : null;
  const started = ride.started_at ? new Date(ride.started_at) : null;
  const completed = ride.completed_at ? new Date(ride.completed_at) : null;

  const timeToAccept = requested && accepted ? differenceInMinutes(accepted, requested) : null;
  const timeToArrive = accepted && arrived ? differenceInMinutes(arrived, accepted) : null;
  const tripDuration = started && completed ? differenceInMinutes(completed, started) : null;

  const items = [
    { label: "Requested", value: requested ? format(requested, "HH:mm") : "-" },
    { label: "Accepted", value: accepted ? format(accepted, "HH:mm") : "-", delta: timeToAccept },
    { label: "Driver Arrived", value: arrived ? format(arrived, "HH:mm") : "-", delta: timeToArrive },
    { label: "Started", value: started ? format(started, "HH:mm") : "-" },
    { label: "Completed", value: completed ? format(completed, "HH:mm") : "-", delta: tripDuration },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Time Analytics</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span>
              {item.value}
              {item.delta != null && (
                <span className="ml-2 text-muted-foreground">({item.delta} min)</span>
              )}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
