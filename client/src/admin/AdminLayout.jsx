import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MdDashboard,
  MdTravelExplore,
  MdHotel,
  MdPeople,
  MdOutlineLogout,
  MdBookmark, // ✅ Added
} from "react-icons/md";

const sidebarLinks = [
  { to: "/admin", label: "Dashboard", icon: MdDashboard, exact: true },
  { to: "/admin/destinations", label: "Destinations", icon: MdTravelExplore },
  { to: "/admin/hotels", label: "Hotels", icon: MdHotel },
  { to: "/admin/users", label: "Users", icon: MdPeople },
  { to: "/admin/bookings", label: "Bookings", icon: MdBookmark }, // ✅ Added
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <Link to="/" className="flex items-center gap-2">
            <MdTravelExplore className="text-orange-400 text-2xl" />
            <span className="font-bold text-lg">
              UP<span className="text-orange-400">YATRA</span>
            </span>
          </Link>
          <p className="text-gray-400 text-xs mt-1">Admin Panel</p>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center font-bold">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-gray-400">Administrator</div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(to, exact)
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
          >
            <MdOutlineLogout size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
