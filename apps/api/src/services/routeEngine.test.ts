import { describe, expect, it } from "vitest";

import { mockFlights } from "../data/mockFlights.js";
import { findSelfTransferRoutes } from "./routeEngine.js";

describe("findSelfTransferRoutes", () => {
  it("finds valid self-transfer routes", () => {
    const routes = findSelfTransferRoutes(mockFlights, "JFK", "TLV");

    expect(routes).toHaveLength(3);
  });

  it("sorts routes by total price", () => {
    const routes = findSelfTransferRoutes(mockFlights, "JFK", "TLV");

    expect(routes[0]?.intermediateAirport).toBe("ATH");
    expect(routes[0]?.totalPrice).toBe(615);

    expect(routes[1]?.intermediateAirport).toBe("IST");
    expect(routes[1]?.totalPrice).toBe(680);

    expect(routes[2]?.intermediateAirport).toBe("FCO");
    expect(routes[2]?.totalPrice).toBe(720);
  });

  it("calculates connection time correctly", () => {
    const routes = findSelfTransferRoutes(mockFlights, "JFK", "TLV");

    const athRoute = routes.find(
      (route) => route.intermediateAirport === "ATH",
    );

    expect(athRoute?.connectionMinutes).toBe(260);
  });

  it("marks routes as self-transfer", () => {
    const routes = findSelfTransferRoutes(mockFlights, "JFK", "TLV");

    expect(routes.every((route) => route.selfTransfer === true)).toBe(true);
  });

  it("returns no routes when no combination exists", () => {
    const routes = findSelfTransferRoutes(mockFlights, "LAX", "TLV");

    expect(routes).toHaveLength(0);
  });
});
