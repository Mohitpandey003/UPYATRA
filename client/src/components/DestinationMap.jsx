import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DestinationMap = ({ latitude, longitude, name, address }) => {
  if (!latitude || !longitude) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-3">
        <h2 className="text-xl font-bold text-gray-800">Location</h2>
        {address && <p className="text-gray-500 text-sm mt-0.5">{address}</p>}
      </div>

      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        style={{ height: "240px", width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={true}
        dragging={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <Marker position={[latitude, longitude]}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>

      <div className="px-6 py-3 border-t border-gray-50">
        <a
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=14`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-orange-500 hover:underline"
        >
          Open in OpenStreetMap →
        </a>
      </div>
    </div>
  );
};

export default DestinationMap;
