import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axios";
import {
  FiSend,
  FiTrash2,
  FiCalendar,
  FiUsers,
  FiMapPin,
  FiDollarSign,
  FiHeart,
  FiChevronRight,
  FiClock,
} from "react-icons/fi";
import { MdAutoAwesome } from "react-icons/md";

const UP_DESTINATIONS = [
  "Agra",
  "Varanasi",
  "Ayodhya",
  "Lucknow",
  "Prayagraj",
  "Mathura & Vrindavan",
  "Dudhwa National Park",
  "Sarnath",
  "Fatehpur Sikri",
  "Vindhyachal",
  "Mirzapur",
];

const INTERESTS = [
  { id: "religious", label: "Religious & Spiritual", emoji: "🛕" },
  { id: "historical", label: "History & Heritage", emoji: "🏛️" },
  { id: "nature", label: "Nature & Wildlife", emoji: "🌿" },
  { id: "food", label: "Food & Cuisine", emoji: "🍛" },
  { id: "shopping", label: "Shopping & Crafts", emoji: "🛍️" },
  { id: "adventure", label: "Adventure & Outdoors", emoji: "🏕️" },
  { id: "photography", label: "Photography", emoji: "📷" },
  { id: "cultural", label: "Culture & Festivals", emoji: "🎭" },
];

const BUDGETS = [
  { id: "budget", label: "Budget", desc: "Under ₹2,000/day" },
  { id: "moderate", label: "Moderate", desc: "₹2,000–5,000/day" },
  { id: "luxury", label: "Luxury", desc: "₹5,000+/day" },
];

const formatItinerary = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /^# (.*$)/gm,
      '<h2 class="text-xl font-bold text-gray-800 mt-6 mb-2">$1</h2>',
    )
    .replace(
      /^## (.*$)/gm,
      '<h3 class="text-lg font-bold text-gray-700 mt-5 mb-2">$1</h3>',
    )
    .replace(
      /^### (.*$)/gm,
      '<h4 class="font-semibold text-gray-700 mt-3 mb-1">$1</h4>',
    )
    .replace(
      /^- (.*$)/gm,
      '<li class="ml-4 text-gray-600 text-sm mb-1">• $1</li>',
    )
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, "<br/>");
};

// ── Defined OUTSIDE TripPlanner so they never get remounted ──────────

