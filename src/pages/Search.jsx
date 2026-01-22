import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Search() {
  const [zip, setZip] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const navigate = useNavigate();

  const isValidZip = /^\d{5}$/.test(zip);

  const handleZipSubmit = () => {
    if (!isValidZip) return;
    navigate(`/results?zip=${zip}`);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Use ZIP instead.");
      return;
    }

    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        navigate(`/results?lat=${latitude}&lng=${longitude}`);
        setLocLoading(false);
      },
      (err) => {
        setLocLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          alert("Location permission was denied. You can still search by ZIP.");
        } else {
          alert("Could not get your location. Try again or use ZIP.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    );
  };

  // Stagger container animation
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  // Item fade + rise
  const item = {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <div className="panel">
      <motion.div
        className="home-stack"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Title */}
        <motion.h1
          className="home-title"
          variants={item}
        >
          Find coffee near you
        </motion.h1>

        {/* Location Button */}
        <motion.button
          className="search-button"
          variants={item}
          whileTap={{ scale: 0.96 }}
          onClick={handleUseMyLocation}
          disabled={locLoading}
        >
          {locLoading ? "Getting location..." : "Use my location"}
        </motion.button>

        {/* Divider */}
        <motion.div className="zip-divider" variants={item}>
          <span className="zip-divider-line" />
          <span className="zip-divider-text">or</span>
          <span className="zip-divider-line" />
        </motion.div>

        {/* ZIP Input */}
        <motion.input
          className="zip-input"
          variants={item}
          placeholder="Enter ZIP (e.g., 90703)"
          value={zip}
          inputMode="numeric"
          maxLength={5}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleZipSubmit();
          }}
        />

        {/* ZIP Button */}
        <motion.button
          className="search-button"
          variants={item}
          whileTap={{ scale: 0.96 }}
          disabled={!isValidZip}
          onClick={handleZipSubmit}
        >
          Search by ZIP
        </motion.button>
      </motion.div>
    </div>
  );
}
