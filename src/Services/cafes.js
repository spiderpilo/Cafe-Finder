export async function getCafesByZip(zip) {
  const res = await fetch(`http://localhost:3001/api/cafes?zip=${zip}`);

  if (!res.ok) {
    throw new Error("Failed to fetch cafes");
  }

  const data = await res.json();
  return data.cafes;
}
