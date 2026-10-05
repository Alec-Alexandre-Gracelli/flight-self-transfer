import express from "express";
import cors from "cors";

import { mockFlights } from "./data/mockFlights.js";
import { findSelfTransferRoutes } from "./services/routeEngine.js";

const app = express();

const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "flight-self-transfer-api",
  });
});

app.post("/search", (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({
      error: "origin and destination are required",
    });
  }

  const normalizedOrigin = String(origin).trim().toUpperCase();
  const normalizedDestination = String(destination).trim().toUpperCase();

  if (normalizedOrigin === normalizedDestination) {
    return res.status(400).json({
      error: "origin and destination must be different",
    });
  }

  const routes = findSelfTransferRoutes(
    mockFlights,
    normalizedOrigin,
    normalizedDestination,
  );

  return res.json({
    search: {
      origin: normalizedOrigin,
      destination: normalizedDestination,
    },
    count: routes.length,
    routes,
  });
});

app.listen(PORT, () => {
  console.log(`Flight API running on http://localhost:${PORT}`);
});
