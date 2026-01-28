const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const CHAIN_KEYWORDS = [
  "starbucks",
  "dunkin",
  "peet",
  "philz",
  "coffee bean",
  "coffee bean & tea leaf",
  "the coffee bean",
  "mcdonald",
  "mc donald",
  "mcdonald's",
  "mccafe",
  "tim hortons",
  "panera",
  "caribou",
  "7-eleven",
  "7 eleven",
  "711",
  "7 leaves",
  "ampm",
  "costa coffee",
  "gloria jean's",
  "tully's",
  "biggby",
  "diedrich",
  "diedrich coffee",
  "lavazza",
  "segafredo",
];

const ROASTER_KEYWORDS = [
  "roaster",
  "roasters",
  "roastery",
  "roasting",
  "micro-roastery",
  "micro roastery",
  "coffee roaster",
  "coffee roasters",
];

function isChainCafe(name = "") {
  const n = String(name).toLowerCase();
  return CHAIN_KEYWORDS.some((k) => n.includes(k));
}

function isRoasterCafe(place) {
  const name = String(place?.name || "").toLowerCase();
  return ROASTER_KEYWORDS.some((k) => name.includes(k));
}

function milesBetween(lat1, lng1, lat2, lng2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 3958.8;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

// Weighted score: rating + review confidence + roaster bonus
function qualityScore(place) {
  const rating = place?.rating ?? 0;
  const reviews = place?.user_ratings_total ?? 0;

  // Base: rating * confidence
  let score = rating * Math.log10(reviews + 1);

  // BIG boost for roasters
  if (isRoasterCafe(place)) score *= 1.8;

  // Slight penalty for chains (backup, even though we filter them)
  if (isChainCafe(place?.name)) score *= 0.6;

  return score;
}

function dedupeByPlaceId(places) {
  const map = new Map();
  for (const p of places) {
    const id = p?.place_id;
    if (!id) continue;

    // keep the better-scoring entry if duplicates show up
    const prev = map.get(id);
    if (!prev) {
      map.set(id, p);
    } else {
      const prevScore = qualityScore(prev);
      const nextScore = qualityScore(p);
      if (nextScore > prevScore) map.set(id, p);
    }
  }
  return Array.from(map.values());
}

async function geocodeZip(zip) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", zip);
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.length) {
    throw new Error(`Geocode failed: ${data.status}`);
  }

  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

// Nearby Search helper (optionally add keyword)
async function nearbySearch({ lat, lng, radius = 5000, type = "cafe", keyword = "" }) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("type", type);
  if (keyword) url.searchParams.set("keyword", keyword);
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK") {
    throw new Error(`Places failed (${keyword || "no-keyword"}): ${data.status}`);
  }

  return data.results ?? [];
}

export default async function handler(req, res) {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing GOOGLE_MAPS_API_KEY" });
    }

    const zip = String(req.query.zip || "").trim();
    const lat = req.query.lat ? Number(req.query.lat) : null;
    const lng = req.query.lng ? Number(req.query.lng) : null;

    const usingCoords = Number.isFinite(lat) && Number.isFinite(lng);

    let center;
    if (usingCoords) {
      center = { lat, lng };
    } else {
      if (!/^\d{5}$/.test(zip)) {
        return res.status(400).json({ error: "Invalid zip. Expected 5 digits." });
      }
      center = await geocodeZip(zip);
    }

    // 1) Roaster-first query (keyword)
    const roasterResults = await nearbySearch({
      ...center,
      radius: 7000, // slightly wider net for roasters
      type: "cafe",
      keyword: "coffee roaster roastery", // helps surface roasters
    });

    // 2) Normal cafes query
    const cafeResults = await nearbySearch({
      ...center,
      radius: 5000,
      type: "cafe",
      keyword: "coffee", // optional: keeps results coffee-relevant
    });

    // Merge → dedupe → hard filter chains
    const merged = dedupeByPlaceId([...roasterResults, ...cafeResults])
      .filter((p) => !isChainCafe(p?.name));

    // Rank with roaster boost, then slice
    const ranked = merged
      .map((p) => ({ ...p, score: qualityScore(p) }))
      .sort((a, b) => b.score - a.score);

    const cafes = ranked.slice(0, 12).map((p, idx) => {
      const plat = p.geometry?.location?.lat;
      const plng = p.geometry?.location?.lng;

      let distance = "—";
      if (typeof plat === "number" && typeof plng === "number") {
        const miles = milesBetween(center.lat, center.lng, plat, plng);
        distance = `${miles.toFixed(1)} mi`;
      }

      return {
        id: p.place_id || idx,
        name: p.name || "Unknown cafe",
        address: p.vicinity || p.formatted_address || "Address unavailable",
        distance,
        placeId: p.place_id || null,
        rating: p.rating ?? null,
        user_ratings_total: p.user_ratings_total ?? null,
        isRoaster: isRoasterCafe(p),          // ✅ helpful for UI badges
        qualityScore: p.score ?? null,
        location: { lat: plat, lng: plng },
      };
    });

    res.status(200).json({ zip: usingCoords ? null : zip, cafes });
  } catch (err) {
    console.error("❌ Cafe API Error:", err);
    res.status(500).json({ error: "Failed to fetch cafes" });
  }
}
