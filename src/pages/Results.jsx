import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CafeRow from "../components/CafeRow";
import { getCafesByZip, getCafesByCoords } from "../services/cafes";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const zip = params.get("zip") || "";
  const latParam = params.get("lat");
  const lngParam = params.get("lng");

  const lat = latParam ? Number(latParam) : null;
  const lng = lngParam ? Number(lngParam) : null;

  const usingCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const title = usingCoords ? "Coffee near you" : `Cafes near ${zip}`;

  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCafes() {
      setLoading(true);
      setErrorMsg("");

      try {
        const data = usingCoords
          ? await getCafesByCoords(lat, lng)
          : await getCafesByZip(zip);

        if (!cancelled) {
          setCafes(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          setErrorMsg(err?.message || "Something went wrong.");
        }
      }
    }

    // If neither zip nor coords exist, bounce back
    if (!usingCoords && !zip) {
      navigate("/search"); // change to "/" if Search is your home route
      return;
    }

    loadCafes();

    return () => {
      cancelled = true;
    };
  }, [zip, usingCoords, lat, lng, navigate]);

  const list = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  };

  const row = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" }
    }
  };

  return (
    <div className="panel">
      <div className="results-stack">
        <motion.button
          className="back-button"
          type="button"
          onClick={() => navigate("/search")} // change to "/" if needed
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileTap={{ scale: 0.96 }}
        >
          ← Back
        </motion.button>

        <motion.h1
          className="home-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          {title}
        </motion.h1>

        {loading ? (
          <p>Loading cafes…</p>
        ) : errorMsg ? (
          <p>{errorMsg}</p>
        ) : (
          <motion.div
            className="results-list"
            variants={list}
            initial="hidden"
            animate="show"
          >
            {cafes.map((cafe, index) => {
              const href = cafe.placeId
                ? `https://www.google.com/maps/place/?q=place_id:${cafe.placeId}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${cafe.name} ${cafe.address}`
                  )}`;

              const isRecommended =
                index < Math.max(1, Math.ceil(cafes.length * 0.2));

              return (
                <motion.div
                  key={cafe.id ?? cafe.placeId ?? `${cafe.name}-${cafe.address}`}
                  variants={row}
                >
                  <CafeRow
                    name={cafe.name}
                    address={cafe.address}
                    distance={cafe.distance}
                    href={href}
                    rating={cafe.rating}
                    reviews={cafe.user_ratings_total}
                    isRecommended={isRecommended}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
