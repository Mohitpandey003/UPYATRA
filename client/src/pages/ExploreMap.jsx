import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axiosInstance from "../utils/axios";

// ── Fix Leaflet's broken default icon paths in Vite ──────────────────
// Leaflet looks for marker images in a folder that doesn't exist in Vite
// We manually point it to the correct CDN URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const categoryColors = {
  religious: "#f97316",
  historical: "#eab308",
  heritage: "#8b5cf6",
  nature: "#22c55e",
  cultural: "#3b82f6",
  adventure: "#ef4444",
};

// Creates a colored circular SVG pin for each category
const createPin = (color) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width: 20px; height: 20px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });

// This sub-component flies the map view when filter changes
// It must be INSIDE <MapContainer> to access the Leaflet map instance
const MapController = ({ destinations }) => {
  const map = useMap();

  useEffect(() => {
    if (destinations.length === 0) return;
    if (destinations.length === 1) {
      map.setView(
        [destinations[0].location.latitude, destinations[0].location.longitude],
        12,
      );
      return;
    }
    // Fit map bounds to show all filtered destinations
    const bounds = L.latLngBounds(
      destinations.map((d) => [d.location.latitude, d.location.longitude]),
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [destinations, map]);

  return null;
};

const categories = [
  "all",
  "religious",
  "historical",
  "heritage",
  "nature",
  "cultural",
];

const ExploreMap = () => {
  const [destinations, setDestinations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const { data } = await axiosInstance.get("/destinations");
        // Only keep destinations that have real coordinates
        setDestinations(
          data.filter((d) => d.location?.latitude && d.location?.longitude),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const filtered =
    filter === "all"
      ? destinations
      : destinations.filter((d) => d.category === filter);

  // UP center coordinates
  const UP_CENTER = [26.8467, 80.9462];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-10 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Explore UP on Map</h1>
        <p className="text-gray-400">
          Click any pin to discover destinations across Uttar Pradesh
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                setSelected(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === cat
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"
              }`}
            >
              {cat !== "all" && (
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: categoryColors[cat] }}
                />
              )}
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Map ─────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="h-[520px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p>Loading map...</p>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={UP_CENTER}
                  zoom={7}
                  style={{ height: "520px", width: "100%" }}
                  // Prevent scroll zoom from hijacking page scroll
                  scrollWheelZoom={false}
                >
                  {/* OpenStreetMap tiles — free, no API key */}
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                    maxZoom={18}
                  />

                  {/* Auto-adjusts map view when filter changes */}
                  <MapController destinations={filtered} />

                  {/* Render one marker per filtered destination */}
                  {filtered.map((dest) => (
                    <Marker
                      key={dest._id}
                      position={[
                        dest.location.latitude,
                        dest.location.longitude,
                      ]}
                      icon={createPin(categoryColors[dest.category] || "#888")}
                      eventHandlers={{
                        click: () => setSelected(dest),
                      }}
                    >
                      {/* Small popup that appears on marker click */}
                      <Popup minWidth={180} closeButton={false}>
                        <div className="text-center py-1">
                          <p className="font-semibold text-gray-800 text-sm">
                            {dest.name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {dest.district}, UP
                          </p>
                          <p className="text-xs mt-1">
                            ⭐ {dest.rating?.toFixed(1)} · {dest.reviewCount}{" "}
                            reviews
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>

            {/* Color legend */}
            <div className="mt-3 flex gap-4 flex-wrap">
              {Object.entries(categoryColors).map(([cat, color]) => (
                <div
                  key={cat}
                  className="flex items-center gap-1.5 text-sm text-gray-600 capitalize"
                >
                  <span
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ background: color }}
                  />
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* ── Side panel ───────────────────────────────────── */}
          <div className="space-y-4">
            {/* Selected destination card */}
            {selected ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <img
                  src={selected.coverImage}
                  alt={selected.name}
                  className="w-full h-44 object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x176?text=No+Image";
                  }}
                />
                <div className="p-5">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize inline-block mb-2"
                    style={{
                      background:
                        (categoryColors[selected.category] || "#888") + "20",
                      color: categoryColors[selected.category] || "#888",
                    }}
                  >
                    {selected.category}
                  </span>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {selected.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {selected.district}, UP
                  </p>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                    {selected.shortDescription}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      ⭐ {selected.rating?.toFixed(1)} ({selected.reviewCount}{" "}
                      reviews)
                    </span>
                    <Link
                      to={`/destinations/${selected.slug}`}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">
                <p className="text-4xl mb-3">📍</p>
                <p className="font-medium text-gray-600">
                  Click any pin on the map
                </p>
                <p className="text-sm mt-1">to see destination details here</p>
              </div>
            )}

            {/* Scrollable destination list */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">
                  {filtered.length} destination
                  {filtered.length !== 1 ? "s" : ""}
                </p>
                {filter !== "all" && (
                  <button
                    onClick={() => setFilter("all")}
                    className="text-xs text-orange-500 hover:underline"
                  >
                    Show all
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {filtered.map((dest) => (
                  <button
                    key={dest._id}
                    onClick={() => setSelected(dest)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left ${
                      selected?._id === dest._id ? "bg-orange-50" : ""
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border-2 border-white shadow-sm"
                      style={{
                        background: categoryColors[dest.category] || "#888",
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {dest.name}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {dest.district} · {dest.category}
                      </p>
                    </div>
                    <span className="ml-auto text-xs text-gray-400 shrink-0">
                      ⭐ {dest.rating?.toFixed(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreMap;
