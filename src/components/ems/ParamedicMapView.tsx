import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with Leaflet and Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

import Routing from './Routing';

interface Ambulance {
  ambulance_id: number;
  latitude: number;
  longitude: number;
  vehicle_name: string;
}

interface ParamedicMapViewProps {
  paramedicLocation?: { latitude: number; longitude: number } | null;
  sceneLocation?: { latitude: number; longitude: number } | null;
  ambulances?: Ambulance[];
}

const ParamedicMapView: React.FC<ParamedicMapViewProps> = ({ paramedicLocation, sceneLocation, ambulances }) => {
  const defaultCenter: [number, number] = [12.9716, 77.5946]; // Default to Bangalore
  let center: [number, number] = defaultCenter;
  let zoom = 12;

  const positionsForBounds: [number, number][] = [];
  if (paramedicLocation) {
    positionsForBounds.push([paramedicLocation.latitude, paramedicLocation.longitude]);
  }
  if (sceneLocation) {
    positionsForBounds.push([sceneLocation.latitude, sceneLocation.longitude]);
  }
  if (ambulances) {
    ambulances.forEach(amb => {
      if (amb.latitude && amb.longitude) {
        positionsForBounds.push([amb.latitude, amb.longitude]);
      }
    });
  }

  if (positionsForBounds.length > 0) {
    const lats = positionsForBounds.map(p => p[0]);
    const lngs = positionsForBounds.map(p => p[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
  }

  const startLocation = paramedicLocation ? { lat: paramedicLocation.latitude, lng: paramedicLocation.longitude } : null;
  const endLocation = sceneLocation ? { lat: sceneLocation.latitude, lng: sceneLocation.longitude } : null;

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-md">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {paramedicLocation && (
          <Marker position={[paramedicLocation.latitude, paramedicLocation.longitude]}>
            <Popup>Your Current Location</Popup>
          </Marker>
        )}
        {sceneLocation && (
          <Marker position={[sceneLocation.latitude, sceneLocation.longitude]}>
            <Popup>Scene Location</Popup>
          </Marker>
        )}
        {ambulances && ambulances.map(ambulance => (
          <Marker
            key={ambulance.ambulance_id}
            position={[ambulance.latitude, ambulance.longitude]}
          >
            <Popup>{ambulance.vehicle_name}</Popup>
          </Marker>
        ))}
        {startLocation && endLocation && <Routing start={startLocation} end={endLocation} />}
      </MapContainer>
    </div>
  );
};

export default ParamedicMapView;