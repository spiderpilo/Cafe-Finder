import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/cafes", (req, res) => {
  const zip = req.query.zip || "";

  const cafes = [
    { id: 1, name: "Coffee Bee", address: "Main St • Long Beach", distance: "0.6 mi" },
    { id: 2, name: "Sunrise Cafe", address: "2nd St • Belmont Shore", distance: "1.1 mi" },
    { id: 3, name: "Harbor Roasters", address: "Pine Ave • Downtown", distance: "1.8 mi" },
    { id: 4, name: "Matcha & Co.", address: "Cherry Ave • Bixby", distance: "2.4 mi" },
  ];

  res.json({ zip, cafes });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
