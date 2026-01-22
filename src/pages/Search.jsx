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

    // Guard: if neither zip nor coords exist, bounce back
    if (!usingCoords && !zip) {
      navigate("/search");
      return;
    }

    loadCafes();

    return () => {
      cancelled = true;
    };
  }, [zip, usingCoords, lat, lng, navigate]);

  // ===== Framer Motion variants =====
  const page = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
  };

  const header = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
  };

  const list = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.05
      }
    }
  };

  const row = {
    hidden: { opacity: 0, y: 14, scale: 0.985 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.32, ease: "easeOut" }
    }
  };

  return (
    <div className="panel">
      <motion.div
        className="results-stack"
        variants={page}
        initial="hidden"
        animate="show"
      >
        {/* Header stagger: back button + title */}
        <motion.div variants={header} initial="hidden" animate="show">
          <motion.button
            className="back-button"
            type="button"
            onClick={() => navigate("/search")}
            variants={fadeUp}
            whileTap={{ scale: 0.96 }}
          >
            ← Back
          </motion.button>

          <motion.h1 className="home-title" variants={fadeUp}>
            {title}
          </motion.h1>
        </motion.div>

        {/* Loading / Error / List */}
        {loading ? (
          <motion.p variants={fadeUp} initial="hidden" animate="show">
            Loading cafes…
          </motion.p>
        ) : errorMsg ? (
          <motion.p variants={fadeUp} initial="hidden" animate="show">
            {errorMsg}
          </motion.p>
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
                  whileHover={{ y: -2 }}
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
      </motion.div>
    </div>
  );
}
