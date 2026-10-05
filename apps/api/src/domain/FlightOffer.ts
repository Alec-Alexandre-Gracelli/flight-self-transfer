export interface FlightOffer {
  id: string;

  origin: string;
  destination: string;

  departureAt: string;
  arrivalAt: string;

  airline: string;
  flightNumber: string;

  price: number;
  currency: string;

  provider: string;
}