import { z } from 'zod';
import { insertUserSchema, insertTripSchema, trips, users } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: { 200: z.custom<typeof users.$inferSelect>(), 401: errorSchemas.unauthorized },
    },
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: { 201: z.custom<typeof users.$inferSelect>(), 400: errorSchemas.validation },
    },
    me: {
      method: 'GET' as const,
      path: '/api/me' as const,
      responses: { 200: z.custom<typeof users.$inferSelect>(), 401: errorSchemas.unauthorized },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: { 200: z.object({ message: z.string() }) },
    },
  },
  users: {
    updateLocation: {
      method: 'PATCH' as const,
      path: '/api/users/location' as const,
      input: z.object({ latitude: z.number(), longitude: z.number() }),
      responses: { 200: z.custom<typeof users.$inferSelect>(), 401: errorSchemas.unauthorized },
    },
    toggleAvailability: {
      method: 'PATCH' as const,
      path: '/api/users/availability' as const,
      input: z.object({ isAvailable: z.boolean() }),
      responses: { 200: z.custom<typeof users.$inferSelect>(), 401: errorSchemas.unauthorized },
    },
    availableDrivers: {
      method: 'GET' as const,
      path: '/api/users/drivers' as const,
      responses: { 200: z.array(z.custom<typeof users.$inferSelect>()) },
    }
  },
  trips: {
    create: {
      method: 'POST' as const,
      path: '/api/trips' as const,
      input: z.object({
        pickupLat: z.number(),
        pickupLng: z.number(),
        pickupAddress: z.string(),
        dropoffLat: z.number(),
        dropoffLng: z.number(),
        dropoffAddress: z.string(),
        price: z.number()
      }),
      responses: { 201: z.custom<typeof trips.$inferSelect>(), 400: errorSchemas.validation },
    },
    get: {
      method: 'GET' as const,
      path: '/api/trips/:id' as const,
      responses: { 200: z.custom<typeof trips.$inferSelect>(), 404: errorSchemas.notFound },
    },
    listActive: {
      method: 'GET' as const,
      path: '/api/trips/active' as const,
      responses: { 200: z.array(z.custom<typeof trips.$inferSelect>()) },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/trips/:id/status' as const,
      input: z.object({ status: z.enum(["accepted", "in_progress", "completed", "cancelled"]) }),
      responses: { 200: z.custom<typeof trips.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type LoginInput = z.infer<typeof api.auth.login.input>;
export type RegisterInput = z.infer<typeof api.auth.register.input>;
export type TripCreateInput = z.infer<typeof api.trips.create.input>;
export type TripUpdateStatusInput = z.infer<typeof api.trips.updateStatus.input>;
