export async function getCafesByZip(zip) {

  await new Promise((resolve) => setTimeout(resolve, 600));
  return [
    { id: 1, name: "Coffee Bee", address: "Main St • Long Beach", distance: "0.6 mi" },
    { id: 2, name: "Sunrise Cafe", address: "2nd St • Belmont Shore", distance: "1.1 mi" },
    { id: 3, name: "Harbor Roasters", address: "Pine Ave • Downtown", distance: "1.8 mi" },
    { id: 4, name: "Matcha & Co.", address: "Cherry Ave • Bixby", distance: "2.4 mi" },
  ];
}
