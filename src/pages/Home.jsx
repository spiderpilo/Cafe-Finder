import cafeIcon from "../assets/CoffeeFinder_Icon.png";

export default function Home() {
  return (
    <div className="panel">
      <h1
        className="home-title"
        style={{
         margin: 0,
         marginBottom: "32px",  // controls spacing to icon
         fontWeight: 800,
         fontSize: "clamp(2rem, 5vw, 3.5rem)",
         textAlign: "center",
        }}
      >
        Cafe Finder
      </h1>

      <img
        src={cafeIcon}
        alt="Cafe Finder Icon"
        className="home-icon"
      />
    </div>
  );
}
