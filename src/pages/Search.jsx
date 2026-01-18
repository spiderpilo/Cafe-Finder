import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Search() {
  const [zip, setZip] = useState("");
  const navigate = useNavigate();

  const isValidZip = zip.length === 5;

  const handleSubmit = () => {
    if (!isValidZip) return;
    navigate(`/results?zip=${zip}`);
  };

  return (
    <div className="panel">
      <div className="home-stack">
        <h1 className="home-title">ZIP Code</h1>

        <input
          className="zip-input"
          placeholder="90703"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />

        <button
          className="search-button"
          disabled={!isValidZip}
          onClick={handleSubmit}
        >
          Search
        </button>
      </div>
    </div>
  );
}
