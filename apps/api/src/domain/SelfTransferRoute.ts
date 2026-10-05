import type { FlightOffer } from "./FlightOffer.js";

export interface SelfTransferRoute {
  firstLeg: FlightOffer;
  secondLeg: FlightOffer;

  intermediateAirport: string;

  connectionMinutes: number;

  totalPrice: number;
  currency: string;

  selfTransfer: true;

  warnings: string[];
}