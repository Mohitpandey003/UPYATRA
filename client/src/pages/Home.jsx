import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import DestinationCard from "../components/DestinationCard";
import { FiMapPin, FiStar, FiHeart, FiCamera } from "react-icons/fi";
import { MdTempleHindu, MdCastle, MdForest } from "react-icons/md";

const categories = [
  {
    id: "religious",
    label: "Religious",
    icon: MdTempleHindu,
    color: "bg-orange-50 text-orange-500",
  },
  {
    id: "historical",
    label: "Historical",
    icon: MdCastle,
    color: "bg-amber-50 text-amber-600",
  },
  {
    id: "nature",
    label: "Nature",
    icon: MdForest,
    color: "bg-green-50 text-green-600",
  },
  {
    id: "heritage",
    label: "Heritage",
    icon: FiCamera,
    color: "bg-purple-50 text-purple-600",
  },
];

const stats = [
  { label: "Destinations", value: "50+", icon: FiMapPin },
  { label: "Hotels", value: "200+", icon: FiStar },
  { label: "Happy Travelers", value: "10K+", icon: FiHeart },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await axiosInstance.get("/destinations?featured=true");
        setFeatured(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []); // Empty array means run only on first mount

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section
        className="relative h-[90vh] flex items-center justify-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url('https://www.savaari.com/blog/wp-content/uploads/2023/09/Varanasi_ghats1.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center px-4 max-w-4xl">
          <p className="text-orange-400 font-semibold tracking-widest uppercase mb-3 text-sm">
            Incredible Uttar Pradesh
          </p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Discover the Soul of{" "}
            <span className="text-orange-400">Uttar Pradesh</span>
          </h1>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            From the eternal Taj Mahal to the spiritual ghats of Varanasi —
            explore history, faith, and culture in the heart of India.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search destinations, hotels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-5 py-3.5 rounded-xl text-gray-800 bg-white outline-none text-base"
            />
            <Link
              to={`/destinations${searchQuery ? `?search=${searchQuery}` : ""}`}
              className="btn-primary px-8 py-3.5 rounded-xl text-base whitespace-nowrap"
            >
              Explore Now
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center pt-1">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="bg-orange-500 py-6">
        <div className="max-w-7xl mx-auto px-4 flex justify-center gap-12 flex-wrap">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 text-white">
              <Icon size={28} />
              <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-orange-100 text-sm">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">Explore by Category</h2>
          <p className="section-subtitle">What kind of traveler are you?</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(({ id, label, icon: Icon, color }) => (
            <Link
              key={id}
              to={`/destinations?category=${id}`}
              className="card p-6 text-center group cursor-pointer"
            >
              <div
                className={`${color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
              >
                <Icon size={28} />
              </div>
              <h3 className="font-semibold text-gray-800">{label}</h3>
              <p className="text-sm text-gray-500 mt-1">Explore {label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FEATURED DESTINATIONS ===== */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-title">Featured Destinations</h2>
              <p className="section-subtitle">
                Handpicked places you must visit
              </p>
            </div>
            <Link
              to="/destinations"
              className="btn-secondary text-sm hidden md:block"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card h-72 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((dest) => (
                <DestinationCard key={dest._id} destination={dest} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-amber-500 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-orange-100 text-lg mb-8">
            Book your perfect UP getaway with verified hotels and guided tour
            options.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/destinations"
              className="bg-white text-orange-500 font-semibold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors"
            >
              Browse Destinations
            </Link>
            <Link
              to="/hotels"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              Find Hotels
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
