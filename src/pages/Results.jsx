import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CafeRow from "../components/CafeRow";
import { getCafesByZip } from "../services/cafes";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read the zip from the URL (?zip=90703)
  const zip = new URLSearchParams(location.search).get("zip") || "";

  // State for cafe data
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cafes whenever the zip changes
  useEffect(() => {
    let cancelled = false;

    async function loadCafes() {
      setLoading(true);

      const data = await getCafesByZip(zip);

      if (!cancelled) {
        setCafes(data);
        setLoading(false);
      }
    }

    loadCafes();

    // Cleanup to avoid setting state if component unmounts
    return () => {
      cancelled = true;
    };
  }, [zip]);

  return (
    <div className="panel">
      <div className="results-stack">
        {/* Back button */}
        <button
          className="back-button"
          type="button"
          onClick={() => navigate("/search")}
        >
          ← Back
        </button>

        {/* Page title */}
        <h1 className="home-title">Cafes near {zip}</h1>

        {/* Loading vs results */}
        {loading ? (
          <p>Loading cafes…</p>
        ) : (
          cafes.map((cafe) => {
            // Build a Google Maps link that opens the EXACT cafe
            const href = cafe.placeId
              ? `https://www.google.com/maps/place/?q=place_id:${cafe.placeId}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${cafe.name} ${cafe.address}`
                )}`;

            return (
              <CafeRow
                key={cafe.id}
                name={cafe.name}
                address={cafe.address}
                distance={cafe.distance}
                href={href}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
