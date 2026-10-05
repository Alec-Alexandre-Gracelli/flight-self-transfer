import type { FlightOffer } from "../domain/FlightOffer.js";
import type { SelfTransferRoute } from "../domain/SelfTransferRoute.js";

const MIN_CONNECTION_MINUTES = 180;
const MAX_CONNECTION_MINUTES = 720;

export function findSelfTransferRoutes(
  flights: FlightOffer[],
  origin: string,
  destination: string,
): SelfTransferRoute[] {
  const routes: SelfTransferRoute[] = [];

  const firstLegs = flights.filter((flight) => flight.origin === origin);

  for (const firstLeg of firstLegs) {
    const secondLegs = flights.filter(
      (flight) =>
        flight.origin === firstLeg.destination &&
        flight.destination === destination,
    );

    for (const secondLeg of secondLegs) {
      const arrival = new Date(firstLeg.arrivalAt);
      const departure = new Date(secondLeg.departureAt);

      const connectionMinutes =
        (departure.getTime() - arrival.getTime()) / 60000;

      if (
        connectionMinutes < MIN_CONNECTION_MINUTES ||
        connectionMinutes > MAX_CONNECTION_MINUTES
      ) {
        continue;
      }

      if (firstLeg.currency !== secondLeg.currency) {
        continue;
      }

      routes.push({
        firstLeg,
        secondLeg,
        intermediateAirport: firstLeg.destination,
        connectionMinutes,
        totalPrice: firstLeg.price + secondLeg.price,
        currency: firstLeg.currency,
        selfTransfer: true,
        warnings: [
          "Separate tickets",
          "Self-transfer connection",
          "Missed connections may not be protected",
        ],
      });
    }
  }

  return routes.sort((a, b) => a.totalPrice - b.totalPrice);
}
