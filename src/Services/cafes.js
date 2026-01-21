const API_BASE = "http://localhost:3001/api/cafes";

const CHAIN_KEYWORDS = [
  "starbucks",
  "dunkin",
  "peet",
  "philz",
  "coffee bean",
  "mcdonald"
];


function scoreCafe(cafe) {
  const rating = cafe.rating ?? 0;
  const reviews = cafe.user_ratings_total ?? 0;

  const name = cafe.name?.toLowerCase() || "";
  const isChain = CHAIN_KEYWORDS.some(keyword =>
    name.includes(keyword)
  );

  // Favor high rating + many reviews
  let score = rating * Math.log10(reviews + 1);

  // Penalize chains slightly
  if (isChain) score *= 0.6;

  return score;
}

/**
 * Rank cafes by quality score (descending)
 */
function rankCafes(cafes) {
  return cafes
    .map(cafe => ({
      ...cafe,
      qualityScore: scoreCafe(cafe)
    }))
    .sort((a, b) => b.qualityScore - a.qualityScore);
}

/**
 * Fetch cafes by ZIP code
 */
export async function getCafesByZip(zip) {
  const res = await fetch(`${API_BASE}?zip=${zip}`);

  if (!res.ok) {
    throw new Error("Failed to fetch cafes by ZIP");
  }

  const data = await res.json();
  return rankCafes(data.cafes);
}

/**
 * Fetch cafes by coordinates (Use my location)
 */
export async function getCafesByCoords(lat, lng) {
  const res = await fetch(`${API_BASE}?lat=${lat}&lng=${lng}`);

  if (!res.ok) {
    throw new Error("Failed to fetch cafes by location");
  }

  const data = await res.json();
  return rankCafes(data.cafes);
}
