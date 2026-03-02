import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, Rectangle, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import ReactLeafletDriftMarker from "react-leaflet-drift-marker";
import herodrone from "../../assets/hero-drone.png";
import otherdrone from "../../assets/hero-drone-red.png";

const MATRIX_SIZE = 80;
const DRIFT_DURATION = 320;

function matrixToCityCoords(row, col, center = [28.6139, 77.209], matrixSize = MATRIX_SIZE) {
  const [baseLat, baseLon] = center;
  const latOffset = (row - matrixSize / 2) * 0.001;
  const lonOffset = (col - matrixSize / 2) * 0.001;
  return [baseLat + latOffset, baseLon + lonOffset];
}

function MapMover({ city, forcedCenter, onCenterUpdate }) {
  const map = useMap();

  useEffect(() => {
    if (!forcedCenter) return;
    map.flyTo(forcedCenter, 14, { duration: 1.2 });
    onCenterUpdate(forcedCenter);
  }, [forcedCenter, map, onCenterUpdate]);

  useEffect(() => {
    if (!city) return;
    const fetchCoords = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const nextCenter = [parseFloat(lat), parseFloat(lon)];
          map.flyTo(nextCenter, 14, { duration: 1.5 });
          onCenterUpdate(nextCenter);
        }
      } catch (error) {
        console.error("Geocoding error", error);
      }
    };
    fetchCoords();
  }, [city, map, onCenterUpdate]);

  return null;
}

function UAVMarker({ uav, index, center }) {
  const icon = useMemo(
    () =>
      new L.Icon({
        iconUrl: index === 0 ? otherdrone : herodrone,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      }),
    [index]
  );

  const position = matrixToCityCoords(uav.x, uav.y, center);

  return (
    <ReactLeafletDriftMarker position={position} duration={DRIFT_DURATION} icon={icon}>
      <Popup>
        UAV {uav.id}
        <br />
        Position: [{uav.x}, {uav.y}]
        <br />
        Goal: [{uav.goal?.[0]}, {uav.goal?.[1]}]
        <br />
        Status: {uav.reached ? "Arrived" : "Flying"}
      </Popup>
    </ReactLeafletDriftMarker>
  );
}

export default function BasicMap({ uavs, noFlyZones = [], city, mapCenter, trails = {} }) {
  const [center, setCenter] = useState(mapCenter || [28.6133825, 77.21849369]);

  useEffect(() => {
    if (!mapCenter) return;
    setCenter(mapCenter);
  }, [mapCenter]);

  const geofences = useMemo(
    () =>
      noFlyZones.map(([r, c]) => {
        const cellSize = 0.001;
        const [lat, lon] = matrixToCityCoords(r, c, center);
        return [
          [lat - cellSize / 2, lon - cellSize / 2],
          [lat + cellSize / 2, lon + cellSize / 2],
        ];
      }),
    [noFlyZones, center]
  );

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapMover city={city} forcedCenter={mapCenter} onCenterUpdate={setCenter} />

        {uavs.map((uav, idx) => (
          <UAVMarker key={uav.id} uav={uav} index={idx} center={center} />
        ))}

        {Object.entries(trails).map(([id, path]) => {
          if (!path || path.length < 2) return null;
          return (
            <Polyline
              key={`trail-${id}`}
              positions={path.map(([x, y]) => matrixToCityCoords(x, y, center))}
              pathOptions={{ color: "#f97316", weight: 3, opacity: 0.7 }}
            />
          );
        })}

        {geofences.map((bounds, idx) => (
          <Rectangle
            key={`zone-${idx}`}
            bounds={bounds}
            pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.35 }}
          />
        ))}

        {uavs[0] && (
          <Marker position={matrixToCityCoords(uavs[0].start[0], uavs[0].start[1], center)}>
            <Popup>Hero UAV Start</Popup>
          </Marker>
        )}

        {uavs[0] && (
          <Marker position={matrixToCityCoords(uavs[0].goal[0], uavs[0].goal[1], center)}>
            <Popup>Hero UAV Destination</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export { matrixToCityCoords };
