import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useCart } from "../context/CartContext";
import { FiSearch, FiShoppingCart, FiStar, FiMapPin } from "react-icons/fi";
import { MdStorefront } from "react-icons/md";

const categories = [
  "all",
  "handicraft",
  "food",
  "clothing",
  "jewellery",
  "spiritual",
  "artwork",
];

const categoryEmoji = {
  handicraft: "🏺",
  food: "🍛",
  clothing: "👗",
  jewellery: "💎",
  spiritual: "🛕",
  artwork: "🖼️",
  other: "📦",
};

const ProductCard = ({ product }) => {
  const { addToCart, cart } = useCart();
  const inCart = cart.some((item) => item._id === product._id);
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <div className="card group flex flex-col">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={
            product.coverImage ||
            "https://via.placeholder.com/400x200?text=Product"
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x200?text=No+Image";
          }}
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {discount}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            ⭐ Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full capitalize font-medium">
            {categoryEmoji[product.category]} {product.category}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <FiStar size={11} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-600 font-medium">
              {product.rating?.toFixed(1)}
            </span>
          </div>
        </div>

        <h3 className="font-bold text-gray-800 text-sm mt-2 mb-1 line-clamp-2 group-hover:text-orange-500 transition-colors">
          {product.name}
        </h3>

        <p className="text-gray-500 text-xs line-clamp-2 mb-2 flex-1">
          {product.shortDescription}
        </p>

        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <FiMapPin size={11} />
          {product.destination?.name || product.district}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div>
            <span className="text-lg font-bold text-orange-500">
              ₹{product.price?.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through ml-1">
                ₹{product.originalPrice?.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all ${
              inCart
                ? "bg-green-100 text-green-700"
                : product.stock === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            <FiShoppingCart size={14} />
            {inCart ? "Added" : product.stock === 0 ? "Out of Stock" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { cartCount } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (category !== "all") params.category = category;
        const { data } = await axiosInstance.get("/products", { params });
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-14 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <MdStorefront size={16} /> UP Local Marketplace
        </div>
        <h1 className="text-4xl font-bold mb-3">
          Shop Local, Support UP Artisans
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Authentic handicrafts, foods and spiritual items directly from
          artisans across Uttar Pradesh
        </p>
        {cartCount > 0 && (
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium mt-5 hover:bg-orange-600 transition-colors"
          >
            <FiShoppingCart size={16} />
            View Cart ({cartCount} items)
          </Link>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Search & filter */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                category === cat
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600 hover:bg-orange-50 border border-gray-200"
              }`}
            >
              {cat !== "all" && categoryEmoji[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-80 bg-gray-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
