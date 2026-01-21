export default function CafeRow({ name, address, distance, href }) {
  return (
    <a className="cafe-row" href={href} target="_blank" rel="noreferrer">
      <div className="cafe-row-left">
        <p className="cafe-name">{name}</p>
        <p className="cafe-address">{address}</p>
      </div>

      <p className="cafe-distance">{distance}</p>
    </a>
  );
}
