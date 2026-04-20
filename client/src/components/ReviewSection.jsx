import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";
import { FiTrash2, FiUser, FiCalendar, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";

const ReviewSection = ({ destinationId, hotelId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    rating: 0,
    title: "",
    comment: "",
    visitDate: "",
  });

  // Fetch reviews for this destination or hotel
  const fetchReviews = async () => {
    try {
      const endpoint = destinationId
        ? `/reviews/destination/${destinationId}`
        : `/reviews/hotel/${hotelId}`;
      const { data } = await axiosInstance.get(endpoint);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destinationId || hotelId) fetchReviews();
  }, [destinationId, hotelId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) return setError("Please select a star rating.");
    if (form.comment.trim().length < 10)
      return setError("Comment must be at least 10 characters.");

    setSubmitting(true);
    setError("");
    try {
      await axiosInstance.post("/reviews", {
        destinationId: destinationId || undefined,
        hotelId: hotelId || undefined,
        ...form,
      });
      setForm({ rating: 0, title: "", comment: "", visitDate: "" });
      setShowForm(false);
      fetchReviews(); // Refresh reviews list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await axiosInstance.delete(`/reviews/${reviewId}`);
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate rating distribution (how many 5-stars, 4-stars etc.)
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percent: reviews.length
      ? Math.round(
          (reviews.filter((r) => r.rating === star).length / reviews.length) *
            100,
        )
      : 0,
  }));

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1,
      )
    : 0;

  // Check if logged-in user already reviewed this
  const alreadyReviewed =
    user &&
    reviews.some((r) => r.user?._id?.toString() === user._id?.toString());

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Reviews{" "}
          <span className="text-gray-400 font-normal text-base">
            ({reviews.length})
          </span>
        </h2>
        {user && !alreadyReviewed && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-sm py-2 px-4"
          >
            Write a Review
          </button>
        )}
        {!user && (
          <Link to="/login" className="btn-secondary text-sm py-2 px-4">
            Login to Review
          </Link>
        )}
      </div>

      {/* Rating summary — only show if there are reviews */}
      {reviews.length > 0 && (
        <div className="flex gap-8 mb-8 pb-6 border-b border-gray-100">
          {/* Average score */}
          <div className="text-center shrink-0">
            <div className="text-5xl font-bold text-gray-800">{avgRating}</div>
            <StarRating rating={parseFloat(avgRating)} size={18} />
            <div className="text-sm text-gray-400 mt-1">
              {reviews.length} reviews
            </div>
          </div>

          {/* Bar chart breakdown */}
          <div className="flex-1 space-y-1.5">
            {ratingCounts.map(({ star, count, percent }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 w-4 text-right">{star}</span>
                <FiStar
                  size={12}
                  className="text-yellow-400 fill-yellow-400 shrink-0"
                />
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-gray-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Your Review</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star selection */}
            <div>
              <label className="form-label">Rating *</label>
              <StarRating
                rating={form.rating}
                onRate={(val) => setForm({ ...form, rating: val })}
                mode="input"
                size={28}
              />
            </div>

            <div>
              <label className="form-label">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Summarize your experience"
                maxLength={100}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Your Review *</label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                required
                rows={4}
                placeholder="Share details about your visit..."
                maxLength={1000}
                className="form-input resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {form.comment.length}/1000
              </p>
            </div>

            <div>
              <label className="form-label">When did you visit?</label>
              <input
                type="text"
                value={form.visitDate}
                onChange={(e) =>
                  setForm({ ...form, visitDate: e.target.value })
                }
                placeholder="e.g. March 2024"
                className="form-input"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 text-4xl mb-3">⭐</p>
          <p className="text-gray-500 font-medium">No reviews yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Be the first to share your experience
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="pb-5 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-500 shrink-0">
                    {review.user?.name?.[0]?.toUpperCase() || (
                      <FiUser size={16} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">
                        {review.user?.name || "Anonymous"}
                      </span>
                      <StarRating rating={review.rating} size={12} />
                      {review.visitedOn && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiCalendar size={11} /> {review.visitedOn}
                        </span>
                      )}
                    </div>
                    {review.title && (
                      <p className="font-medium text-gray-700 text-sm mt-1">
                        {review.title}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                      {review.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Delete button — only for owner or admin */}
                {user &&
                  (user._id?.toString() === review.user?._id?.toString() ||
                    user.role === "admin") && (
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="p-1.5 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
