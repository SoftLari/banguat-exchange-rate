# Banguat Exchange Rate

[![npm version](https://img.shields.io/npm/v/%40softlari%2Fbanguat-exchange-rate)](https://www.npmjs.com/package/@softlari/banguat-exchange-rate)
[![Tests](https://github.com/SoftLari/banguat-exchange-rate/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/SoftLari/banguat-exchange-rate/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Access Banco de Guatemala's USD/GTQ exchange-rate SOAP service from TypeScript,
JavaScript, or the terminal. Includes TypeScript declarations, historical queries,
and a CLI. This is a community library, not an official Banco de Guatemala SDK.

[Quick start](#quick-start) · [CLI](#cli) · [API](#api) · [Limitations](#limitations) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)

## Requirements

- **Node.js 24.22.1+ (24.x)**, recommended, or **22.23.4+ (22.x)**.
- Network access to [Banguat's SOAP service](https://www.banguat.gob.gt/variables/ws/tipocambio.asmx?WSDL).

Version 2 drops support for Node.js 18 and 20. Upgrade your runtime before updating
from 1.x. The public library and CLI APIs are unchanged.

## Quick start

```bash
npm install @softlari/banguat-exchange-rate
```

```typescript
import { BanguatService } from "@softlari/banguat-exchange-rate";

async function main() {
  const banguat = new BanguatService();
  const current = await banguat.getCurrentRate();

  console.log(current.date.toDateString());
  console.log(`Reference rate: Q${current.buyRate.toFixed(4)} per USD`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

CommonJS applications can use `const { BanguatService } = require("@softlari/banguat-exchange-rate")`.
The package ships compiled JavaScript and type declarations; consumers do not need
to build it from source. Requests fetch data from Banguat, not bundled sample data.

## CLI

```bash
npm install --global @softlari/banguat-exchange-rate

banguat current
banguat date 2024-03-01
banguat range 2024-03-01 2024-03-31
banguat average 2024 3
```

Run `banguat` without arguments to see usage. Dates use `YYYY-MM-DD`; months use
`1` through `12`. Output is human-readable, with rates rounded to four decimal
places. Errors are written to stderr with exit code `1`.

## API

All service methods return promises. Import the service and result types from
`@softlari/banguat-exchange-rate`.

| Method | Resolves to | Behavior |
| --- | --- | --- |
| `getCurrentRate()` | `ExchangeRateDay` | Reads the current reference rate; both rate fields contain `referencia`. |
| `getRateForDay(date)` | `ExchangeRateDay` | Queries one day; rejects if no rate is returned. |
| `getRateRange(startDate, endDate)` | `ExchangeRateRange` | Returns the service's records; `rates` is empty when no records are available. |
| `getMonthlyAverage(year, month)` | `ExchangeRateAverage` | Averages records returned from the first day of the requested month; see [limitations](#limitations). |

### Historical queries

Inside an async function, using the `banguat` instance above:

```typescript
const day = await banguat.getRateForDay(new Date("2024-03-01T00:00:00Z"));
const range = await banguat.getRateRange(
  new Date("2024-03-01T00:00:00Z"),
  new Date("2024-03-31T00:00:00Z")
);
const monthly = await banguat.getMonthlyAverage(2024, 3);

console.log(day.buyRate, range.rates.length, monthly.average);
```

### Result types

```typescript
interface ExchangeRateDay {
  date: Date;
  buyRate: number;
  sellRate: number;
}

interface ExchangeRateRange {
  startDate: Date;
  endDate: Date;
  rates: ExchangeRateDay[];
}

interface ExchangeRateAverage {
  year: number;
  month: number;
  average: number;
}
```

Rates are JavaScript numbers, not decimal-money objects. Apply any precision and
rounding rules required by your application.

### Configuration

`new BanguatService(config?: BanguatServiceConfig)` accepts:

| Option | Default | Behavior |
| --- | --- | --- |
| `endpoint` | Banguat WSDL linked above | Overrides the WSDL URL, for example for a local test service. Only use trusted endpoints. |
| `timeout` | `10000` | Currently stored but **not applied** to SOAP requests; do not rely on it to enforce a deadline. |

### Errors and missing data

Network, WSDL, and SOAP errors reject the promise. Missing required response fields
produce `Invalid response: ...` errors. The monthly helper rejects months outside
`1..12`, but returns `average: 0` if the service returns no records; this is not an
observed zero exchange rate. Validate inputs and handle missing data in your app.

## Limitations

- **Monthly boundaries:** `getMonthlyAverage` calls `TipoCambioFechaInicial` with
  a start date only. It does not filter the response to the requested month, so
  do not assume it calculates a closed historical month's average.
- **Dates and time zones:** day/range requests use UTC date components, while
  returned dates and the monthly helper's first-day date use the process's local
  time zone. There is no automatic `America/Guatemala` conversion. Prefer explicit
  UTC inputs for day/range queries and account for the host time zone on output.
- **Historical field mapping:** `buyRate` currently maps to Banguat's `venta`, and
  `sellRate` to `compra`. Verify this mapping before treating them as bid/ask prices.
- **Input validation:** future dates, invalid `Date` objects, and reversed ranges
  are not explicitly rejected by the library. Validate them before calling it.
- **Availability:** calls depend on the upstream service. There is no built-in
  retry policy or enforced configurable timeout. Local tests do not establish
  Banguat's live availability.

## Development and support

See [CONTRIBUTING.md](CONTRIBUTING.md) for the mise-based setup, test commands, and
source map. Use [GitHub issues](https://github.com/SoftLari/banguat-exchange-rate/issues)
for reproducible bugs and feature proposals. For suspected vulnerabilities, follow
[SECURITY.md](SECURITY.md) instead of posting exploit details publicly.

Releases and migration notes are in the [changelog](CHANGELOG.md) and
[GitHub releases](https://github.com/SoftLari/banguat-exchange-rate/releases).

## License

[MIT](LICENSE).
