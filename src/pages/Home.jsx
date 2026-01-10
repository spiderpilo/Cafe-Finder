import { useNavigate } from "react-router-dom";
import cafeIcon from "../assets/CoffeeFinder_Icon.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="panel">
      <div className="home-stack">
        <h1 className="home-title">Cafe Finder</h1>

        <button
          className="icon-button"
          type="button"
          onClick={() => navigate("/search")}
        >
          <img src={cafeIcon} alt="Cafe Finder Icon" className="home-icon" />
        </button>
      </div>
    </div>
  );
}
