import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CafeRow from "../components/CafeRow";
import { getCafesByZip, getCafesByCoords } from "../services/cafes";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

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

    if (!usingCoords && !zip) {
      navigate("/search");
      return;
    }

    loadCafes();

    return () => {
      cancelled = true;
    };
  }, [zip, usingCoords, lat, lng, navigate]);

  // ---- Variants (more noticeable) ----
  const headerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const list = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const row = {
    hidden: { opacity: 0, y: 28, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45 } },
  };

  return (
    <MotionConfig reducedMotion="never">
      <div className="panel">
        <div className="results-stack">
          {/* Header */}
          <motion.button
            className="back-button"
            type="button"
            onClick={() => navigate("/search")}
            variants={headerItem}
            initial="hidden"
            animate="show"
            whileTap={{ scale: 0.96 }}
          >
            ← Back
          </motion.button>

          <motion.h1
            className="home-title"
            variants={headerItem}
            initial="hidden"
            animate="show"
          >
            {title}
          </motion.h1>

          {/* Content swap: loading -> list, with AnimatePresence */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.p
                key="loading"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              >
                Loading cafes…
              </motion.p>
            ) : errorMsg ? (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              >
                {errorMsg}
              </motion.p>
            ) : (
              <motion.div
                key={`list-${zip}-${lat ?? "x"}-${lng ?? "x"}`} // replays on new search
                className="results-list"
                variants={list}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
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
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.99 }}
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
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
