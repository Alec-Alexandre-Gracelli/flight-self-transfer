import express from "express";
import cors from "cors";

import { MockFlightProvider } from "./providers/MockFlightProvider.js";
import { SearchService } from "./services/searchService.js";

const app = express();

const PORT = 3001;

const flightProvider = new MockFlightProvider();
const searchService = new SearchService(flightProvider);

app.use(cors());
app.use(express.json());

/**
 * Health check
 */
app.get("/health", (_req, res) => {
  return res.json({
    status: "ok",
    service: "flight-self-transfer-api",
  });
});

/**
 * Search for self-transfer routes
 */
app.post("/search", async (req, res) => {
  const { origin, destination, date, passengers } = req.body;

  /**
   * Required fields validation
   */
  if (
    !origin ||
    !destination ||
    !date ||
    passengers === undefined ||
    passengers === null
  ) {
    return res.status(400).json({
      error: "origin, destination, date and passengers are required",
    });
  }

  /**
   * Normalize input
   */
  const normalizedOrigin = String(origin).trim().toUpperCase();

  const normalizedDestination = String(destination).trim().toUpperCase();

  const normalizedDate = String(date).trim();

  const normalizedPassengers = Number(passengers);

  /**
   * Origin and destination cannot be the same
   */
  if (normalizedOrigin === normalizedDestination) {
    return res.status(400).json({
      error: "origin and destination must be different",
    });
  }

  /**
   * Date must use YYYY-MM-DD
   */
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
    return res.status(400).json({
      error: "date must use YYYY-MM-DD format",
    });
  }

  /**
   * Passenger validation
   */
  if (
    !Number.isInteger(normalizedPassengers) ||
    normalizedPassengers < 1 ||
    normalizedPassengers > 9
  ) {
    return res.status(400).json({
      error: "passengers must be an integer between 1 and 9",
    });
  }

  /**
   * Execute search
   */
  const routes = await searchService.search({
    origin: normalizedOrigin,
    destination: normalizedDestination,
    date: normalizedDate,
    passengers: normalizedPassengers,
  });

  /**
   * API response
   */
  return res.json({
    search: {
      origin: normalizedOrigin,
      destination: normalizedDestination,
      date: normalizedDate,
      passengers: normalizedPassengers,
    },
    count: routes.length,
    routes,
  });
});

/**
 * Start HTTP server
 */
app.listen(PORT, () => {
  console.log(`Flight API running on http://localhost:${PORT}`);
});
