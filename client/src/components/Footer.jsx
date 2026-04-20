import { Link } from "react-router-dom";
import { MdTravelExplore } from "react-icons/md";
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand column */}
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <MdTravelExplore className="text-orange-400 text-3xl" />
            <span className="text-xl font-bold text-white">
              UP<span className="text-orange-400">YATRA</span>
            </span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your ultimate travel companion for exploring the rich culture,
            history, and spirituality of Uttar Pradesh.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/destinations", label: "Destinations" },
              { to: "/hotels", label: "Hotels" },
              { to: "/register", label: "Create Account" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="hover:text-orange-400 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Popular Destinations */}
        <div>
          <h3 className="text-white font-semibold mb-4">Popular Places</h3>
          <ul className="space-y-2 text-sm">
            {[
              "Agra",
              "Varanasi",
              "Ayodhya",
              "Lucknow",
              "Prayagraj",
              "Mathura",
            ].map((place) => (
              <li key={place}>
                <Link
                  to={`/destinations?district=${place}`}
                  className="hover:text-orange-400 transition-colors"
                >
                  {place}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <FiMapPin className="text-orange-400 mt-0.5 shrink-0" size={15} />
              <span>Lucknow, Uttar Pradesh, India</span>
            </li>
            <li className="flex items-center gap-2">
              <FiPhone className="text-orange-400 shrink-0" size={15} />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2">
              <FiMail className="text-orange-400 shrink-0" size={15} />
              <span>hello@upyatra.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-5 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} UPYATRA. Made with ❤️ for Uttar Pradesh
        Tourism.
      </div>
    </footer>
  );
};

export default Footer;
