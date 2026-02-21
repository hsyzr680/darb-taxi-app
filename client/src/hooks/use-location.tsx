import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

interface Coords {
  lat: number;
  lng: number;
}

export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync location to backend (for drivers)
  const updateLocationMutation = useMutation({
    mutationFn: async (location: { latitude: number; longitude: number }) => {
      await fetch(api.users.updateLocation.path, {
        method: api.users.updateLocation.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location),
      });
    },
  });

  const queryClient = useQueryClient();

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const res = await fetch(api.users.toggleAvailability.path, {
        method: api.users.toggleAvailability.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      });
      if (!res.ok) throw new Error("Failed to toggle availability");
      return api.users.toggleAvailability.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
    }
  });


  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(newCoords);
        
        // Optimistically update location on backend every ~10s or substantial move would be better, 
        // but for this demo we'll just track it in state and let components decide when to push.
        // In a real app, you'd throttle this push to the server.
        updateLocationMutation.mutate({ 
          latitude: newCoords.lat, 
          longitude: newCoords.lng 
        });
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { coords, error, toggleAvailability: toggleAvailabilityMutation };
}
