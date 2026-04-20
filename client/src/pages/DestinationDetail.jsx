import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../utils/axios";
import ReviewSection from "../components/ReviewSection";
import DestinationMap from "../components/DestinationMap";
import {
  FiMapPin,
  FiClock,
  FiStar,
  FiDollarSign,
  FiCalendar,
  FiChevronLeft,
} from "react-icons/fi";
import { MdHotel } from "react-icons/md";

const DestinationDetail = () => {
  const { slug } = useParams();
  const [destination, setDestination] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const destRes = await axiosInstance.get(`/destinations/${slug}`);

        const hotelsRes = await axiosInstance.get(
          `/hotels?district=${encodeURIComponent(destRes.data.district)}`,
        );

        setDestination(destRes.data);
        setHotels(hotelsRes.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-80 bg-gray-200 rounded-2xl" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-xl">Destination not found.</p>
        <Link to="/destinations" className="btn-primary mt-4 inline-block">
          Back to Destinations
        </Link>
      </div>
    );
  }

  const {
    name,
    district,
    category,
    description,
    coverImage,
    images,
    rating,
    reviewCount,
    entryFee,
    timings,
    bestTimeToVisit,
    highlights,
    viewCount,
    location, // ✅ important
  } = destination;

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div
        className="h-[50vh] relative flex items-end"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.75)), url(${coverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-5xl mx-auto w-full px-4 pb-8">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4"
          >
            <FiChevronLeft size={16} /> Back to Destinations
          </Link>

          <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full capitalize mb-3 inline-block">
            {category}
          </span>

          <h1 className="text-4xl md:text-5xl font-bold text-white">{name}</h1>

          <div className="flex items-center gap-4 mt-3 text-white/80">
            <span className="flex items-center gap-1">
              <FiMapPin size={14} /> {district}
            </span>
            <span className="flex items-center gap-1">
              <FiStar size={14} className="text-yellow-400" />
              {rating?.toFixed(1)} ({reviewCount} reviews)
            </span>
            <span className="text-sm">{viewCount?.toLocaleString()} views</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              About {name}
            </h2>
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </div>

          {/* Highlights */}
          {highlights?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Highlights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    {h}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <ReviewSection destinationId={destination._id} />

          {/* Gallery */}
          {images?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${name} ${i + 1}`}
                    className="rounded-xl h-36 w-full object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* Entry Fee */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiDollarSign /> Entry Fee
            </h3>

            <div className="flex justify-between">
              <span>Indian</span>
              <span>
                {entryFee?.indian === 0 ? "Free" : `₹${entryFee?.indian}`}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Foreign</span>
              <span>
                {entryFee?.foreign === 0 ? "Free" : `₹${entryFee?.foreign}`}
              </span>
            </div>
          </div>

          {/* Timings */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiClock /> Timings
            </h3>

            <div className="flex justify-between">
              <span>Opens</span>
              <span>{timings?.open}</span>
            </div>

            <div className="flex justify-between">
              <span>Closes</span>
              <span>{timings?.close}</span>
            </div>

            <div className="flex justify-between">
              <span>Closed on</span>
              <span className="text-red-500">
                {timings?.closedOn || "None"}
              </span>
            </div>
          </div>

          {/* Best Time */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <FiCalendar /> Best Time to Visit
            </h3>
            <p className="text-sm text-gray-600">{bestTimeToVisit}</p>
          </div>

          {/* ✅ MAP */}
          <DestinationMap
            latitude={location?.latitude}
            longitude={location?.longitude}
            name={name}
          />

          {/* Hotels CTA */}
          <div className="bg-orange-50 border rounded-2xl p-5">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <MdHotel /> Nearby Hotels
            </h3>

            <p className="text-sm text-gray-500 mb-3">Find stays near {name}</p>

            <Link
              to={`/hotels?district=${district}`}
              className="btn-primary text-sm block text-center"
            >
              View Hotels in {district}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
