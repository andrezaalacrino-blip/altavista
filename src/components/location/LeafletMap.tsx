"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

/**
 * Mapa interativo da Alta Vista — usado SOMENTE com coordenadas confirmadas
 * (site.address.coordinates). Sem satélite, tráfego, busca ou geolocalização:
 * um único marcador da marca, zoom por botões e scroll da página preservado.
 */
const marker = L.divIcon({
  className: "",
  html: `<span style="display:block;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#6b3a22;border:3px solid #ebaa12;box-shadow:0 6px 14px rgba(23,15,10,.35)"></span>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

export default function LeafletMap({
  lat,
  lng,
  label,
  address,
}: {
  lat: number;
  lng: number;
  label: string;
  address: readonly string[];
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      attributionControl
      className="av-map absolute inset-0 z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={marker} keyboard alt={label}>
        <Popup>
          <strong>{label}</strong>
          <br />
          {address.join(" · ")}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