const PlannerForm = ({ form, setForm, onGenerate, error, user }) => {
  const toggleInterest = (id) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-500 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <MdAutoAwesome size={16} /> Powered by Gemini AI
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Plan Your Perfect UP Trip
        </h1>
        <p className="text-gray-500 text-lg">
          Tell us your preferences and get a personalized day-by-day itinerary
          in seconds
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Destination */}
        <div>
          <label className="block font-semibold text-gray-800 mb-3">
            <FiMapPin className="inline text-orange-500 mr-2" />
            Where do you want to go?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {UP_DESTINATIONS.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => setForm((p) => ({ ...p, destination: dest }))}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                  form.destination === dest
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-300"
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Or type any UP destination..."
            value={
              UP_DESTINATIONS.includes(form.destination) ? "" : form.destination
            }
            onChange={(e) =>
              setForm((p) => ({ ...p, destination: e.target.value }))
            }
            className="form-input text-sm mt-3"
          />
        </div>

        {/* Days + Travelers */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-gray-800 mb-3">
              <FiCalendar className="inline text-orange-500 mr-2" />
              Number of days
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, days: Math.max(1, p.days - 1) }))
                }
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-lg"
              >
                −
              </button>
              <span className="text-2xl font-bold text-gray-800 w-8 text-center">
                {form.days}
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, days: Math.min(14, p.days + 1) }))
                }
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-3">
              <FiUsers className="inline text-orange-500 mr-2" />
              Travelers
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    travelers: Math.max(1, p.travelers - 1),
                  }))
                }
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-lg"
              >
                −
              </button>
              <span className="text-2xl font-bold text-gray-800 w-8 text-center">
                {form.travelers}
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    travelers: Math.min(20, p.travelers + 1),
                  }))
                }
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block font-semibold text-gray-800 mb-3">
            <FiDollarSign className="inline text-orange-500 mr-2" />
            Budget
          </label>
          <div className="grid grid-cols-3 gap-3">
            {BUDGETS.map(({ id, label, desc }) => (
              <button
                key={id}
                type="button"
                onClick={() => setForm((p) => ({ ...p, budget: id }))}
                className={`p-4 rounded-xl border text-left transition-all ${
                  form.budget === id
                    ? "bg-orange-50 border-orange-400"
                    : "bg-gray-50 border-gray-200 hover:border-orange-200"
                }`}
              >
                <p className="font-semibold text-sm text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block font-semibold text-gray-800 mb-3">
            <FiHeart className="inline text-orange-500 mr-2" />
            Interests{" "}
            <span className="font-normal text-gray-400 text-sm">
              (pick any)
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {INTERESTS.map(({ id, label, emoji }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleInterest(id)}
                className={`px-3 py-2.5 rounded-xl text-sm border transition-all flex items-center gap-2 ${
                  form.interests.includes(id)
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-300"
                }`}
              >
                <span className="text-base">{emoji}</span>
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        {!user ? (
          <div className="text-center py-4 bg-orange-50 rounded-xl">
            <p className="text-gray-600 text-sm mb-3">
              Login to generate and save your itinerary
            </p>
            <Link to="/login" className="btn-primary px-8">
              Login to Continue
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={onGenerate}
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
          >
            <MdAutoAwesome size={18} />
            Generate My Itinerary
          </button>
        )}
      </div>
    </div>
  );
};

const LoadingView = ({ form }) => (
  <div className="max-w-2xl mx-auto text-center py-20">
    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
      <MdAutoAwesome className="text-orange-500 text-4xl animate-pulse" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 mb-3">
      Crafting your perfect itinerary...
    </h2>
    <p className="text-gray-500 mb-6">
      Our AI is planning your {form.days}-day trip to {form.destination}
    </p>
    <div className="flex justify-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  </div>
);

// ── Chat section is its own stable component ─────────────────────────
const ChatSection = ({ itinerary, onChatSent }) => {
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  // Chat messages are everything after index 1 (skip the initial generation)
  const chatMessages = itinerary?.messages?.slice(2) || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const handleChat = async () => {
    if (!chatInput.trim() || !itinerary) return;
    const message = chatInput.trim();
    setChatInput("");
    setChatLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.post(
        `/itinerary/${itinerary._id}/chat`,
        { message },
      );
      onChatSent(data.itinerary);
    } catch (err) {
      setError("Chat failed. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  const suggestions = [
    "Add budget accommodation options",
    "Suggest local restaurants for each day",
    "What to pack for this trip?",
    "Add a shopping guide",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
        <MdAutoAwesome className="text-orange-500" />
        Refine with AI Chat
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        Ask to modify any part — add a day, change hotels, add restaurants, etc.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {chatMessages.length > 0 && (
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto pr-1">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-orange-500 text-white rounded-tr-none"
                    : "bg-gray-100 text-gray-700 rounded-tl-none"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatItinerary(msg.content),
                    }}
                  />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Input — onChange only updates local state, no parent re-render */}
      <div className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !chatLoading && handleChat()}
          placeholder="e.g. Add a day trip to Fatehpur Sikri on Day 2..."
          className="form-input flex-1 text-sm"
          disabled={chatLoading}
        />
        <button
          type="button"
          onClick={handleChat}
          disabled={chatLoading || !chatInput.trim()}
          className="btn-primary px-4 disabled:opacity-50"
        >
          <FiSend size={16} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mt-3">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setChatInput(s)}
            className="text-xs bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full hover:bg-orange-100 border border-orange-100"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

const ResultView = ({
  itinerary,
  setItinerary,
  savedItineraries,
  setSavedItineraries,
  onNewTrip,
  onLoadSaved,
}) => {
  const firstAssistantMsg = itinerary?.messages?.find(
    (m) => m.role === "assistant",
  );

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/itinerary/${id}`);
      setSavedItineraries((prev) => prev.filter((i) => i._id !== id));
      if (itinerary?._id === id) onNewTrip();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {itinerary?.title}
          </h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FiCalendar size={13} /> {itinerary?.days} days
            </span>
            <span className="flex items-center gap-1">
              <FiUsers size={13} /> {itinerary?.travelers} traveler(s)
            </span>
            <span className="flex items-center gap-1">
              <FiDollarSign size={13} /> {itinerary?.budget}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onNewTrip}
          className="btn-secondary text-sm"
        >
          Plan New Trip
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Itinerary content */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: formatItinerary(
                  firstAssistantMsg?.content || itinerary?.content,
                ),
              }}
            />
          </div>

          {/* Chat — stable component, won't remount on parent re-render */}
          <ChatSection
            itinerary={itinerary}
            onChatSent={(updated) => setItinerary(updated)}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">Your Saved Trips</h3>
            {savedItineraries.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                No saved trips yet
              </p>
            ) : (
              <div className="space-y-2">
                {savedItineraries.map((trip) => (
                  <div
                    key={trip._id}
                    className={`p-3 rounded-xl border transition-colors ${
                      itinerary?._id === trip._id
                        ? "bg-orange-50 border-orange-200"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onLoadSaved(trip._id)}
                        className="text-left flex-1 min-w-0"
                      >
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {trip.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <FiClock size={10} />
                          {new Date(trip.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(trip._id)}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
            <h3 className="font-semibold text-orange-800 mb-3">💡 Chat Tips</h3>
            <ul className="space-y-2 text-sm text-orange-700">
              {[
                "Ask to add or remove days",
                "Request vegetarian-only food options",
                "Ask for budget alternatives",
                "Request specific hotel recommendations",
                "Ask about local festivals during your visit",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <FiChevronRight size={14} className="mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main TripPlanner component ────────────────────────────────────────
const TripPlanner = () => {
  const { user } = useAuth();
  const [view, setView] = useState("form");
  const [form, setForm] = useState({
    destination: "",
    days: 3,
    budget: "moderate",
    travelers: 1,
    interests: [],
  });
  const [itinerary, setItinerary] = useState(null);
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      axiosInstance
        .get("/itinerary/my")
        .then(({ data }) => setSavedItineraries(data))
        .catch(console.error);
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!form.destination) return setError("Please select a destination.");
    setError("");
    setView("loading");
    try {
      const { data } = await axiosInstance.post("/itinerary/generate", form);
      setItinerary(data);
      setSavedItineraries((prev) => [
        {
          _id: data._id,
          title: data.title,
          destination: data.destination,
          days: data.days,
          createdAt: data.createdAt,
        },
        ...prev,
      ]);
      setView("result");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate itinerary.");
      setView("form");
    }
  };

  const handleLoadSaved = async (id) => {
    try {
      const { data } = await axiosInstance.get(`/itinerary/${id}`);
      setItinerary(data);
      setView("result");
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewTrip = () => {
    setItinerary(null);
    setView("form");
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      {view === "form" && (
        <PlannerForm
          form={form}
          setForm={setForm}
          onGenerate={handleGenerate}
          error={error}
          user={user}
        />
      )}
      {view === "loading" && <LoadingView form={form} />}
      {view === "result" && (
        <ResultView
          itinerary={itinerary}
          setItinerary={setItinerary}
          savedItineraries={savedItineraries}
          setSavedItineraries={setSavedItineraries}
          onNewTrip={handleNewTrip}
          onLoadSaved={handleLoadSaved}
        />
      )}
    </div>
  );
};

export default TripPlanner;
