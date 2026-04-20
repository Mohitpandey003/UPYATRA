import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import {
  FiCalendar,
  FiUser,
  FiHome,
  FiDollarSign,
  FiFilter,
} from "react-icons/fi";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

const statusOptions = ["pending", "confirmed", "cancelled", "completed"];

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const { data } = await axiosInstance.get("/admin/bookings");
      setBookings(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter by status on the client side — no need to re-fetch
  useEffect(() => {
    if (statusFilter === "all") {
      setFiltered(bookings);
    } else {
      setFiltered(bookings.filter((b) => b.status === statusFilter));
    }
  }, [statusFilter, bookings]);

  const updateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const { data } = await axiosInstance.put(`/admin/bookings/${bookingId}`, {
        status: newStatus,
      });
      // Update just that one booking in state — no need to re-fetch everything
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: data.status } : b,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Summary counts for the stat cards at the top
  const counts = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    revenue: bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manage Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">
          {bookings.length} total bookings
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Bookings",
            value: counts.total,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Pending",
            value: counts.pending,
            color: "bg-yellow-50 text-yellow-600",
          },
          {
            label: "Confirmed",
            value: counts.confirmed,
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Total Revenue",
            value: `₹${counts.revenue.toLocaleString()}`,
            color: "bg-orange-50 text-orange-600",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color.split(" ")[1]}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...statusOptions].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"
            }`}
          >
            {s}{" "}
            {s !== "all" &&
              `(${bookings.filter((b) => b.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Bookings table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No bookings found for this filter.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Guest", "Hotel", "Dates", "Amount", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((booking) => (
                <tr
                  key={booking._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Guest */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold text-sm shrink-0">
                        {booking.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {booking.user?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.user?.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Hotel */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-gray-800">
                      {booking.hotel?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.hotel?.district}
                    </p>
                  </td>

                  {/* Dates */}
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <FiCalendar size={12} className="text-gray-400" />
                      {new Date(booking.checkIn).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                      {" → "}
                      {new Date(booking.checkOut).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {booking.roomsBooked} room
                      {booking.roomsBooked > 1 ? "s" : ""} ·{" "}
                      {booking.guests?.adults} adult
                      {booking.guests?.adults > 1 ? "s" : ""}
                    </p>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-gray-800">
                      ₹{booking.totalAmount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.paymentStatus}
                    </p>
                  </td>

                  {/* Current Status badge */}
                  <td className="px-4 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                  </td>

                  {/* Actions — dropdown to change status */}
                  <td className="px-4 py-4">
                    <select
                      value={booking.status}
                      onChange={(e) =>
                        updateStatus(booking._id, e.target.value)
                      }
                      disabled={updatingId === booking._id}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-orange-400 disabled:opacity-50 bg-white"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
