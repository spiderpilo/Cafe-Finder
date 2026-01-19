export default function CafeRow({ name, address, distance, onClick }) {
  return (
    <button className="cafe-row" type="button" onClick={onClick}>
      <div className="cafe-row-left">
        <p className="cafe-name">{name}</p>
        <p className="cafe-address">{address}</p>
      </div>

      <p className="cafe-distance">{distance}</p>
    </button>
  );
}

