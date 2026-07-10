import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue in React/Vite builds
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const PropertyIcon = L.icon({
  iconUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [1, -34],
});

const AmenityIcon = (color) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4)"></div>`,
  className: 'custom-amenity-marker',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

// A helper component to auto-pan the map when coordinates change
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const DynamicMap = ({ lat, lon, city, location, amenities = [] }) => {
  const position = [lat || 19.0760, lon || 72.8777];

  return (
    <div className="w-full h-full relative" style={{ minHeight: '350px' }}>
      <MapContainer 
        center={position} 
        zoom={14} 
        scrollWheelZoom={false}
        className="w-full h-full rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Active Property Marker */}
        <Marker position={position} icon={PropertyIcon}>
          <Popup>
            <div className="font-semibold text-slate-800">
              <span className="text-primary-600 block text-xs">Selected Property</span>
              {location}, {city}
            </div>
          </Popup>
        </Marker>

        {/* Nearby Amenities Markers */}
        {amenities.map((amenity, idx) => {
          // Offsets slightly to distribute markers realistically around property
          const markerLat = position[0] + (amenity.offsetLat || 0);
          const markerLon = position[1] + (amenity.offsetLon || 0);
          
          let color = '#2563EB'; // primary
          if (amenity.type === 'Hospital') color = '#EF4444'; // Red
          else if (amenity.type === 'School') color = '#F59E0B'; // Yellow
          else if (amenity.type === 'Metro') color = '#10B981'; // Green
          else if (amenity.type === 'Mall') color = '#8B5CF6'; // Purple
          
          return (
            <Marker 
              key={idx} 
              position={[markerLat, markerLon]} 
              icon={AmenityIcon(color)}
            >
              <Popup>
                <div className="text-xs font-semibold text-slate-800">
                  <span style={{ color }} className="block font-bold uppercase tracking-wider">{amenity.type}</span>
                  {amenity.name}
                  <span className="block text-slate-400 font-normal mt-0.5">Distance: {amenity.distance} ({amenity.time})</span>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        <MapRecenter center={position} />
      </MapContainer>
      
      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs font-medium space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white inline-block"></span>
          <span>Selected Property</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white inline-block"></span>
          <span>Hospitals</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white inline-block"></span>
          <span>Schools</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white inline-block"></span>
          <span>Metro Stations</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-white inline-block"></span>
          <span>Shopping Malls</span>
        </div>
      </div>
    </div>
  );
};

export default DynamicMap;
