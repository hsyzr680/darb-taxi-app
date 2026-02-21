import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, hashPassword } from "./auth";
import passport from "passport";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Auth routes
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      next(err);
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.status(200).json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out" });
    });
  });

  // User routes
  app.patch(api.users.updateLocation.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.users.updateLocation.input.parse(req.body);
      const user = await storage.updateUserLocation(req.user!.id, input);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.users.toggleAvailability.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.users.toggleAvailability.input.parse(req.body);
      const user = await storage.toggleAvailability(req.user!.id, input.isAvailable);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.users.availableDrivers.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const drivers = await storage.getAvailableDrivers();
    res.json(drivers);
  });

  // Trip routes
  app.post(api.trips.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.trips.create.input.parse(req.body);
      const trip = await storage.createTrip({ ...input, riderId: req.user!.id, status: "pending" });
      res.status(201).json(trip);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.trips.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const trip = await storage.getTrip(Number(req.params.id));
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  });

  app.get(api.trips.listActive.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const trips = await storage.getActiveTrips();
    res.json(trips);
  });

  app.patch(api.trips.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.trips.updateStatus.input.parse(req.body);
      const driverId = input.status === "accepted" ? req.user!.id : undefined;
      const trip = await storage.updateTripStatus(Number(req.params.id), input.status, driverId);
      res.json(trip);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed db function
  async function seedDatabase() {
    const existingUsers = await storage.getUserByUsername("rider1");
    if (!existingUsers) {
      const pw = await hashPassword("password123");
      const rider = await storage.createUser({ username: "rider1", password: pw, role: "rider" });
      const driver = await storage.createUser({ username: "driver1", password: pw, role: "driver" });
      await storage.toggleAvailability(driver.id, true);
      await storage.updateUserLocation(driver.id, { latitude: 40.7128, longitude: -74.0060 });
      
      await storage.createTrip({
        riderId: rider.id,
        pickupLat: 40.7128,
        pickupLng: -74.0060,
        pickupAddress: "123 Main St, New York",
        dropoffLat: 40.7580,
        dropoffLng: -73.9855,
        dropoffAddress: "Times Square",
        price: 1500, // $15.00
      });
    }
  }

  seedDatabase().catch(console.error);

  return httpServer;
}