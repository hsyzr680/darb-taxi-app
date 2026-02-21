-- Darb (درب) Taxi Ecosystem - Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('rider', 'driver', 'staff', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers table (vehicle info, availability)
CREATE TABLE drivers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_model TEXT,
  vehicle_plate TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_available BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_trips INTEGER DEFAULT 0
);

-- Rides with full time analytics
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  pickup_address TEXT NOT NULL,
  dropoff_lat DOUBLE PRECISION NOT NULL,
  dropoff_lng DOUBLE PRECISION NOT NULL,
  dropoff_address TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  final_price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled', 'rejected')),
  -- Time analytics
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  driver_arrived_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rejection tracking (driver rejects with reason)
CREATE TABLE ride_rejections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('traffic', 'too_far', 'vehicle_issue', 'personal', 'other')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cancel with penalty tracking
CREATE TABLE ride_cancellations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  cancelled_by TEXT NOT NULL CHECK (cancelled_by IN ('rider', 'driver', 'system')),
  penalty_applied DECIMAL(10,2) DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time chat (Rider <-> Driver)
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support tickets (3-way: Admin/Staff <-> Rider/Driver)
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_staff_reply BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices (PDF data)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE UNIQUE,
  invoice_number TEXT NOT NULL UNIQUE,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Heatmap data (request locations for analytics)
CREATE TABLE ride_requests_geo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_rejections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_requests_geo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert geo for rides" ON ride_requests_geo FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM rides r WHERE r.id = ride_id AND r.rider_id = auth.uid())
);
CREATE POLICY "Admin read rejections" ON ride_rejections FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);
CREATE POLICY "Drivers insert rejections" ON ride_rejections FOR INSERT WITH CHECK (driver_id = auth.uid());
CREATE POLICY "Admin read geo" ON ride_requests_geo FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);

-- Profiles: users can read/update own
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Staff/Admin can read all profiles
CREATE POLICY "Staff read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);

-- Drivers
CREATE POLICY "Drivers read own" ON drivers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Drivers update own" ON drivers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Drivers insert own" ON drivers FOR INSERT WITH CHECK (auth.uid() = id);

-- Rides: riders/drivers involved, admins read all, drivers can see requested rides
CREATE POLICY "Rides select own" ON rides FOR SELECT USING (
  rider_id = auth.uid() OR driver_id = auth.uid() OR
  status = 'requested' OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);
CREATE POLICY "Rides insert rider" ON rides FOR INSERT WITH CHECK (rider_id = auth.uid());
CREATE POLICY "Rides update driver or rider" ON rides FOR UPDATE USING (driver_id = auth.uid() OR rider_id = auth.uid());

-- Chat
CREATE POLICY "Chat select ride participants" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM rides r WHERE r.id = ride_id AND (r.rider_id = auth.uid() OR r.driver_id = auth.uid()))
);
CREATE POLICY "Chat insert participant" ON chat_messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND EXISTS (SELECT 1 FROM rides r WHERE r.id = ride_id AND (r.rider_id = auth.uid() OR r.driver_id = auth.uid()))
);

-- Realtime for chat_messages and support_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;

-- Support: users create/read own tickets, staff read all and reply
CREATE POLICY "Users read own tickets" ON support_tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create own tickets" ON support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Staff read all tickets" ON support_tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))
);
CREATE POLICY "Ticket messages select" ON support_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))))
);
CREATE POLICY "Ticket messages insert" ON support_messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff'))))
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 'rider');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
