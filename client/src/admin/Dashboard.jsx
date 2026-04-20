import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { MdPeople, MdTravelExplore, MdHotel, MdBookmark } from "react-icons/md";

const COLORS = ["#f97316", "#22c55e", "#3b82f6", "#ef4444"];

const StatCard = ({ label, value, icon: Icon, color, change }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <div
        className={`${color} w-10 h-10 rounded-xl flex items-center justify-center`}
      >
        <Icon className="text-white" size={20} />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    {change && (
      <p className="text-green-500 text-xs mt-1 font-medium">
        ↑ {change} this month
      </p>
    )}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get("/admin/stats");
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const {
    stats: s,
    recentBookings,
    topDestinations,
    bookingsByStatus,
    monthlyBookings,
  } = stats;

  // Format monthly data for Recharts
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyChartData =
    monthlyBookings?.map((item) => ({
      month: monthNames[item._id.month - 1],
      bookings: item.count,
      revenue: item.revenue,
    })) || [];

  // Format pie data
  const pieData =
    bookingsByStatus?.map((item) => ({
      name: item._id,
      value: item.count,
    })) || [];

  const statCards = [
    {
      label: "Total Users",
      value: s.totalUsers,
      icon: MdPeople,
      color: "bg-blue-500",
    },
    {
      label: "Destinations",
      value: s.totalDestinations,
      icon: MdTravelExplore,
      color: "bg-orange-500",
    },
    {
      label: "Hotels",
      value: s.totalHotels,
      icon: MdHotel,
      color: "bg-green-500",
    },
    {
      label: "Total Bookings",
      value: s.totalBookings,
      icon: MdBookmark,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back! Here's what's happening with UPYATRA.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart — monthly bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-6">
            Monthly Bookings & Revenue
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — booking status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-6">Booking Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">Recent Bookings</h2>
          <div className="space-y-3">
            {recentBookings?.length > 0 ? (
              recentBookings.map((b) => (
                <div
                  key={b._id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {b.user?.name}
                    </p>
                    <p className="text-xs text-gray-400">{b.hotel?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">
                      ₹{b.totalAmount?.toLocaleString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                        b.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : b.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No bookings yet</p>
            )}
          </div>
        </div>

        {/* Top destinations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">Top Destinations</h2>
          <div className="space-y-3">
            {topDestinations?.map((dest, i) => (
              <div key={dest._id} className="flex items-center gap-3">
                <span className="text-lg font-bold text-orange-400 w-6">
                  #{i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    {dest.name}
                  </p>
                  <p className="text-xs text-gray-400">{dest.district}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-700">
                    {dest.viewCount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
