
const API_BASE = "/api/cafes";


const CHAIN_KEYWORDS = [
  "starbucks",
  "dunkin",
  "peet",
  "philz",
  "coffee bean",
  "mcdonald",
];

function scoreCafe(cafe) {
  const rating = cafe.rating ?? 0;
  const reviews = cafe.user_ratings_total ?? 0;

  const name = cafe.name?.toLowerCase() || "";
  const isChain = CHAIN_KEYWORDS.some((keyword) => name.includes(keyword));

  // Favor high rating + many reviews
  let score = rating * Math.log10(reviews + 1);

  // Penalize chains slightly
  if (isChain) score *= 0.6;

  return score;
}

function rankCafes(cafes) {
  return (cafes ?? [])
    .map((cafe) => ({
      ...cafe,
      qualityScore: scoreCafe(cafe),
    }))
    .sort((a, b) => b.qualityScore - a.qualityScore);
}

export async function getCafesByZip(zip) {
  const res = await fetch(`${API_BASE}?zip=${encodeURIComponent(zip)}`);

  if (!res.ok) {
    throw new Error("Failed to fetch cafes by ZIP");
  }

  const data = await res.json();
  return rankCafes(data.cafes);
}

export async function getCafesByCoords(lat, lng) {
  const res = await fetch(`${API_BASE}?lat=${lat}&lng=${lng}`);

  if (!res.ok) {
    throw new Error("Failed to fetch cafes by location");
  }

  const data = await res.json();
  return rankCafes(data.cafes);
}
