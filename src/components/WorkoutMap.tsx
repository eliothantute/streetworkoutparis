import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { WorkoutSpot } from '../types';

// Standard leaflet icon setup fixes
import 'leaflet/dist/leaflet.css';

interface WorkoutMapProps {
  spots: WorkoutSpot[];
  selectedSpot: WorkoutSpot | null;
  onSelectSpot: (spot: WorkoutSpot) => void;
  userLocation: [number, number] | null;
  addModeActive: boolean;
  onMapDoubleClick: (lat: number, lng: number) => void;
  mapTheme: 'dark' | 'light';
}

export default function WorkoutMap({
  spots,
  selectedSpot,
  onSelectSpot,
  userLocation,
  addModeActive,
  onMapDoubleClick,
  mapTheme
}: WorkoutMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use Paris center as default
    const defaultCenter: [number, number] = [48.8566, 2.3522];
    const defaultZoom = 13;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      doubleClickZoom: !addModeActive // Disable double click zoom if we use it to add a spot
    }).setView(defaultCenter, defaultZoom);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle Double Click for Adding a Spot
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleDblClick = (e: L.LeafletMouseEvent) => {
      if (addModeActive) {
        onMapDoubleClick(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('dblclick', handleDblClick);
    return () => {
      map.off('dblclick', handleDblClick);
    };
  }, [addModeActive, onMapDoubleClick]);

  // Adjust zoom controls double click setting
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (addModeActive) {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }
  }, [addModeActive]);

  // Handle Tile Updates based on Dark/Light Theme
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl =
      mapTheme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const attribution =
      mapTheme === 'dark'
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    L.tileLayer(tileUrl, { attribution, maxZoom: 20 }).addTo(map);
  }, [mapTheme]);

  // Update Spot Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers that aren't in current list
    const currentSpotIds = new Set(spots.map((s) => s.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentSpotIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers for all spots
    spots.forEach((spot) => {
      const isSelected = selectedSpot?.id === spot.id;
      const cachedMarker = markersRef.current[spot.id];

      // Custom HTML layout for the glowing calisthenics marker pin
      const htmlContent = `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-zinc-950 border ${
          isSelected
            ? 'border-zinc-100 scale-110 z-[1000]'
            : 'border-zinc-700 hover:border-zinc-400'
        } transition-transform shadow-lg cursor-pointer">
          <div class="absolute inset-0 rounded-full ${
            spot.activeUsers > 0 ? 'bg-cyan-500/5 animate-pulse' : ''
          }"></div>
          
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${
            isSelected ? '#ffffff' : '#a1a1aa'
          }" stroke-width="2.5" class="transition-colors">
            <path d="M18 10h3v4h-3zM3 10h3v4H3zM6 12h12M15 6h2v12h-2zM7 6h2v12H7z" />
          </svg>
          
          ${
            spot.activeUsers > 0
              ? `
            <div class="absolute -top-1.5 -right-1.5 px-1 py-0.5 rounded-full bg-cyan-500 text-[9px] font-mono font-black text-zinc-950 ring-1 ring-zinc-950 leading-none flex items-center justify-center min-w-4 h-4">
              ${spot.activeUsers}
            </div>
          `
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: htmlContent,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        className: 'custom-spot-marker'
      });

      if (cachedMarker) {
        cachedMarker.setIcon(customIcon);
        cachedMarker.setLatLng(spot.coordinates);
      } else {
        const marker = L.marker(spot.coordinates, { icon: customIcon })
          .addTo(map)
          .on('click', () => {
            onSelectSpot(spot);
          });
        markersRef.current[spot.id] = marker;
      }
    });
  }, [spots, selectedSpot, onSelectSpot]);

  // flyTo Selected Spot Location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSpot) return;

    map.flyTo(selectedSpot.coordinates, 15, {
      animate: true,
      duration: 1.5
    });
  }, [selectedSpot]);

  // Handle User Geolocation Pin and Accuracy Ring
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userLocation) {
      const pinHtml = `
        <div class="relative flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-md">
          <span class="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
          <div class="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: pinHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: 'user-location-marker'
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userLocation);
      } else {
        userMarkerRef.current = L.marker(userLocation, {
          icon: userIcon,
          zIndexOffset: 2000
        }).addTo(map);
      }

      if (userCircleRef.current) {
        userCircleRef.current.setLatLng(userLocation);
      } else {
        userCircleRef.current = L.circle(userLocation, {
          radius: 100, // meters
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          weight: 1
        }).addTo(map);
      }
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (userCircleRef.current) {
        userCircleRef.current.remove();
        userCircleRef.current = null;
      }
    }
  }, [userLocation]);

  return (
    <div id="street-workout-leaflet-map" className="w-full h-full relative group">
      <div ref={mapContainerRef} className="w-full h-full z-0 pointer-events-auto" />
      
      {addModeActive && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded px-4 py-2 z-[999] shadow-xl text-xs font-mono font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Double-cliquez sur la carte pour situer et enregistrer un nouveau spot
        </div>
      )}
    </div>
  );
}
