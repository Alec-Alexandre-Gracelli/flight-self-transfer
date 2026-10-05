# Flight Self-Transfer Search

A full-stack proof of concept for discovering and ranking flight itineraries built from independently ticketed flight segments.

The application searches for valid two-leg routes through intermediate airports, validates the connection window, combines the prices of separate tickets, and ranks the resulting self-transfer itineraries by total price.

> **Proof of Concept**
>
> The current version uses deterministic mock flight data. The flight-data layer is provider-agnostic and designed so that a production provider such as Duffel, Amadeus, Skyscanner, or another flight API can be integrated without changing the core route engine.

## Demo

Example search:

```text
Origin:       JFK
Destination:  TLV
Date:         2026-11-10
Passengers:   1
```

Current demo results:

| Route | Connection | Total price |
|---|---:|---:|
| JFK → ATH → TLV | 4h 20m | USD 615 |
| JFK → IST → TLV | 3h 35m | USD 680 |
| JFK → FCO → TLV | 4h 15m | USD 720 |

The results are automatically sorted by total price.

## Core Features

- Automatic discovery of two-leg self-transfer routes
- Intermediate-airport matching
- Connection-time calculation
- Minimum and maximum connection validation
- Separate-ticket price aggregation
- Automatic ranking by total price
- Currency consistency validation
- Self-transfer risk warnings
- Provider-independent flight-data architecture
- REST search API
- Responsive Next.js search interface
- Automated tests for the routing and search layers

## Architecture

```text
┌──────────────────────────────┐
│      Next.js Web App         │
│   Search form + results UI   │
└──────────────┬───────────────┘
               │
               │ POST /search
               ▼
┌──────────────────────────────┐
│       Express REST API       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        SearchService         │
│ Orchestrates flight search   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       FlightProvider         │
│         interface            │
└──────────────┬───────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
 MockFlightProvider   Production provider
   implemented        Duffel / Amadeus /
                      Skyscanner / other
        │
        ▼
   FlightOffer[]
        │
        ▼
┌──────────────────────────────┐
│         RouteEngine          │
│                              │
│  candidate route discovery   │
│  connection validation       │
│  price aggregation           │
│  price ranking               │
└──────────────┬───────────────┘
               │
               ▼
      SelfTransferRoute[]
```

The important architectural boundary is `FlightProvider`.

The routing algorithm does not depend directly on a specific external flight API. A provider implementation is responsible for converting external flight data into the application's internal `FlightOffer` representation.

This keeps provider-specific concerns separate from the self-transfer routing logic.

## Self-Transfer Route Logic

For a requested origin `O` and destination `D`, the engine:

1. Finds candidate first legs departing from `O`.
2. Uses each first-leg destination as a possible intermediate airport `I`.
3. Searches for a second leg from `I` to `D`.
4. Calculates the connection duration between both flights.
5. Rejects connections outside the configured connection window.
6. Rejects incompatible currencies.
7. Combines the prices of both independently ticketed flights.
8. Creates a self-transfer itinerary with appropriate warnings.
9. Sorts all valid itineraries by total price.

Conceptually:

```text
O → I
    +
    I → D

    ↓

O → I → D
```

and:

```text
totalPrice =
  firstLeg.price +
  secondLeg.price
```

## Self-Transfer Considerations

Self-transfer itineraries differ from protected connecting itineraries.

The current PoC explicitly warns users that:

- tickets may be purchased separately;
- the connection is a self-transfer;
- missed onward flights may not be protected by the airlines.

A production implementation can extend the routing rules with airport-specific minimum connection times, baggage requirements, terminal changes, immigration requirements, overnight connections, visa constraints, and provider-specific booking information.

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- TypeScript
- Express

### Testing

- Vitest

### Planned production infrastructure

- PostgreSQL for persistent application and analytics data
- Redis for caching flight-search results
- External flight-data provider integration
- Cloud deployment

## Repository Structure

```text
flight-self-transfer/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── data/
│   │       ├── domain/
│   │       ├── providers/
│   │       ├── services/
│   │       └── server.ts
│   │
│   └── web/
│       ├── app/
│       └── public/
│
├── packages/
│   └── shared/
│
├── docs/
├── .env.example
├── README.md
└── package.json
```

## Running Locally

### Requirements

- Node.js
- npm

### Install the API

```bash
cd apps/api
npm install
```

Start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:3001
```

Health check:

```text
GET /health
```

### Install the Web Application

Open another terminal:

```bash
cd apps/web
npm install
```

Create the local environment file from:

```text
.env.example
```

with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Then start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Search API

### Request

```http
POST /search
Content-Type: application/json
```

Example body:

```json
{
  "origin": "JFK",
  "destination": "TLV",
  "date": "2026-11-10",
  "passengers": 1
}
```

### Response

The API returns the normalized search parameters and the valid self-transfer routes:

```json
{
  "search": {
    "origin": "JFK",
    "destination": "TLV",
    "date": "2026-11-10",
    "passengers": 1
  },
  "count": 3,
  "routes": []
}
```

Each route contains both flight legs, the intermediate airport, connection duration, combined price, currency, and self-transfer warnings.

## Validation

The API currently validates:

- required search parameters;
- different origin and destination airports;
- `YYYY-MM-DD` date format;
- passenger count between 1 and 9.

## Automated Tests

Run:

```bash
cd apps/api
npm test
```

Current test suite:

```text
Test Files: 2 passed
Tests:      7 passed
```

The tests cover the route engine and the provider/search-service integration.

TypeScript validation:

```bash
npx tsc --noEmit
```

Frontend production validation:

```bash
cd apps/web
npm run build
```

## Flight Provider Integration

Flight data access is abstracted behind:

```ts
interface FlightProvider {
  searchFlights(
    request: SearchRequest
  ): Promise<FlightOffer[]>;
}
```

The PoC currently provides:

```text
FlightProvider
      │
      └── MockFlightProvider
```

A production integration can add another implementation:

```text
FlightProvider
      │
      ├── MockFlightProvider
      │
      └── ProductionFlightProvider
```

without coupling the route engine to the external API.

This allows provider selection to be based on commercial coverage, API access, booking requirements, rate limits, geographic availability, and the client's existing provider agreements.

## Current Scope

This repository demonstrates the core technical workflow of self-transfer flight discovery.

It is not currently a booking engine and does not claim to provide live airfare.

The current PoC focuses on:

```text
flight data
    ↓
route discovery
    ↓
connection validation
    ↓
price aggregation
    ↓
ranking
    ↓
web presentation
```

## Production Roadmap

Potential next milestones include:

1. Real flight-data provider integration
2. Expanded route generation and configurable intermediate airports
3. Airport-specific connection rules
4. PostgreSQL persistence
5. Redis caching and provider rate-limit protection
6. Search analytics
7. Booking/deep-link integration
8. Improved itinerary risk scoring
9. Monitoring and observability
10. Production deployment