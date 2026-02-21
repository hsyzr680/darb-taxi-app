import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon path issues with bundlers
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{ position: [number, number]; title?: string; type?: 'pickup' | 'dropoff' | 'driver' }>;
  onLocationSelect?: (lat: number, lng: number) => void;
  className?: string;
  selecting?: boolean;
}

// Component to handle map clicks for selection
function LocationSelector({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to recenter map when props change
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function Map({ center, zoom = 13, markers = [], onLocationSelect, className, selecting }: MapProps) {
  const defaultCenter: [number, number] = [40.7128, -74.0060]; // NYC default
  
  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer 
        center={center || defaultCenter} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        className="w-full h-full rounded-none md:rounded-3xl shadow-inner z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {center && <MapController center={center} />}
        {onLocationSelect && <LocationSelector onSelect={onLocationSelect} />}

        {markers.map((marker, i) => (
          <Marker key={i} position={marker.position}>
            {marker.title && <Popup>{marker.title}</Popup>}
          </Marker>
        ))}
      </MapContainer>
      
      {selecting && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium border border-white/10 z-[400] shadow-xl animate-in fade-in slide-in-from-top-4">
          Tap map to select location
        </div>
      )}
    </div>
  );
}
