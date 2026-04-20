import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { FiCalendar, FiShoppingBag, FiPackage } from "react-icons/fi";
import { Link } from "react-router-dom";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-teal-100 text-teal-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

const Profile = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, ordersRes] = await Promise.all([
          axiosInstance.get("/bookings/my"),
          axiosInstance.get("/orders/my"),
        ]);
        setBookings(bookingsRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Profile card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-bold text-orange-500 shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium capitalize mt-2 inline-block">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "bookings"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FiCalendar size={15} /> Hotel Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "orders"
                ? "bg-orange-500 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FiShoppingBag size={15} /> My Orders ({orders.length})
          </button>
        </div>

        {/* Hotel Bookings tab */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-800 text-lg mb-5">
              Hotel Bookings
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 mb-3">No hotel bookings yet.</p>
                <Link to="/hotels" className="btn-primary text-sm px-6">
                  Browse Hotels
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {b.hotel?.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <FiCalendar size={12} />
                        {new Date(b.checkIn).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                        {" → "}
                        {new Date(b.checkOut).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ₹{b.totalAmount?.toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[b.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-800 text-lg mb-5">
              Marketplace Orders
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10">
                <FiShoppingBag
                  size={40}
                  className="text-gray-200 mx-auto mb-3"
                />
                <p className="text-gray-400 mb-3">No marketplace orders yet.</p>
                <Link to="/marketplace" className="btn-primary text-sm px-6">
                  Shop Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-gray-100 rounded-xl overflow-hidden"
                  >
                    {/* Order header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                      <div>
                        <p className="text-xs text-gray-400">Order ID</p>
                        <p className="text-sm font-mono font-medium text-gray-700">
                          {order.paymentId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[order.status] || "bg-gray-100"}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="p-4 space-y-3">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <img
                            src={
                              item.coverImage ||
                              "https://via.placeholder.com/48"
                            }
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/48";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              Qty: {item.quantity} × ₹
                              {item.price?.toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-700 shrink-0">
                            ₹{(item.price * item.quantity)?.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order footer */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiPackage size={14} />
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state}
                      </div>
                      <p className="font-bold text-orange-500">
                        Total: ₹{order.totalAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
