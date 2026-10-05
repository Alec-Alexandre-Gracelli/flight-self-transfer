import { describe, expect, it } from "vitest";

import { SearchService } from "./searchService.js";
import { MockFlightProvider } from "../providers/MockFlightProvider.js";

describe("SearchService", () => {
  it("searches flights through the provider and builds routes", async () => {
    const provider = new MockFlightProvider();
    const service = new SearchService(provider);

    const routes = await service.search({
      origin: "JFK",
      destination: "TLV",
      date: "2026-11-10",
      passengers: 1,
    });

    expect(routes).toHaveLength(3);

    expect(routes[0]?.intermediateAirport).toBe("ATH");
    expect(routes[0]?.totalPrice).toBe(615);

    expect(routes[1]?.intermediateAirport).toBe("IST");
    expect(routes[1]?.totalPrice).toBe(680);

    expect(routes[2]?.intermediateAirport).toBe("FCO");
    expect(routes[2]?.totalPrice).toBe(720);
  });

  it("returns no routes for a date after the mock flights", async () => {
    const provider = new MockFlightProvider();
    const service = new SearchService(provider);

    const routes = await service.search({
      origin: "JFK",
      destination: "TLV",
      date: "2026-12-01",
      passengers: 1,
    });

    expect(routes).toHaveLength(0);
  });
});