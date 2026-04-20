import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import Hotels from "./pages/Hotels";
import HotelDetail from "./pages/HotelDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookingPage from "./pages/BookingPage";
import Profile from "./pages/Profile";
import ExploreMap from "./pages/ExploreMap";
import TripPlanner from "./pages/TripPlanner";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import ManageDestinations from "./admin/ManageDestinations";
import ManageHotels from "./admin/ManageHotels";
import ManageUsers from "./admin/ManageUsers";
import ManageBookings from "./admin/ManageBookings";
import { CartProvider } from "./context/CartContext";
import Marketplace from "./pages/Marketplace";
import CartPage from "./pages/CartPage";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* ── Public routes ────────────────────────────── */}
            <Route path="/" element={<Home />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:slug" element={<DestinationDetail />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/hotels/:slug" element={<HotelDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/explore-map" element={<ExploreMap />} />
            <Route path="/trip-planner" element={<TripPlanner />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/cart" element={<CartPage />} />

            {/* ── Protected routes (logged in users) ──────── */}
            <Route
              path="/booking/:hotelSlug"
              element={
                <PrivateRoute>
                  <BookingPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* ── Admin routes (nested under /admin) ──────── */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="destinations" element={<ManageDestinations />} />
              <Route path="hotels" element={<ManageHotels />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="bookings" element={<ManageBookings />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}
