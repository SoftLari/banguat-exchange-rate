#!/usr/bin/env node

import { BanguatService } from "../banguat-service";

const service = new BanguatService();

function printUsage() {
  console.log(`
Banguat Exchange Rate CLI

Usage:
  banguat current                     Get current exchange rate
  banguat date <YYYY-MM-DD>          Get exchange rate for specific date
  banguat range <start> <end>        Get exchange rates for date range
  banguat average <YYYY> <MM>        Get monthly average
  
Examples:
  banguat current
  banguat date 2024-03-20
  banguat range 2024-03-01 2024-03-31
  banguat average 2024 3
`);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatRate(rate: number): string {
  return rate.toFixed(4);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  try {
    switch (command) {
      case "current": {
        const rate = await service.getCurrentRate();
        console.log(`Exchange rate for ${formatDate(rate.date)}:`);
        console.log(`Buy: Q${formatRate(rate.buyRate)}`);
        console.log(`Sell: Q${formatRate(rate.sellRate)}`);
        break;
      }

      case "date": {
        const dateStr = args[1];
        if (!dateStr) {
          console.error("Error: Date is required (YYYY-MM-DD)");
          process.exit(1);
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.error("Error: Invalid date format. Use YYYY-MM-DD");
          process.exit(1);
        }

        const rate = await service.getRateForDay(date);
        console.log(`Exchange rate for ${formatDate(rate.date)}:`);
        console.log(`Buy: Q${formatRate(rate.buyRate)}`);
        console.log(`Sell: Q${formatRate(rate.sellRate)}`);
        break;
      }

      case "range": {
        const startStr = args[1];
        const endStr = args[2];
        if (!startStr || !endStr) {
          console.error("Error: Start and end dates are required (YYYY-MM-DD)");
          process.exit(1);
        }

        const startDate = new Date(startStr);
        const endDate = new Date(endStr);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error("Error: Invalid date format. Use YYYY-MM-DD");
          process.exit(1);
        }

        const result = await service.getRateRange(startDate, endDate);
        console.log(
          `Exchange rates from ${formatDate(result.startDate)} to ${formatDate(
            result.endDate
          )}:`
        );
        result.rates.forEach((rate) => {
          console.log(`\n${formatDate(rate.date)}:`);
          console.log(`Buy: Q${formatRate(rate.buyRate)}`);
          console.log(`Sell: Q${formatRate(rate.sellRate)}`);
        });
        break;
      }

      case "average": {
        const yearStr = args[1];
        const monthStr = args[2];
        if (!yearStr || !monthStr) {
          console.error("Error: Year and month are required");
          process.exit(1);
        }

        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        if (isNaN(year) || isNaN(month)) {
          console.error("Error: Invalid year or month");
          process.exit(1);
        }

        const average = await service.getMonthlyAverage(year, month);
        console.log(
          `Average exchange rate for ${average.year}-${String(
            average.month
          ).padStart(2, "0")}:`
        );
        console.log(`Q${formatRate(average.average)}`);
        break;
      }

      default:
        printUsage();
        if (command) {
          console.error(`\nError: Unknown command '${command}'`);
          process.exit(1);
        }
        break;
    }
  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
