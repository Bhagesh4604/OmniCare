import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';

interface Location {
  lat: number;
  lng: number;
}

interface RoutingProps {
  start: Location | null;
  end: Location | null;
}

const Routing: React.FC<RoutingProps> = ({ start, end }) => {
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    if (start && end) {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length) {
            // OSRM returns coordinates as [lng, lat], need to swap for Leaflet
            const leafletRoute = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
            setRoute(leafletRoute);
          }
        })
        .catch(err => console.error("Error fetching route:", err));
    }
  }, [start, end]);

  return route.length > 0 ? <Polyline positions={route} color="blue" /> : null;
};

export default Routing;
