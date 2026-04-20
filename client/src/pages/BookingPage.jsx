import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axios";
import { FiCalendar, FiUsers } from "react-icons/fi";

const BookingPage = () => {
  const { hotelSlug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    rooms: 1,
    specialRequests: "",
  });

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const { data } = await axiosInstance.get(`/hotels/${hotelSlug}`);
        setHotel(data);
      } catch (err) {
        console.error("Hotel fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [hotelSlug]);

  const getNights = () => {
    if (!form.checkIn || !form.checkOut) return 0;
    const diff = new Date(form.checkOut) - new Date(form.checkIn);
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const totalAmount = getNights() * form.rooms * (hotel?.pricePerNight || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["adults", "children", "rooms"].includes(name)
        ? parseInt(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (getNights() === 0) {
      return setError("Please select valid check-in and check-out dates.");
    }

    if (new Date(form.checkIn) >= new Date(form.checkOut)) {
      return setError("Check-out date must be after check-in date.");
    }

    setSubmitting(true);
    setError("");

    try {
      // destination field: use the destination._id if populated, otherwise the raw field
      const destinationId = hotel.destination?._id || hotel.destination;

      await axiosInstance.post("/bookings", {
        hotel: hotel._id,
        destination: destinationId || hotel._id, // fallback to hotel._id if no destination
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: {
          adults: form.adults,
          children: form.children,
        },
        roomsBooked: form.rooms,
        totalAmount,
        specialRequests: form.specialRequests,
      });

      setSuccess(true);
    } catch (err) {
      console.error("Booking error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="text-center py-20 text-gray-500">Hotel not found.</div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-500 mb-2">
            Your booking at <strong>{hotel.name}</strong> is pending
            confirmation.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            {getNights()} nights · {form.rooms} room(s) · ₹
            {totalAmount.toLocaleString()}
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="btn-primary w-full py-3 mb-3"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate("/")}
            className="btn-secondary w-full py-3"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Complete Your Booking
        </h1>
        <p className="text-gray-500 mb-8">
          {hotel.name} · {hotel.district}, UP
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dates */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
              <FiCalendar className="text-orange-500" /> Select Dates
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Check-in *</label>
                <input
                  type="date"
                  name="checkIn"
                  value={form.checkIn}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Check-out *</label>
                <input
                  type="date"
                  name="checkOut"
                  value={form.checkOut}
                  onChange={handleChange}
                  min={form.checkIn || new Date().toISOString().split("T")[0]}
                  required
                  className="form-input"
                />
              </div>
            </div>
            {getNights() > 0 && (
              <p className="text-sm text-orange-600 font-medium mt-3">
                {getNights()} night(s) selected
              </p>
            )}
          </div>

          {/* Guests */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
              <FiUsers className="text-orange-500" /> Guests & Rooms
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Adults", name: "adults", min: 1 },
                { label: "Children", name: "children", min: 0 },
                { label: "Rooms", name: "rooms", min: 1 },
              ].map(({ label, name, min }) => (
                <div key={name}>
                  <label className="form-label">{label}</label>
                  <input
                    type="number"
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    min={min}
                    max={10}
                    className="form-input"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Special requests */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <label className="block font-bold text-gray-800 mb-3">
              Special Requests{" "}
              <span className="text-gray-400 font-normal text-sm">
                (optional)
              </span>
            </label>
            <textarea
              name="specialRequests"
              value={form.specialRequests}
              onChange={handleChange}
              rows={3}
              placeholder="Any specific requirements..."
              className="form-input resize-none"
            />
          </div>

          {/* Price summary */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-800 mb-4">Price Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>
                  ₹{hotel.pricePerNight?.toLocaleString()} × {getNights()}{" "}
                  nights × {form.rooms} room(s)
                </span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes (18% GST)</span>
                <span>₹{Math.round(totalAmount * 0.18).toLocaleString()}</span>
              </div>
              <hr className="border-orange-200 my-2" />
              <div className="flex justify-between font-bold text-gray-800 text-base">
                <span>Total</span>
                <span>₹{Math.round(totalAmount * 1.18).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || getNights() === 0}
            className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Processing..."
              : getNights() === 0
                ? "Select dates to continue"
                : `Confirm Booking · ₹${Math.round(totalAmount * 1.18).toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
