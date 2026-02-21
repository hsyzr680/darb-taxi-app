export type UserRole = "rider" | "driver" | "staff" | "admin";
export type RideStatus =
  | "requested"
  | "accepted"
  | "driver_arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rejected";
export type RejectionReason =
  | "traffic"
  | "too_far"
  | "vehicle_issue"
  | "personal"
  | "other";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  vehicle_model: string | null;
  vehicle_plate: string | null;
  latitude: number | null;
  longitude: number | null;
  is_available: boolean;
  rating: number;
  total_trips: number;
}

export interface Ride {
  id: string;
  rider_id: string;
  driver_id: string | null;
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  dropoff_address: string;
  base_price: number;
  surge_multiplier: number;
  final_price: number | null;
  status: RideStatus;
  requested_at: string;
  accepted_at: string | null;
  driver_arrived_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RideRejection {
  id: string;
  ride_id: string;
  driver_id: string;
  reason: RejectionReason;
  notes: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  ride_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}
