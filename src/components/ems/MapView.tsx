import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Custom Icons ---

// Ambulance Icon using SVG
const ambulanceIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="48" height="48">
    <style>
      .shape { stroke: #2D3748; stroke-width: 4.5; stroke-linejoin: round; stroke-linecap: round; fill: #FFFFFF; }
    </style>
    <circle cx="28" cy="72" r="9" fill="#4A5568" stroke="#2D3748" stroke-width="4"/>
    <circle cx="72" cy="72" r="9" fill="#4A5568" stroke="#2D3748" stroke-width="4"/>
    <path class="shape" d="M10,68 H90 V35 A5,5 0 0 0 85,30 H75 L65,20 H35 L25,30 H15 A5,5 0 0 0 10,35 V68 Z"/>
    <line x1="10" y1="62" x2="90" y2="62" stroke="#E53E3E" stroke-width="7" stroke-linecap="round"/>
    <path class="shape" d="M38,30 L35,20 H65 L70,30 H38 Z" fill="#90CDF4"/>
    <g fill="#E53E3E" stroke="none">
      <rect x="22" y="38" width="16" height="7" rx="1"/>
      <rect x="26.5" y="34" width="7" height="16" rx="1"/>
    </g>
    <rect x="58" y="15" width="12" height="7" fill="#E53E3E" stroke="#2D3748" stroke-width="4" rx="2"/>
  </svg>
`;

const ambulanceIcon = new L.DivIcon({
  html: ambulanceIconSvg,
  className: 'bg-transparent',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Destination Icon
const destinationIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Fix for default icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
}

interface AmbulanceLocation extends Location {
  timestamp: string;
  vehicle_name?: string;
}

interface MapViewProps {
  ambulanceLocations?: { [key: string]: AmbulanceLocation };
  destinations?: { [key: string]: Location };
}

import Routing from './Routing';

const MapView: React.FC<MapViewProps> = ({ ambulanceLocations = {}, destinations = {} }) => {
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const defaultZoom = 5;

  return (
    <MapContainer center={defaultCenter} zoom={defaultZoom} className="h-full w-full rounded-lg shadow-md">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {Object.entries(ambulanceLocations).map(([ambulanceId, location]) => {
        const destination = destinations[ambulanceId];
        return (
          <React.Fragment key={ambulanceId}>
            <Marker position={[location.lat, location.lng]} icon={ambulanceIcon}>
              <Popup>
                <strong>{location.vehicle_name || `Ambulance ${ambulanceId}`}</strong><br />
                Last Update: {new Date(location.timestamp).toLocaleString()}
              </Popup>
            </Marker>
            {destination && (
              <>
                <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
                  <Popup>
                    <strong>Destination for:</strong> {location.vehicle_name || `Ambulance ${ambulanceId}`}
                  </Popup>
                </Marker>
                <Routing start={location} end={destination} />
              </>
            )}
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default MapView;
