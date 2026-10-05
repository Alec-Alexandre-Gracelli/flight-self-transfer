import type { FlightOffer } from "../domain/FlightOffer.js";
import type { SearchRequest } from "../domain/SearchRequest.js";

export interface FlightProvider {
  searchFlights(request: SearchRequest): Promise<FlightOffer[]>;
}
