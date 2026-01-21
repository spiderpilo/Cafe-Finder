export default function CafeRow({
  name,
  address,
  distance,
  href,
  rating,
  reviews,
  isRecommended
}) {
  return (
    <a className="cafe-row" href={href} target="_blank" rel="noreferrer">
      <div className="cafe-row-left">
        <div className="cafe-title">
          <p className="cafe-name">{name}</p>

          {isRecommended && (
            <span className="recommended-badge">Recommended</span>
          )}
        </div>

        <p className="cafe-address">{address}</p>

        {rating && reviews && (
          <p className="cafe-meta">
            ⭐ {rating} · {reviews.toLocaleString()} reviews
          </p>
        )}
      </div>

      <p className="cafe-distance">{distance}</p>
    </a>
  );
}
