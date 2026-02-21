import { type User, type InsertUser, type Trip, type InsertTrip, type UpdateTripRequest, type UpdateUserLocationRequest, type ToggleAvailabilityRequest, users, trips } from "@shared/schema";
import { db } from "./db";
import { eq, and, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLocation(id: number, location: UpdateUserLocationRequest): Promise<User>;
  toggleAvailability(id: number, isAvailable: boolean): Promise<User>;
  getAvailableDrivers(): Promise<User[]>;
  
  createTrip(trip: InsertTrip): Promise<Trip>;
  getTrip(id: number): Promise<Trip | undefined>;
  getActiveTrips(): Promise<Trip[]>;
  updateTripStatus(id: number, status: Trip["status"], driverId?: number): Promise<Trip>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserLocation(id: number, location: UpdateUserLocationRequest): Promise<User> {
    const [user] = await db.update(users)
      .set({ latitude: location.latitude, longitude: location.longitude })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async toggleAvailability(id: number, isAvailable: boolean): Promise<User> {
    const [user] = await db.update(users)
      .set({ isAvailable })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAvailableDrivers(): Promise<User[]> {
    return await db.select().from(users).where(and(eq(users.role, "driver"), eq(users.isAvailable, true)));
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const [newTrip] = await db.insert(trips).values(trip).returning();
    return newTrip;
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }

  async getActiveTrips(): Promise<Trip[]> {
    return await db.select().from(trips).where(
      or(eq(trips.status, "pending"), eq(trips.status, "accepted"))
    );
  }

  async updateTripStatus(id: number, status: Trip["status"], driverId?: number): Promise<Trip> {
    const updateData: Partial<Trip> = { status };
    if (driverId) updateData.driverId = driverId;
    
    const [trip] = await db.update(trips)
      .set(updateData)
      .where(eq(trips.id, id))
      .returning();
    return trip;
  }
}

export const storage = new DatabaseStorage();