import { useState } from "react";

export default function Search() {
  const [zip, setZip] = useState("");

  const isValidZip = zip.length === 5;

  return (
    <div className="panel">
      <div className="home-stack">
        <h1 className="home-title">ZIP Code</h1>

        <input
          className="zip-input"
          placeholder="90703"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
        />

        <button
          className="search-button"
          disabled={!isValidZip}
        >
          Search
        </button>
      </div>
    </div>
  );
}
