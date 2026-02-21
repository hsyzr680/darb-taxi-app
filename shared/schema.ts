import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["rider", "driver"] }).notNull().default("rider"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  isAvailable: boolean("is_available").default(false),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  riderId: integer("rider_id").references(() => users.id).notNull(),
  driverId: integer("driver_id").references(() => users.id),
  pickupLat: real("pickup_lat").notNull(),
  pickupLng: real("pickup_lng").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  dropoffLat: real("dropoff_lat").notNull(),
  dropoffLng: real("dropoff_lng").notNull(),
  dropoffAddress: text("dropoff_address").notNull(),
  status: text("status", { enum: ["pending", "accepted", "in_progress", "completed", "cancelled"] }).notNull().default("pending"),
  price: integer("price").notNull(), // stored in cents
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

export type CreateTripRequest = Omit<InsertTrip, "status" | "driverId">;
export type UpdateTripRequest = Partial<InsertTrip>;
export type UpdateUserLocationRequest = { latitude: number; longitude: number };
export type ToggleAvailabilityRequest = { isAvailable: boolean };