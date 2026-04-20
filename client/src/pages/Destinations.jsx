import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import DestinationCard from "../components/DestinationCard";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiFilter } from "react-icons/fi";

const categories = [
  "all",
  "religious",
  "historical",
  "heritage",
  "nature",
  "adventure",
  "cultural",
];

const districts = [
  "All Districts",
  "Agra",
  "Varanasi",
  "Ayodhya",
  "Lucknow",
  "Prayagraj",
  "Mathura",
  "Vrindavan",
  "Kanpur",
  "Meerut",
];

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL query params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [district, setDistrict] = useState(searchParams.get("district") || "");

  // Fetch destinations whenever filters change
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        // Build query string dynamically
        const params = {};
        if (search) params.search = search;
        if (category && category !== "all") params.category = category;
        if (district && district !== "All Districts")
          params.district = district;

        const { data } = await axiosInstance.get("/destinations", { params });
        setDestinations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, [search, category, district]);
  // The array [search, category, district] means: re-run this effect whenever any of these values change

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already reactive via useEffect, but we still need this for the form submit
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Page Header */}
      <div className="bg-gray-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">Explore Destinations</h1>
        <p className="text-gray-400 text-lg">
          Discover {destinations.length}+ incredible places across Uttar Pradesh
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-8 flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search destinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </form>

          {/* District filter */}
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 text-gray-700"
          >
            {districts.map((d) => (
              <option key={d} value={d === "All Districts" ? "" : d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                category === cat
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"
              }`}
            >
              {cat}
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
        ) : destinations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No destinations found for your filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("all");
                setDistrict("");
              }}
              className="mt-4 btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <DestinationCard key={dest._id} destination={dest} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
