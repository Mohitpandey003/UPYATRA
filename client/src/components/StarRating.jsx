import { useState } from "react";
import { FiStar } from "react-icons/fi";

// mode="display" just shows stars (read-only)
// mode="input" lets user click to select a rating
const StarRating = ({ rating = 0, onRate, mode = "display", size = 16 }) => {
  const [hovered, setHovered] = useState(0);

  if (mode === "display") {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <FiStar
            key={i}
            size={size}
            className={
              i < Math.round(rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-200 fill-gray-200"
            }
          />
        ))}
      </div>
    );
  }

  // Input mode — interactive stars
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const value = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onRate(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <FiStar
              size={size}
              className={
                value <= (hovered || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 fill-gray-300"
              }
            />
          </button>
        );
      })}
      <span className="text-sm text-gray-500 ml-1">
        {hovered || rating
          ? ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
              hovered || rating
            ]
          : ""}
      </span>
    </div>
  );
};

export default StarRating;
