import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axios";
import ReviewSection from "../components/ReviewSection";
import {
  FiStar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiChevronLeft,
} from "react-icons/fi";

const HotelDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const { data } = await axiosInstance.get(`/hotels/${slug}`);
        setHotel(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [slug]);

  if (loading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-80 bg-gray-200 rounded-2xl" />
      </div>
    );

  if (!hotel)
    return (
      <div className="text-center py-20 text-gray-500">Hotel not found.</div>
    );

  const {
    name,
    district,
    type,
    starRating,
    coverImage,
    images,
    description,
    amenities,
    pricePerNight,
    rating,
    reviewCount,
    contactPhone,
    contactEmail,
    address,
  } = hotel;

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div
        className="h-[45vh] relative flex items-end"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url(${coverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-5xl mx-auto w-full px-4 pb-8">
          <Link
            to="/hotels"
            className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4"
          >
            <FiChevronLeft size={16} /> Back to Hotels
          </Link>

          <h1 className="text-4xl font-bold text-white mb-2">{name}</h1>

          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <FiMapPin size={13} /> {district}
            </span>
            <span className="flex items-center gap-1">
              <FiStar size={13} className="text-yellow-400" />
              {rating?.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              About this Hotel
            </h2>
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </div>

          {/* Amenities */}
          {amenities?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 text-gray-700 text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Review Section */}
          <ReviewSection hotelId={hotel._id} />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4">
          {/* Booking Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
            <div className="text-3xl font-bold text-orange-500 mb-1">
              ₹{pricePerNight?.toLocaleString()}
              <span className="text-base font-normal text-gray-400">
                {" "}
                / night
              </span>
            </div>

            <div className="flex items-center gap-1 mb-5">
              {Array.from({ length: starRating || 0 }, (_, i) => (
                <FiStar
                  key={i}
                  size={14}
                  className="text-yellow-400 fill-yellow-400"
                />
              ))}
              <span className="text-sm text-gray-500 ml-1">{type}</span>
            </div>

            {user ? (
              <Link
                to={`/booking/${slug}`}
                className="btn-primary w-full block text-center py-3"
              >
                Book Now
              </Link>
            ) : (
              <Link
                to="/login"
                state={{ from: { pathname: `/hotels/${slug}` } }}
                className="btn-primary w-full block text-center py-3"
              >
                Login to Book
              </Link>
            )}
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">Contact</h3>

            {address && (
              <p className="text-sm text-gray-500 mb-2 flex items-start gap-2">
                <FiMapPin size={13} className="mt-0.5" />
                {address}
              </p>
            )}

            {contactPhone && (
              <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                <FiPhone size={13} />
                {contactPhone}
              </p>
            )}

            {contactEmail && (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <FiMail size={13} />
                {contactEmail}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
