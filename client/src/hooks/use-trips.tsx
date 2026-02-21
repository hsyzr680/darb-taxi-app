import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type TripCreateInput, type TripUpdateStatusInput } from "@shared/routes";

// == RIDER HOOKS ==

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TripCreateInput) => {
      const res = await fetch(api.trips.create.path, {
        method: api.trips.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create trip");
      return api.trips.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trips.listActive.path] });
    },
  });
}

// Poll for trip status updates (Rider waiting for driver)
export function useTrip(id: number | undefined) {
  return useQuery({
    queryKey: [api.trips.get.path, id],
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ['completed', 'cancelled'].includes(status) ? false : 2000;
    },
    queryFn: async () => {
      if (!id) throw new Error("No trip ID");
      const url = buildUrl(api.trips.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch trip");
      return api.trips.get.responses[200].parse(await res.json());
    },
  });
}

// == DRIVER HOOKS ==

// Poll for new available trips
export function useActiveTrips() {
  return useQuery({
    queryKey: [api.trips.listActive.path],
    refetchInterval: 5000, 
    queryFn: async () => {
      const res = await fetch(api.trips.listActive.path);
      if (!res.ok) throw new Error("Failed to fetch active trips");
      return api.trips.listActive.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateTripStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number } & TripUpdateStatusInput) => {
      const url = buildUrl(api.trips.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.trips.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update trip status");
      return api.trips.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trips.listActive.path] });
      queryClient.invalidateQueries({ queryKey: [api.trips.get.path] });
    },
  });
}
