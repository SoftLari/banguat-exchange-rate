# Banguat Exchange Rate

A TypeScript library for accessing the Banguat (Guatemalan Central Bank) exchange rate SOAP service.

## Installation

```bash
# Install as a library
npm install banguat-exchange-rate

# Install globally to use the CLI
npm install -g banguat-exchange-rate
```

## Library Usage

```typescript
import { BanguatService } from "banguat-exchange-rate";

// Create a new instance
const service = new BanguatService();

// Get current exchange rate
const currentRate = await service.getCurrentRate();
console.log(currentRate);
// {
//   date: Date,
//   buyRate: number,
//   sellRate: number
// }

// Get exchange rate for a specific date
const specificDate = new Date("2024-01-15");
const rateForDay = await service.getRateForDay(specificDate);
console.log(rateForDay);
// {
//   date: Date,
//   buyRate: number,
//   sellRate: number
// }

// Get exchange rates for a date range
const startDate = new Date("2024-01-01");
const endDate = new Date("2024-01-31");
const rates = await service.getRateRange(startDate, endDate);
console.log(rates);
// {
//   startDate: Date,
//   endDate: Date,
//   rates: [
//     {
//       date: Date,
//       buyRate: number,
//       sellRate: number
//     },
//     ...
//   ]
// }

// Get monthly average
const average = await service.getMonthlyAverage(2024, 1);
console.log(average);
// {
//   year: number,
//   month: number,
//   average: number
// }
```

## CLI Usage

The package includes a command-line interface for quick access to exchange rates.

```bash
# Get current exchange rate
banguat current

# Get exchange rate for a specific date
banguat date 2024-03-20

# Get exchange rates for a date range
banguat range 2024-03-01 2024-03-31

# Get monthly average
banguat average 2024 3
```

Example output:

```
$ banguat current
Exchange rate for 2024-03-20:
Buy: Q7.8512
Sell: Q7.8512

$ banguat date 2024-03-01
Exchange rate for 2024-03-01:
Buy: Q7.8500
Sell: Q7.8300

$ banguat range 2024-03-01 2024-03-02
Exchange rates from 2024-03-01 to 2024-03-02:

2024-03-01:
Buy: Q7.8500
Sell: Q7.8300

2024-03-02:
Buy: Q7.8600
Sell: Q7.8400

$ banguat average 2024 3
Average exchange rate for 2024-03:
Q7.8512
```

## Configuration

You can configure the service with custom options:

```typescript
const service = new BanguatService({
  endpoint: "custom-endpoint", // Optional: Custom SOAP endpoint
  timeout: 5000, // Optional: Custom timeout in milliseconds
});
```

## API

### `getCurrentRate()`

Gets the current exchange rate.

### `getRateForDay(date: Date)`

Gets the exchange rate for a specific date. Throws an error if no rate is found for the specified date.

### `getRateRange(startDate: Date, endDate: Date)`

Gets exchange rates for a specific date range.

### `getMonthlyAverage(year: number, month: number)`

Gets the monthly average exchange rate for a specific year and month.

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Build: `npm run build`

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
