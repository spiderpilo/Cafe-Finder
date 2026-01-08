import cafeIcon from "../assets/CoffeeFinder_Icon.png";

export default function Home() {
  return (
    <div className="panel">
      <h1 className="home-title">Cafe Finder</h1>

      <img
        src={cafeIcon}
        alt="Cafe Finder Icon"
        className="home-icon"
      />
    </div>
  );
}
