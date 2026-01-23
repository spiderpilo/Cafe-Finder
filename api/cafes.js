// api/cafes.js
export default async function handler(req, res) {
  try {
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "Missing GOOGLE_MAPS_API_KEY" });
    }

    // Helpers
    function milesBetween(lat1, lng1, lat2, lng2) {
      const toRad = (v) => (v * Math.PI) / 180;
      const R = 3958.8;

      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) ** 2;

      return 2 * R * Math.asin(Math.sqrt(a));
    }

    function parseCoords(query) {
      const latRaw = query.lat;
      const lngRaw = query.lng;

      if (latRaw == null || lngRaw == null) return null;

      const lat = Number(latRaw);
      const lng = Number(lngRaw);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      if (lat < -90 || lat > 90) return null;
      if (lng < -180 || lng > 180) return null;

      return { lat, lng };
    }

    async function geocodeZip(zip) {
      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.set("address", zip);
      url.searchParams.set("key", API_KEY);

      const r = await fetch(url);
      const data = await r.json();

      if (data.status !== "OK" || !data.results?.length) {
        throw new Error(`Geocode failed: ${data.status}`);
      }

      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }

    async function nearbyCafes({ lat, lng }) {
      const url = new URL(
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
      );
      url.searchParams.set("location", `${lat},${lng}`);
      url.searchParams.set("radius", "5000");
      url.searchParams.set("type", "cafe");
      url.searchParams.set("keyword", "coffee"); // bias toward coffee spots
      url.searchParams.set("key", API_KEY);

      const r = await fetch(url);
      const data = await r.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Places failed: ${data.status}`);
      }

      return data.results ?? [];
    }

    // Choose center from coords OR zip
    const coords = parseCoords(req.query);
    const zip = String(req.query.zip || "").trim();

    let center = null;

    if (coords) {
      center = coords;
    } else {
      if (!/^\d{5}$/.test(zip)) {
        return res.status(400).json({
          error: "Provide either a valid zip (5 digits) or valid lat & lng.",
        });
      }
      center = await geocodeZip(zip);
    }

    const results = await nearbyCafes(center);

    const cafes = results.slice(0, 12).map((p, idx) => {
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
        location: { lat: plat, lng: plng },
        rating: typeof p.rating === "number" ? p.rating : null,
        user_ratings_total:
          typeof p.user_ratings_total === "number" ? p.user_ratings_total : 0,
      };
    });

    return res.status(200).json({
      zip: coords ? null : zip,
      center,
      cafes,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to fetch cafes",
      details: err?.message || String(err),
    });
  }
}
