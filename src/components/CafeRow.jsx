export default function CafeRow({ name, address, distance }) {
  return (
    <div className="cafe-row">
      <div className="cafe-row-left">
        <p className="cafe-name">{name}</p>
        <p className="cafe-address">{address}</p>
      </div>

      <p className="cafe-distance">{distance}</p>
    </div>
  );
}
