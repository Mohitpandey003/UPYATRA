import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const emptyForm = {
  name: "",
  district: "",
  type: "mid-range",
  starRating: 3,
  description: "",
  coverImage: "",
  pricePerNight: "",
  amenities: "",
  address: "",
  contactPhone: "",
  contactEmail: "",
  totalRooms: 10,
  destination: "",
};

const hotelTypes = ["budget", "mid-range", "luxury", "heritage", "resort"];
const districts = [
  "Agra",
  "Varanasi",
  "Ayodhya",
  "Lucknow",
  "Prayagraj",
  "Mathura",
];

const ManageHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [destinations, setDestinations] = useState([]); // For the destination dropdown
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    try {
      // Fetch hotels and destinations in parallel
      const [hotelsRes, destsRes] = await Promise.all([
        axiosInstance.get("/hotels"),
        axiosInstance.get("/destinations"),
      ]);
      setHotels(hotelsRes.data);
      setDestinations(destsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (hotel) => {
    setForm({
      name: hotel.name || "",
      district: hotel.district || "",
      type: hotel.type || "mid-range",
      starRating: hotel.starRating || 3,
      description: hotel.description || "",
      coverImage: hotel.coverImage || "",
      pricePerNight: hotel.pricePerNight || "",
      amenities: hotel.amenities?.join(", ") || "",
      address: hotel.address || "",
      contactPhone: hotel.contactPhone || "",
      contactEmail: hotel.contactEmail || "",
      totalRooms: hotel.totalRooms || 10,
      destination: hotel.destination?._id || hotel.destination || "",
    });
    setEditingId(hotel._id);
    setShowForm(true);
  };

  const buildPayload = () => ({
    name: form.name,
    district: form.district,
    type: form.type,
    starRating: Number(form.starRating),
    description: form.description,
    coverImage: form.coverImage,
    pricePerNight: Number(form.pricePerNight),
    amenities: form.amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean),
    address: form.address,
    contactPhone: form.contactPhone,
    contactEmail: form.contactEmail,
    totalRooms: Number(form.totalRooms),
    destination: form.destination,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (editingId) {
        await axiosInstance.put(`/hotels/${editingId}`, payload);
      } else {
        await axiosInstance.post("/hotels", payload);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/hotels/${id}`);
      setDeleteId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Hotels</h1>
          <p className="text-gray-500 text-sm mt-1">
            {hotels.length} hotels total
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus size={16} /> Add Hotel
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "Hotel",
                  "District",
                  "Type",
                  "Price/Night",
                  "Rating",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {hotels.map((hotel) => (
                <tr
                  key={hotel._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={hotel.coverImage}
                        alt={hotel.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/40";
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {hotel.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {"⭐".repeat(hotel.starRating || 0)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">
                    {hotel.district}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full capitalize font-medium">
                      {hotel.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-orange-500">
                    ₹{hotel.pricePerNight?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">
                    ⭐ {hotel.rating?.toFixed(1)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(hotel)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(hotel._id)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? "Edit Hotel" : "Add New Hotel"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Hotel Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="e.g. Taj Hotel Agra"
                  />
                </div>
                <div>
                  <label className="form-label">District *</label>
                  <select
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select district</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {hotelTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Star Rating</label>
                  <select
                    name="starRating"
                    value={form.starRating}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>
                        {s} Star
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Total Rooms</label>
                  <input
                    type="number"
                    name="totalRooms"
                    value={form.totalRooms}
                    onChange={handleChange}
                    min={1}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Linked Destination</label>
                <select
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select destination</option>
                  {destinations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="form-input resize-none"
                />
              </div>

              <div>
                <label className="form-label">Cover Image URL</label>
                <input
                  name="coverImage"
                  value={form.coverImage}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Price Per Night (₹) *</label>
                  <input
                    type="number"
                    name="pricePerNight"
                    value={form.pricePerNight}
                    onChange={handleChange}
                    required
                    min={0}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Address</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">
                  Amenities (comma separated)
                </label>
                <input
                  name="amenities"
                  value={form.amenities}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="WiFi, Pool, Spa, Restaurant"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Contact Phone</label>
                  <input
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                      ? "Update Hotel"
                      : "Add Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="text-red-500" size={20} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Delete Hotel?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This will hide the hotel from the public site.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHotels;
