"use client";

import { FormEvent, useState } from "react";

interface FlightOffer {
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

interface SelfTransferRoute {
  firstLeg: FlightOffer;
  secondLeg: FlightOffer;
  intermediateAirport: string;
  connectionMinutes: number;
  totalPrice: number;
  currency: string;
  selfTransfer: true;
  warnings: string[];
}

interface SearchResponse {
  search: {
    origin: string;
    destination: string;
    date: string;
    passengers: number;
  };
  count: number;
  routes: SelfTransferRoute[];
}

function formatConnection(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

function formatLocalTime(date: string) {
  const match = date.match(/T(\d{2}):(\d{2})/);

  if (!match) {
    return date;
  }

  return `${match[1]}:${match[2]}`;
}

export default function Home() {
  const [origin, setOrigin] = useState("JFK");
  const [destination, setDestination] = useState("TLV");
  const [date, setDate] = useState("2026-11-10");
  const [passengers, setPassengers] = useState(1);

  const [routes, setRoutes] = useState<SelfTransferRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setHasSearched(true);
    setRoutes([]);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:3001";

      const response = await fetch(`${apiUrl}/search`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          origin,
          destination,
          date,
          passengers,
        }),
      });

      const data = (await response.json()) as
        | SearchResponse
        | { error: string };

      if (!response.ok) {
        throw new Error(
          "error" in data
            ? data.error
            : "Unable to search flights."
        );
      }

      const searchResponse = data as SearchResponse;

      setRoutes(searchResponse.routes);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to search flights.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg font-bold text-white">
              F
            </div>

            <div>
              <h1 className="text-lg font-semibold">
                FlightRoute
              </h1>

              <p className="text-xs text-slate-500">
                Self-transfer flight search
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Self-transfer route engine
            </span>

            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              DEMO DATA
            </span>
          </div>

          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Find smarter ways to get there.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Discover lower-cost flight combinations using
            independently ticketed connections through selected
            intermediate airports.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-5 lg:grid-cols-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                From
              </span>

              <input
                required
                value={origin}
                onChange={(event) =>
                  setOrigin(event.target.value.toUpperCase())
                }
                maxLength={3}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none transition focus:border-slate-950"
                placeholder="JFK"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                To
              </span>

              <input
                required
                value={destination}
                onChange={(event) =>
                  setDestination(
                    event.target.value.toUpperCase()
                  )
                }
                maxLength={3}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none transition focus:border-slate-950"
                placeholder="TLV"
              />
            </label>

            <label className="block lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                Departure
              </span>

              <input
                required
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Travelers
              </span>

              <input
                required
                type="number"
                min={1}
                max={9}
                value={passengers}
                onChange={(event) =>
                  setPassengers(Number(event.target.value))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-950"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Routes may contain separately booked tickets.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-950 px-7 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search flights"}
            </button>
          </div>
        </form>
        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
          <p className="text-sm font-medium text-blue-900">
            Proof-of-concept environment
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-700">
            Flight offers shown in this demo use deterministic mock data.
            The backend uses a provider-agnostic FlightProvider interface
            designed for integration with Duffel, Amadeus, Skyscanner, or
            another flight data provider.
          </p>
        </div>
        <section className="mt-10">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          )}

          {!error &&
            !loading &&
            !hasSearched && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="font-medium text-slate-700">
                  Search results will appear here.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Try JFK → TLV on November 10, 2026.
                </p>
              </div>
            )}

          {!error &&
            !loading &&
            hasSearched &&
            routes.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <p className="font-medium text-slate-700">
                  No self-transfer routes found.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Try another origin, destination or date.
                </p>
              </div>
            )}

          {routes.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    SEARCH RESULTS
                  </p>

                  <h3 className="mt-1 text-2xl font-semibold">
                    {routes.length} self-transfer routes
                  </h3>
                </div>

                <p className="text-sm text-slate-500">
                  Sorted by total price
                </p>
              </div>

              {routes.map((route, index) => {
                const differenceFromBest =
                  route.totalPrice - routes[0].totalPrice;

                return (
                  <article
                    key={`${route.firstLeg.id}-${route.secondLeg.id}`}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          {index === 0 && (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              BEST PRICE
                            </span>
                          )}

                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            SELF-TRANSFER
                          </span>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3 text-xl font-semibold sm:text-2xl">
                          <span>{route.firstLeg.origin}</span>

                          <span className="text-slate-300">→</span>

                          <span>
                            {route.intermediateAirport}
                          </span>

                          <span className="text-slate-300">→</span>

                          <span>
                            {route.secondLeg.destination}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {formatConnection(
                            route.connectionMinutes
                          )}{" "}
                          connection in{" "}
                          {route.intermediateAirport}
                        </p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              First flight
                            </p>

                            <p className="mt-2 font-semibold">
                              {route.firstLeg.airline}{" "}
                              {route.firstLeg.flightNumber}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {route.firstLeg.origin}{" "}
                              {formatLocalTime(
                                route.firstLeg.departureAt
                              )}{" "}
                              →{" "}
                              {
                                route.firstLeg
                                  .destination
                              }{" "}
                              {formatLocalTime(
                                route.firstLeg.arrivalAt
                              )}
                            </p>

                            <p className="mt-2 text-sm font-medium">
                              {route.currency}{" "}
                              {route.firstLeg.price}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Second flight
                            </p>

                            <p className="mt-2 font-semibold">
                              {route.secondLeg.airline}{" "}
                              {route.secondLeg.flightNumber}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {route.secondLeg.origin}{" "}
                              {formatLocalTime(
                                route.secondLeg.departureAt
                              )}{" "}
                              →{" "}
                              {
                                route.secondLeg
                                  .destination
                              }{" "}
                              {formatLocalTime(
                                route.secondLeg.arrivalAt
                              )}
                            </p>

                            <p className="mt-2 text-sm font-medium">
                              {route.currency}{" "}
                              {route.secondLeg.price}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="min-w-40 border-t border-slate-100 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 lg:text-right">
                        <p className="text-sm text-slate-500">
                          Total
                        </p>

                        <p className="mt-1 text-3xl font-bold">
                          ${route.totalPrice}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {route.currency}
                        </p>
                        {index > 0 && (
                          <p className="mt-3 text-xs font-medium text-slate-500">
                            +${differenceFromBest} vs. best price
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <p className="text-sm font-medium text-amber-800">
                        ⚠ Separate tickets · Self-transfer ·
                        Missed connections may not be protected
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold">
              Route discovery
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Candidate intermediate airports are evaluated to build
              independent two-leg itineraries.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold">
              Connection validation
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Invalid connections are discarded using minimum and maximum
              connection-time constraints.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold">
              Price ranking
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Separate ticket prices are combined and valid routes are
              automatically ranked by total price.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}