import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import { MdTravelExplore } from "react-icons/md";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { cartCount } = useCart();

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/destinations", label: "Destinations" },
    { to: "/hotels", label: "Hotels" },
    { to: "/explore-map", label: "Explore Map" },
    { to: "/trip-planner", label: "AI Trip Planner" },
    { to: "/marketplace", label: "Marketplace" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-[1000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 z-10">
            <MdTravelExplore className="text-orange-500 text-3xl" />
            <span className="text-xl font-bold text-gray-800">
              UP<span className="text-orange-500">YATRA</span>
            </span>
          </Link>

          {/* Center Navigation (ABSOLUTE CENTER) */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-6 whitespace-nowrap">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4 z-10">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  {/* Cart */}
                  <Link
                    to="/cart"
                    className="relative text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    <FiShoppingCart size={22} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* User */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors"
                    >
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <FiUser className="text-orange-500" />
                      </div>
                      <span className="font-medium">
                        {user.name.split(" ")[0]}
                      </span>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                        >
                          <FiUser size={14} /> My Profile
                        </Link>

                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                          >
                            <FiSettings size={14} /> Admin Panel
                          </Link>
                        )}

                        <hr className="my-1 border-gray-100" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                        >
                          <FiLogOut size={14} /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block text-gray-700 hover:text-orange-500 font-medium py-1"
            >
              {link.label}
            </Link>
          ))}

          {user && (
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-gray-700 hover:text-orange-500 font-medium"
            >
              <FiShoppingCart />
              Cart ({cartCount})
            </Link>
          )}

          {!user ? (
            <div className="flex gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-secondary text-sm flex-1 text-center"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="btn-primary text-sm flex-1 text-center"
              >
                Register
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="text-red-500 font-medium py-1"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
