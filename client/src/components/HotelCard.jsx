import { Link } from "react-router-dom";
import { FiStar, FiMapPin, FiWifi } from "react-icons/fi";
import { MdPool } from "react-icons/md";

const typeColors = {
  budget: "bg-green-100 text-green-700",
  "mid-range": "bg-blue-100 text-blue-700",
  luxury: "bg-purple-100 text-purple-700",
  heritage: "bg-amber-100 text-amber-700",
  resort: "bg-teal-100 text-teal-700",
};

const HotelCard = ({ hotel }) => {
  const {
    slug,
    name,
    district,
    type,
    starRating,
    coverImage,
    pricePerNight,
    rating,
    reviewCount,
    amenities,
  } = hotel;

  // Render star rating as filled/empty stars
  const renderStars = (count) =>
    Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        size={12}
        className={
          i < count
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-200 fill-gray-200"
        }
      />
    ));

  return (
    <Link to={`/hotels/${slug}`} className="card group block">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverImage || "https://via.placeholder.com/400x200?text=Hotel"}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${typeColors[type] || "bg-gray-100 text-gray-700"}`}
        >
          {type}
        </span>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          {renderStars(starRating)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-orange-500 transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <FiMapPin size={13} /> {district}, UP
        </div>

        {/* Amenities preview */}
        {amenities?.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
              >
                {a}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400">Per night</span>
            <div className="text-lg font-bold text-orange-500">
              ₹{pricePerNight?.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <FiStar className="text-yellow-400 fill-yellow-400" size={13} />
            <span className="text-sm font-semibold text-gray-700">
              {rating?.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">({reviewCount})</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
