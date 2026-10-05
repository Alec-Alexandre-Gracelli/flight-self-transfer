import type { FlightProvider } from "./FlightProvider.js";
import type { FlightOffer } from "../domain/FlightOffer.js";
import type { SearchRequest } from "../domain/SearchRequest.js";

import { mockFlights } from "../data/mockFlights.js";

export class MockFlightProvider implements FlightProvider {
  async searchFlights(request: SearchRequest): Promise<FlightOffer[]> {
    const requestedDate = request.date;

    return mockFlights.filter((flight) => {
      const departureDate = flight.departureAt.slice(0, 10);

      return departureDate >= requestedDate;
    });
  }
}
