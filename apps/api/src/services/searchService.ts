import type { FlightProvider } from "../providers/FlightProvider.js";
import type { SearchRequest } from "../domain/SearchRequest.js";
import type { SelfTransferRoute } from "../domain/SelfTransferRoute.js";

import { findSelfTransferRoutes } from "./routeEngine.js";

export class SearchService {
  constructor(
    private readonly flightProvider: FlightProvider
  ) {}

  async search(
    request: SearchRequest
  ): Promise<SelfTransferRoute[]> {
    const flights =
      await this.flightProvider.searchFlights(request);

    return findSelfTransferRoutes(
      flights,
      request.origin,
      request.destination
    );
  }
}