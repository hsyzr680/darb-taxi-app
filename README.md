# Darb (درب) - Taxi Ecosystem

Production-ready full-stack taxi platform built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **Supabase**.

## Features

- **Multi-language**: Arabic (RTL) & English toggle
- **Real-time Chat**: Rider ↔ Driver via Supabase Realtime
- **Advanced Ride Logic**: Request ride, price estimation, surge pricing, cancel with penalty
- **Rejection Tracking**: Drivers select reason (Traffic, Too far, Vehicle issue, etc.) — logged for Admin
- **Time Analytics**: Requested → Accepted → Driver arrived → Trip duration
- **Admin Control Hub**: Users, Support tickets (3-way), Analytics, Rejection insights
- **AI Price Surge**: Peak-hour pricing (weekday/weekend)
- **Heatmap Simulation**: Request density visualization
- **Invoice Generator**: PDF receipt after each trip
- **UX**: Dark/Light mode, skeleton loaders, Framer Motion

## Setup

1. **Clone & install**
   ```bash
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor

3. **Environment**
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase URL and anon key.

4. **Run**
   ```bash
   npm run dev
   ```

## Deployment (Vercel)

- Connect your GitHub repo to Vercel
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as env vars

## Structure

```
/app          - Next.js App Router pages
/components   - UI components
/context      - Language, Theme
/hooks        - useRides, useProfile
/services     - rideService, chatService, invoiceService
/lib          - Supabase clients, utils
/supabase     - SQL migrations
```
