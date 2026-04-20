import { Link } from "react-router-dom";
import { FiStar, FiMapPin } from "react-icons/fi";

const categoryColors = {
  religious: "bg-orange-100 text-orange-700",
  historical: "bg-amber-100 text-amber-700",
  heritage: "bg-purple-100 text-purple-700",
  nature: "bg-green-100 text-green-700",
  adventure: "bg-blue-100 text-blue-700",
  cultural: "bg-pink-100 text-pink-700",
};

const DestinationCard = ({ destination }) => {
  const {
    slug,
    name,
    district,
    category,
    coverImage,
    shortDescription,
    rating,
    reviewCount,
    entryFee,
    isFeatured,
  } = destination;

  return (
    <Link to={`/destinations/${slug}`} className="card group block">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={
            coverImage || "https://via.placeholder.com/400x200?text=No+Image"
          }
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${categoryColors[category] || "bg-gray-100 text-gray-700"}`}
        >
          {category}
        </span>
        {/* Featured badge */}
        {isFeatured && (
          <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            ⭐ Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-orange-500 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <FiStar className="text-yellow-400 fill-yellow-400" size={14} />
            <span className="text-sm font-semibold text-gray-700">
              {rating?.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">({reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <FiMapPin size={13} />
          <span>{district}, Uttar Pradesh</span>
        </div>

        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
          {shortDescription}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400">Entry (Indian)</span>
            <div className="font-semibold text-gray-800">
              {entryFee?.indian === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                `₹${entryFee?.indian}`
              )}
            </div>
          </div>
          <span className="text-orange-500 text-sm font-medium group-hover:underline">
            Explore →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default DestinationCard;
