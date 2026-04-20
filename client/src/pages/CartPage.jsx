import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axios";
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiArrowLeft,
} from "react-icons/fi";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("cart"); // 'cart' | 'address' | 'confirm' | 'success'
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine: "",
    city: "",
    state: "Uttar Pradesh",
    pincode: "",
  });

  const gst = Math.round(cartTotal * 0.18);
  const grandTotal = cartTotal + gst;

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post("/orders", {
        items: cart.map((item) => ({
          productId: item._id, // must be _id not id
          quantity: item.quantity,
        })),
        shippingAddress: address,
      });
      setOrder(data);
      clearCart();
      setStep("success");
    } catch (err) {
      alert(err.response?.data?.message || "Order failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── SUCCESS VIEW ───────────────────────────────────────
  if (step === "success" && order) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Order Placed!
          </h2>
          <p className="text-gray-500 mb-2">
            Your order{" "}
            <strong className="text-gray-700">#{order.paymentId}</strong> has
            been confirmed.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Total paid:{" "}
            <strong className="text-orange-500">
              ₹{order.totalAmount?.toLocaleString()}
            </strong>{" "}
            · Estimated delivery: 5–7 business days
          </p>
          <div className="space-y-3">
            <Link
              to="/marketplace"
              className="btn-primary w-full block text-center py-3"
            >
              Continue Shopping
            </Link>
            <Link
              to="/profile"
              className="btn-secondary w-full block text-center py-3"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── EMPTY CART ─────────────────────────────────────────
  if (cart.length === 0 && step === "cart") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center">
          <FiShoppingCart size={64} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-6">
            Add some local UP products to get started
          </p>
          <Link to="/marketplace" className="btn-primary px-8 py-3">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb steps */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          {["cart", "address", "confirm"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === s
                    ? "bg-orange-500 text-white"
                    : ["cart", "address", "confirm"].indexOf(step) > i
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`capitalize font-medium ${step === s ? "text-orange-500" : "text-gray-400"}`}
              >
                {s}
              </span>
              {i < 2 && <span className="text-gray-300 mx-1">›</span>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Cart / Address / Confirm ───────── */}
          <div className="lg:col-span-2">
            {/* STEP 1: Cart items */}
            {step === "cart" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-5">
                  Your Cart ({cart.length} item{cart.length !== 1 ? "s" : ""})
                </h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="flex gap-4 pb-4 border-b border-gray-50 last:border-0"
                    >
                      <img
                        src={
                          item.coverImage || "https://via.placeholder.com/80"
                        }
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl shrink-0"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/80";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-orange-500 font-bold mt-1">
                          ₹{item.price?.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                              className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="px-3 text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity + 1)
                              }
                              className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-400 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-800">
                          ₹{(item.price * item.quantity)?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <Link
                    to="/marketplace"
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <FiArrowLeft size={14} /> Continue Shopping
                  </Link>
                  {user ? (
                    <button
                      onClick={() => setStep("address")}
                      className="btn-primary flex-1"
                    >
                      Proceed to Address
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="btn-primary flex-1 text-center"
                    >
                      Login to Checkout
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Shipping address */}
            {step === "address" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-5">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input
                        name="fullName"
                        value={address.fullName}
                        onChange={handleAddressChange}
                        required
                        className="form-input"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="form-label">Phone *</label>
                      <input
                        name="phone"
                        value={address.phone}
                        onChange={handleAddressChange}
                        required
                        className="form-input"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Address Line *</label>
                    <textarea
                      name="addressLine"
                      value={address.addressLine}
                      onChange={handleAddressChange}
                      required
                      rows={2}
                      className="form-input resize-none"
                      placeholder="House/Flat No., Street, Area"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">City *</label>
                      <input
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        required
                        className="form-input"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="form-label">State</label>
                      <input
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Pincode *</label>
                      <input
                        name="pincode"
                        value={address.pincode}
                        onChange={handleAddressChange}
                        required
                        className="form-input"
                        placeholder="226001"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep("cart")}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (
                        !address.fullName ||
                        !address.phone ||
                        !address.addressLine ||
                        !address.city ||
                        !address.pincode
                      ) {
                        return alert("Please fill all required fields");
                      }
                      setStep("confirm");
                    }}
                    className="btn-primary flex-1"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Confirm order */}
            {step === "confirm" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-5">
                  Confirm Your Order
                </h2>

                {/* Items summary */}
                <div className="space-y-3 mb-5">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img
                        src={item.coverImage}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/48";
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-700">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Delivery address */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Delivering to:
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.fullName} · {address.phone}
                  </p>
                  <p className="text-sm text-gray-500">
                    {address.addressLine}, {address.city}, {address.state} —{" "}
                    {address.pincode}
                  </p>
                </div>

                {/* Payment notice */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                  <p className="text-sm font-semibold text-blue-700 mb-1">
                    💳 Simulated Payment
                  </p>
                  <p className="text-sm text-blue-600">
                    This is a demo payment. Your order will be marked as paid
                    and confirmed instantly. No real money is charged.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("address")}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className="btn-primary flex-1 disabled:opacity-60 py-3"
                  >
                    {submitting
                      ? "Placing Order..."
                      : `Pay ₹${grandTotal.toLocaleString()} & Confirm`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Order summary ─────────────────── */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <hr className="border-gray-100 my-2" />
                <div className="flex justify-between font-bold text-gray-800 text-base">
                  <span>Total</span>
                  <span className="text-orange-500">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-xs text-green-700">
                🛡️ Secure checkout · Free returns within 7 days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
