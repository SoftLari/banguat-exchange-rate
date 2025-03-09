import { createClientAsync } from "soap";
import {
  ExchangeRateDay,
  ExchangeRateRange,
  ExchangeRateAverage,
  BanguatServiceConfig,
} from "./types";

export class BanguatService {
  private readonly endpoint: string;
  private readonly timeout: number;

  constructor(config?: BanguatServiceConfig) {
    this.endpoint =
      config?.endpoint ??
      "https://www.banguat.gob.gt/variables/ws/tipocambio.asmx?WSDL";
    this.timeout = config?.timeout ?? 10000;
  }

  private async getClient() {
    return createClientAsync(this.endpoint, {});
  }

  private validateResponse<T>(
    response: T | null | undefined,
    errorMessage: string
  ): T {
    if (!response) {
      throw new Error(`Invalid response: ${errorMessage}`);
    }
    return response;
  }

  private formatDateForRequest(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Get the current exchange rate
   * @returns Promise<ExchangeRateDay>
   */
  async getCurrentRate(): Promise<ExchangeRateDay> {
    try {
      const client = await this.getClient();
      const [result] = await client.TipoCambioDiaAsync({});

      const tipoCambioResult = this.validateResponse(
        result?.TipoCambioDiaResult,
        "Missing TipoCambioDiaResult"
      );

      const cambioDolar = this.validateResponse(
        tipoCambioResult?.CambioDolar,
        "Missing CambioDolar data"
      );

      const varDolar = this.validateResponse(
        cambioDolar?.VarDolar?.[0],
        "Missing or invalid VarDolar data"
      );

      const fecha = this.validateResponse(
        varDolar?.fecha,
        "Missing date in response"
      );

      const referencia = this.validateResponse(
        varDolar?.referencia,
        "Missing reference rate in response"
      );
      const [day, month, year] = fecha.split("/").map(Number);
      const date = new Date(year, month - 1, day);
      return {
        date,
        buyRate: parseFloat(referencia),
        sellRate: parseFloat(referencia),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to get current exchange rate");
    }
  }

  /**
   * Get exchange rate for a specific date
   * @param date The date to get the exchange rate for
   * @returns Promise<ExchangeRateDay>
   * @throws Error if no rate is found for the specified date or if date is in the future
   */
  async getRateForDay(date: Date): Promise<ExchangeRateDay> {
    // Validate date is not in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
      throw new Error("Cannot get exchange rate for future dates");
    }

    const result = await this.getRateRange(date, date);
    if (result.rates.length === 0) {
      throw new Error(
        `No exchange rate found for date: ${date.toISOString().split("T")[0]}`
      );
    }
    return result.rates[0];
  }

  /**
   * Get exchange rates for a date range
   * @param startDate Start date
   * @param endDate End date
   * @returns Promise<ExchangeRateRange>
   */
  async getRateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ExchangeRateRange> {
    // Validate dates are not in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate > today || endDate > today) {
      throw new Error("Cannot get exchange rates for future dates");
    }

    try {
      const client = await this.getClient();
      const [result] = await client.TipoCambioRangoAsync({
        fechainit: this.formatDateForRequest(startDate),
        fechafin: this.formatDateForRequest(endDate),
      });

      const tipoCambioResult = this.validateResponse(
        result?.TipoCambioRangoResult,
        "Missing TipoCambioRangoResult"
      );

      // If no data is available, return empty rates array
      if (!tipoCambioResult.Vars || !tipoCambioResult.Vars.Var) {
        return {
          startDate,
          endDate,
          rates: [],
        };
      }

      const vars = tipoCambioResult.Vars.Var;

      if (!Array.isArray(vars)) {
        throw new Error("Invalid exchange rate data format");
      }

      const rates = vars.map((rate) => {
        const fecha = this.validateResponse(
          rate?.fecha,
          "Missing date in rate data"
        );
        const venta = this.validateResponse(
          rate?.venta,
          "Missing buy rate in rate data"
        );
        const compra = this.validateResponse(
          rate?.compra,
          "Missing sell rate in rate data"
        );

        // Parse date from dd/MM/yyyy format
        const [day, month, year] = fecha.split("/").map(Number);
        const date = new Date(year, month - 1, day);

        return {
          date,
          buyRate: parseFloat(venta),
          sellRate: parseFloat(compra),
        };
      });

      return {
        startDate,
        endDate,
        rates,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to get exchange rate range");
    }
  }

  /**
   * Get monthly average exchange rate
   * @param year Year
   * @param month Month (1-12)
   * @returns Promise<ExchangeRateAverage>
   */
  async getMonthlyAverage(
    year: number,
    month: number
  ): Promise<ExchangeRateAverage> {
    if (month < 1 || month > 12) {
      throw new Error("Month must be between 1 and 12");
    }

    try {
      const client = await this.getClient();
      // Format date as dd/MM/yyyy for the first day of the month
      const fechainit = this.formatDateForRequest(new Date(year, month - 1, 1));

      const [result] = await client.TipoCambioFechaInicialAsync({
        fechainit,
      });

      const tipoCambioResult = this.validateResponse(
        result?.TipoCambioFechaInicialResult,
        "Missing TipoCambioFechaInicialResult"
      );

      // If no data is available, return empty rates array
      if (!tipoCambioResult.Vars || !tipoCambioResult.Vars.Var) {
        return {
          year,
          month,
          average: 0,
        };
      }

      const vars = tipoCambioResult.Vars.Var;

      if (!Array.isArray(vars)) {
        throw new Error("Invalid exchange rate data format");
      }

      // Calculate average from all rates in the month
      const total = vars.reduce((sum, rate) => {
        const venta = this.validateResponse(
          rate?.venta,
          "Missing sell rate in rate data"
        );
        return sum + parseFloat(venta);
      }, 0);

      const average = vars.length > 0 ? total / vars.length : 0;

      return {
        year,
        month,
        average,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to get monthly average");
    }
  }
}
