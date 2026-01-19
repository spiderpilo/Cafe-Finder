import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CafeRow from "../components/CafeRow";
import { getCafesByZip } from "../services/cafes";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const zip = new URLSearchParams(location.search).get("zip") || "";

  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const data = await getCafesByZip(zip);
      if (!cancelled) {
        setCafes(data);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [zip]);

  return (
    <div className="panel">
      <div className="results-stack">
        <button className="back-button" type="button" onClick={() => navigate("/search")}>
          ← Back
        </button>

        <h1 className="home-title">Cafes near {zip}</h1>

        {loading ? (
          <p>Loading cafes…</p>
        ) : (
          cafes.map((cafe) => (
            <CafeRow
              key={cafe.id}
              name={cafe.name}
              address={cafe.address}
              distance={cafe.distance}
              onClick={() => console.log("Clicked:", cafe.name)}
            />
          ))
        )}
      </div>
    </div>
  );
}
