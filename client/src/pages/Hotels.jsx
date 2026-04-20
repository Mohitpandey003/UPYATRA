import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosInstance from "../utils/axios";
import HotelCard from "../components/HotelCard";
import { FiSearch } from "react-icons/fi";

const hotelTypes = [
  "all",
  "budget",
  "mid-range",
  "luxury",
  "heritage",
  "resort",
];
const districts = [
  "All",
  "Agra",
  "Varanasi",
  "Ayodhya",
  "Lucknow",
  "Prayagraj",
  "Mathura",
];

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [district, setDistrict] = useState(searchParams.get("district") || "");

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (type !== "all") params.type = type;
        if (district && district !== "All") params.district = district;

        const { data } = await axiosInstance.get("/hotels", { params });
        setHotels(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [search, type, district]);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-gray-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">Find Your Stay</h1>
        <p className="text-gray-400">Verified hotels across Uttar Pradesh</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search hotels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 text-gray-700"
          >
            {districts.map((d) => (
              <option key={d} value={d === "All" ? "" : d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {hotelTypes.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                type === t
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 bg-gray-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No hotels found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hotels;
