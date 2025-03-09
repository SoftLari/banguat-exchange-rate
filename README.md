# @softlari/banguat-exchange-rate

TypeScript library for accessing Banguat (Guatemalan Central Bank) exchange rate SOAP service.

## Installation

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

```bash
# Clone the repository
git clone https://github.com/SoftLari/banguat-exchange-rate.git

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © SoftLari
