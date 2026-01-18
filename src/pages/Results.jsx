import { useLocation, useNavigate } from "react-router-dom";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const zip = new URLSearchParams(location.search).get("zip") || "";

  return (
    <div className="panel">
      <div className="home-stack">
        <button className="back-button" type="button" onClick={() => navigate("/search")}>
          ← Back
        </button>

        <h1 className="home-title">Cafes near {zip}</h1>
        <p>Results coming soon.</p>
      </div>
    </div>
  );
}
