import { useLocation, useNavigate } from "react-router-dom";
import CafeRow from "../components/CafeRow";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const zip = new URLSearchParams(location.search).get("zip") || "";

  const cafes = [
    { id: 1, name: "Coffee Bee", address: "Main St • Long Beach", distance: "0.6 mi" },
    { id: 2, name: "Sunrise Cafe", address: "2nd St • Belmont Shore", distance: "1.1 mi" },
    { id: 3, name: "Harbor Roasters", address: "Pine Ave • Downtown", distance: "1.8 mi" },
    { id: 4, name: "Matcha & Co.", address: "Cherry Ave • Bixby", distance: "2.4 mi" },
  ];

  return (
    <div className="panel">
      <div className="results-stack">
        <button
          className="back-button"
          type="button"
          onClick={() => navigate("/search")}
        >
          ← Back
        </button>

        <h1 className="home-title">Cafes near {zip}</h1>

        {cafes.map((cafe) => (
          <CafeRow
            key={cafe.id}
            name={cafe.name}
            address={cafe.address}
            distance={cafe.distance}
            onClick={() => console.log("Clicked:", cafe.name)}
          />
        ))}
      </div>
    </div>
  );
}
