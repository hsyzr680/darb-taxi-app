import { createClient } from "@/lib/supabase/client";
import type { RejectionReason } from "@/types/database";

const CANCEL_PENALTY_RIDER_EARLY = 5; // SAR if rider cancels before driver accepts
const CANCEL_PENALTY_RIDER_LATE = 15; // SAR if rider cancels after driver accepts
const CANCEL_PENALTY_DRIVER = 0; // driver cancelling - no penalty to rider

export interface CreateRideInput {
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateBasePrice(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number
): number {
  const km = haversineDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
  const baseFare = 5;
  const perKm = 2.5;
  return Math.round((baseFare + km * perKm) * 100) / 100;
}

export function getSurgeMultiplier(): number {
  const h = new Date().getHours();
  const d = new Date().getDay();
  const isWeekend = d === 5 || d === 6;
  const isPeak = (h >= 7 && h <= 9) || (h >= 17 && h <= 20);
  if (isPeak && isWeekend) return 1.5;
  if (isPeak) return 1.25;
  return 1;
}

export async function createRide(input: CreateRideInput, riderId: string) {
  const supabase = createClient();
  const basePrice = calculateBasePrice(
    input.pickupLat,
    input.pickupLng,
    input.dropoffLat,
    input.dropoffLng
  );
  const surge = getSurgeMultiplier();
  const { data, error } = await supabase
    .from("rides")
    .insert({
      rider_id: riderId,
      pickup_lat: input.pickupLat,
      pickup_lng: input.pickupLng,
      pickup_address: input.pickupAddress,
      dropoff_lat: input.dropoffLat,
      dropoff_lng: input.dropoffLng,
      dropoff_address: input.dropoffAddress,
      base_price: basePrice,
      surge_multiplier: surge,
      status: "requested",
    })
    .select()
    .single();
  if (error) throw error;

  await supabase.from("ride_requests_geo").insert({
    ride_id: data.id,
    lat: input.pickupLat,
    lng: input.pickupLng,
  });

  return data;
}

export async function acceptRide(rideId: string, driverId: string) {
  const supabase = createClient();
  const { data: ride } = await supabase
    .from("rides")
    .select("base_price, surge_multiplier")
    .eq("id", rideId)
    .single();
  const finalPrice = ride
    ? Math.round(ride.base_price * ride.surge_multiplier * 100) / 100
    : 0;

  const { data, error } = await supabase
    .from("rides")
    .update({
      driver_id: driverId,
      status: "accepted",
      accepted_at: new Date().toISOString(),
      final_price: finalPrice,
      updated_at: new Date().toISOString(),
    })
    .eq("id", rideId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function rejectRide(
  rideId: string,
  driverId: string,
  reason: RejectionReason,
  notes?: string
) {
  const supabase = createClient();
  const { error: rErr } = await supabase.from("ride_rejections").insert({
    ride_id: rideId,
    driver_id: driverId,
    reason,
    notes: notes || null,
  });
  if (rErr) throw rErr;

  const { data, error } = await supabase
    .from("rides")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", rideId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function driverArrived(rideId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rides")
    .update({
      status: "driver_arrived",
      driver_arrived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", rideId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function startRide(rideId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rides")
    .update({
      status: "in_progress",
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", rideId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function completeRide(rideId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rides")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", rideId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cancelRide(
  rideId: string,
  cancelledBy: "rider" | "driver" | "system"
) {
  const supabase = createClient();
  const { data: ride } = await supabase
    .from("rides")
    .select("status")
    .eq("id", rideId)
    .single();

  let penalty = 0;
  if (cancelledBy === "rider" && ride) {
    penalty =
      ride.status === "requested" ? CANCEL_PENALTY_RIDER_EARLY : CANCEL_PENALTY_RIDER_LATE;
  }

  await supabase.from("ride_cancellations").insert({
    ride_id: rideId,
    cancelled_by: cancelledBy,
    penalty_applied: penalty,
  });

  const { data, error } = await supabase
    .from("rides")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", rideId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
