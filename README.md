# @softlari/banguat-exchange-rate

TypeScript library for accessing Banguat (Guatemalan Central Bank) exchange rate SOAP service.

## Installation

Requires a patched Node.js LTS release: **22.23.4+ (22.x)** or **24.22.1+ (24.x)**.
Node.js **24 LTS** is recommended; `mise.toml` pins the current security baseline.
Node.js 18 and 20 are no longer supported.

```bash
npm install @softlari/banguat-exchange-rate
```

## Features

- 🔄 Real-time exchange rates from Banguat
- 📅 Historical exchange rates by date
- 📊 Monthly averages
- 🌐 Timezone aware (Guatemala UTC-6)
- 💻 CLI tool included
- 📘 Full TypeScript support

## Usage

### As a Library

```typescript
import { BanguatService } from "@softlari/banguat-exchange-rate";

const banguat = new BanguatService();

// Get current exchange rate
const current = await banguat.getCurrentRate();
console.log(`Current rate: ${current.buyRate}`);

// Get rate for specific date
const date = new Date("2024-03-01");
const historical = await banguat.getRateForDay(date);
console.log(`Rate for ${date.toISOString()}: ${historical.buyRate}`);

// Get monthly average
const average = await banguat.getMonthlyAverage(2024, 3);
console.log(`March 2024 average: ${average}`);
```

### Using the CLI

```bash
# Install globally
npm install -g @softlari/banguat-exchange-rate

# Get current rate
banguat current

# Get rate for specific date
banguat date 2024-03-01

# Get rates for date range
banguat range 2024-03-01 2024-03-31

# Get monthly average
banguat average 2024 3
```

## API Reference

### `getCurrentRate()`

Returns the current exchange rate.

```typescript
interface ExchangeRateDay {
  date: Date;
  buyRate: number;
  sellRate: number;
}
```

### `getRateForDay(date: Date)`

Returns the exchange rate for a specific date.

### `getRateRange(startDate: Date, endDate: Date)`

Returns exchange rates for a date range.

### `getMonthlyAverage(year: number, month: number)`

Returns the average exchange rate for a specific month.

## Error Handling

The library includes proper error handling for:

- Future dates (not allowed)
- Invalid responses from the service
- Missing data scenarios
- Network errors

## Development

Install [mise](https://mise.jdx.dev/getting-started.html) first. The commands below
use the project's Node.js version without requiring shell activation.

```bash
# Clone the repository
git clone https://github.com/SoftLari/banguat-exchange-rate.git

# Install the Node.js version pinned in mise.toml
mise install

# Install the locked dependencies (npm is the project's package manager)
mise exec -- npm ci

# Check all dependencies, including development tools
mise exec -- npm audit

# Run tests
mise exec -- npm test

# Build
mise exec -- npm run build
```

### Security maintenance

CI tests the latest Node.js 22 and 24 releases and blocks testing/publication when
`npm audit` reports known vulnerabilities. Dependabot checks npm dependencies and
GitHub Actions weekly. `package-lock.json` is the only maintained lockfile.

The runtime baseline includes the [October 2026 Node.js security fixes](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).
Keep production Node.js installations updated too: updating this library does not
upgrade the runtime on your server.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © SoftLari
