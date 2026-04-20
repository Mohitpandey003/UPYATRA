import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";

// Initial empty form state
const emptyForm = {
  name: "",
  district: "",
  category: "religious",
  shortDescription: "",
  description: "",
  coverImage: "",
  bestTimeToVisit: "",
  entryFeeIndian: 0,
  entryFeeForeign: 0,
  timingsOpen: "",
  timingsClose: "",
  timingsClosedOn: "",
  highlights: "",
  tags: "",
  isFeatured: false,
};

const categories = [
  "religious",
  "historical",
  "heritage",
  "nature",
  "adventure",
  "cultural",
];
const districts = [
  "Agra",
  "Varanasi",
  "Ayodhya",
  "Lucknow",
  "Prayagraj",
  "Mathura",
  "Vrindavan",
  "Kanpur",
  "Meerut",
  "Aligarh",
];

const ManageDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding new, string = editing existing
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null); // ID of destination pending delete confirmation

  // Fetch all destinations (including inactive ones for admin)
  const fetchDestinations = async () => {
    try {
      const { data } = await axiosInstance.get("/destinations");
      setDestinations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Handle any form field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // Open form in "Add" mode
  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  // Open form in "Edit" mode — pre-fill with existing data
  const openEditForm = (dest) => {
    setForm({
      name: dest.name || "",
      district: dest.district || "",
      category: dest.category || "religious",
      shortDescription: dest.shortDescription || "",
      description: dest.description || "",
      coverImage: dest.coverImage || "",
      bestTimeToVisit: dest.bestTimeToVisit || "",
      entryFeeIndian: dest.entryFee?.indian || 0,
      entryFeeForeign: dest.entryFee?.foreign || 0,
      timingsOpen: dest.timings?.open || "",
      timingsClose: dest.timings?.close || "",
      timingsClosedOn: dest.timings?.closedOn || "",
      // Arrays stored as comma-separated strings in the form for easy editing
      highlights: dest.highlights?.join(", ") || "",
      tags: dest.tags?.join(", ") || "",
      isFeatured: dest.isFeatured || false,
    });
    setEditingId(dest._id);
    setShowForm(true);
  };

  // Convert flat form fields back into the nested shape the API expects
  const buildPayload = () => ({
    name: form.name,
    district: form.district,
    category: form.category,
    shortDescription: form.shortDescription,
    description: form.description,
    coverImage: form.coverImage,
    bestTimeToVisit: form.bestTimeToVisit,
    entryFee: {
      indian: Number(form.entryFeeIndian),
      foreign: Number(form.entryFeeForeign),
    },
    timings: {
      open: form.timingsOpen,
      close: form.timingsClose,
      closedOn: form.timingsClosedOn,
    },
    // Split comma-separated strings into arrays, trim whitespace from each item
    highlights: form.highlights
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean),
    tags: form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    isFeatured: form.isFeatured,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (editingId) {
        // Update existing
        await axiosInstance.put(`/destinations/${editingId}`, payload);
      } else {
        // Create new
        await axiosInstance.post("/destinations", payload);
      }
      setShowForm(false);
      fetchDestinations(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/destinations/${id}`);
      setDeleteId(null);
      fetchDestinations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manage Destinations
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {destinations.length} destinations total
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus size={16} /> Add Destination
        </button>
      </div>

      {/* Destinations Table */}
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
                  "Destination",
                  "District",
                  "Category",
                  "Rating",
                  "Views",
                  "Featured",
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
              {destinations.map((dest) => (
                <tr
                  key={dest._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={dest.coverImage}
                        alt={dest.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/40";
                        }}
                      />
                      <span className="font-medium text-gray-800 text-sm">
                        {dest.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">
                    {dest.district}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full capitalize font-medium">
                      {dest.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">
                    ⭐ {dest.rating?.toFixed(1)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">
                    {dest.viewCount?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-3.5">
                    {dest.isFeatured ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                        Yes
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(dest)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(dest._id)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
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

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? "Edit Destination" : "Add New Destination"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="e.g. Taj Mahal"
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

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Best Time to Visit</label>
                  <input
                    name="bestTimeToVisit"
                    value={form.bestTimeToVisit}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. October to March"
                  />
                </div>
              </div>

              {/* Short description */}
              <div>
                <label className="form-label">
                  Short Description (max 200 chars)
                </label>
                <input
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  maxLength={200}
                  className="form-input"
                  placeholder="Brief one-liner for cards"
                />
              </div>

              {/* Full description */}
              <div>
                <label className="form-label">Full Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="form-input resize-none"
                  placeholder="Detailed description..."
                />
              </div>

              {/* Cover image */}
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

              {/* Entry fees */}
              <div>
                <label className="form-label">Entry Fee</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="entryFeeIndian"
                      value={form.entryFeeIndian}
                      onChange={handleChange}
                      min={0}
                      className="form-input pl-7"
                      placeholder="Indian"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="entryFeeForeign"
                      value={form.entryFeeForeign}
                      onChange={handleChange}
                      min={0}
                      className="form-input pl-7"
                      placeholder="Foreign"
                    />
                  </div>
                </div>
              </div>

              {/* Timings */}
              <div>
                <label className="form-label">Timings</label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    name="timingsOpen"
                    value={form.timingsOpen}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Opens (e.g. 06:00 AM)"
                  />
                  <input
                    name="timingsClose"
                    value={form.timingsClose}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Closes (e.g. 06:00 PM)"
                  />
                  <input
                    name="timingsClosedOn"
                    value={form.timingsClosedOn}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Closed on (e.g. Friday)"
                  />
                </div>
              </div>

              {/* Highlights & Tags */}
              <div>
                <label className="form-label">
                  Highlights (comma separated)
                </label>
                <input
                  name="highlights"
                  value={form.highlights}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Sunrise view, Mughal architecture, Museum"
                />
              </div>
              <div>
                <label className="form-label">Tags (comma separated)</label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="mughal, heritage, unesco"
                />
              </div>

              {/* Featured checkbox */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mark as Featured destination
                </span>
              </label>

              {/* Submit */}
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
                      ? "Update Destination"
                      : "Add Destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="text-red-500" size={20} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">
              Delete Destination?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              This will hide the destination from the public site. This action
              can be reversed from the database.
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

export default ManageDestinations;
