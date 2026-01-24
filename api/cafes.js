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
  "7 leaves",
  "am pm",
  "costa coffee",
  "gloria jean's",
  "tully's",
  "biggby",
  "diedrich",
  "diedrich coffee",
  "lavazza",
  "segafredo",
];

function isChainCafe(name = "") {
  const n = String(name).toLowerCase();
  return CHAIN_KEYWORDS.some((k) => n.includes(k));
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

async function nearbyCafes({ lat, lng }) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", "5000");
  url.searchParams.set("type", "cafe");
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK") {
    throw new Error(`Places failed: ${data.status}`);
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

    const results = await nearbyCafes(center);

    // ✅ HARD FILTER OUT CHAINS BEFORE SLICING
    const filtered = results.filter((p) => !isChainCafe(p?.name));


    const cafes = filtered.slice(0, 10).map((p, idx) => {
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
        location: { lat: plat, lng: plng },
      };
    });

    res.status(200).json({ zip: usingCoords ? null : zip, cafes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cafes" });
  }
}
