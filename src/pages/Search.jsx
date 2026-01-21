import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

        // You can keep the zip flow as fallback; this becomes the primary modern flow
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

  return (
    <div className="panel">
      <div className="home-stack">
        <h1 className="home-title">Find coffee near you</h1>

        <button
          className="search-button"
          onClick={handleUseMyLocation}
          disabled={locLoading}
        >
          {locLoading ? "Getting location..." : "Use my location"}
        </button>

        <div className="zip-divider">
          <span className="zip-divider-line" />
          <span className="zip-divider-text">or</span>
          <span className="zip-divider-line" />
        </div>

        <input
          className="zip-input"
          placeholder="Enter ZIP (e.g., 90703)"
          value={zip}
          inputMode="numeric"
          maxLength={5}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleZipSubmit();
          }}
        />

        <button
          className="search-button"
          disabled={!isValidZip}
          onClick={handleZipSubmit}
        >
          Search by ZIP
        </button>
      </div>
    </div>
  );
}
