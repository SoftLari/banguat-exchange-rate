import { BanguatService } from "./banguat-service";
import * as soap from "soap";

jest.mock("soap", () => ({
  createClientAsync: jest.fn(),
}));

describe("BanguatService", () => {
  let service: BanguatService;
  let mockClient: any;

  function createTestDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  beforeEach(() => {
    mockClient = {
      TipoCambioDiaAsync: jest.fn(),
      TipoCambioRangoAsync: jest.fn(),
      TipoCambioFechaInicialAsync: jest.fn(),
    };
    (soap.createClientAsync as jest.Mock).mockResolvedValue(mockClient);
    service = new BanguatService();

    // Reset date to a fixed value for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(createTestDate("2024-03-20"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe("getCurrentRate", () => {
    it("should return current exchange rate", async () => {
      const mockResponse = {
        TipoCambioDiaResult: {
          CambioDolar: {
            VarDolar: [
              {
                fecha: "20/03/2024",
                referencia: "7.85123",
              },
            ],
          },
        },
      };

      mockClient.TipoCambioDiaAsync.mockResolvedValue([mockResponse]);

      const result = await service.getCurrentRate();

      expect(result).toEqual({
        date: createTestDate("2024-03-20"),
        buyRate: 7.85123,
        sellRate: 7.85123,
      });
      expect(mockClient.TipoCambioDiaAsync).toHaveBeenCalledWith({});
    });

    it("should handle missing data", async () => {
      const mockResponse = {
        TipoCambioDiaResult: {},
      };

      mockClient.TipoCambioDiaAsync.mockResolvedValue([mockResponse]);

      await expect(service.getCurrentRate()).rejects.toThrow(
        "Invalid response: Missing CambioDolar data"
      );
    });
  });

  describe("getRateForDay", () => {
    it("should return exchange rate for a specific date", async () => {
      const date = createTestDate("2024-03-01");
      const mockResponse = {
        TipoCambioRangoResult: {
          Vars: {
            Var: [
              {
                fecha: "01/03/2024",
                venta: "7.85",
                compra: "7.83",
              },
            ],
          },
        },
      };

      mockClient.TipoCambioRangoAsync.mockResolvedValue([mockResponse]);

      const result = await service.getRateForDay(date);

      expect(result).toEqual({
        date: createTestDate("2024-03-01"),
        buyRate: 7.85,
        sellRate: 7.83,
      });
      expect(mockClient.TipoCambioRangoAsync).toHaveBeenCalledWith({
        fechainit: "01/03/2024",
        fechafin: "01/03/2024",
      });
    });

    it("should throw error when no rate is found", async () => {
      const date = createTestDate("2024-03-01");
      const mockResponse = {
        TipoCambioRangoResult: {
          Vars: {
            Var: [],
          },
        },
      };

      mockClient.TipoCambioRangoAsync.mockResolvedValue([mockResponse]);

      await expect(service.getRateForDay(date)).rejects.toThrow(
        "No exchange rate found for date: 2024-03-01"
      );
    });
  });

  describe("getRateRange", () => {
    it("should return exchange rates for date range", async () => {
      const startDate = createTestDate("2024-03-01");
      const endDate = createTestDate("2024-03-02");
      const mockResponse = {
        TipoCambioRangoResult: {
          Vars: {
            Var: [
              {
                fecha: "01/03/2024",
                venta: "7.85",
                compra: "7.83",
              },
              {
                fecha: "02/03/2024",
                venta: "7.86",
                compra: "7.84",
              },
            ],
          },
        },
      };

      mockClient.TipoCambioRangoAsync.mockResolvedValue([mockResponse]);

      const result = await service.getRateRange(startDate, endDate);

      expect(result).toEqual({
        startDate,
        endDate,
        rates: [
          {
            date: createTestDate("2024-03-01"),
            buyRate: 7.85,
            sellRate: 7.83,
          },
          {
            date: createTestDate("2024-03-02"),
            buyRate: 7.86,
            sellRate: 7.84,
          },
        ],
      });
      expect(mockClient.TipoCambioRangoAsync).toHaveBeenCalledWith({
        fechainit: "01/03/2024",
        fechafin: "02/03/2024",
      });
    });

    it("should return empty rates when no data is available", async () => {
      const startDate = createTestDate("2024-03-01");
      const endDate = createTestDate("2024-03-02");
      const mockResponse = {
        TipoCambioRangoResult: {
          Vars: null,
        },
      };

      mockClient.TipoCambioRangoAsync.mockResolvedValue([mockResponse]);

      const result = await service.getRateRange(startDate, endDate);

      expect(result).toEqual({
        startDate,
        endDate,
        rates: [],
      });
    });
  });

  describe("getMonthlyAverage", () => {
    it("should return monthly average exchange rate", async () => {
      const mockResponse = {
        TipoCambioFechaInicialResult: {
          Vars: {
            Var: [
              {
                fecha: "01/03/2024",
                venta: "7.85",
                compra: "7.83",
              },
              {
                fecha: "02/03/2024",
                venta: "7.86",
                compra: "7.84",
              },
            ],
          },
        },
      };

      mockClient.TipoCambioFechaInicialAsync.mockResolvedValue([mockResponse]);

      const result = await service.getMonthlyAverage(2024, 3);

      expect(result).toEqual({
        year: 2024,
        month: 3,
        average: 7.855, // (7.85 + 7.86) / 2
      });
      expect(mockClient.TipoCambioFechaInicialAsync).toHaveBeenCalledWith({
        fechainit: "01/03/2024",
      });
    });

    it("should return zero average when no data is available", async () => {
      const mockResponse = {
        TipoCambioFechaInicialResult: {
          Vars: null,
        },
      };

      mockClient.TipoCambioFechaInicialAsync.mockResolvedValue([mockResponse]);

      const result = await service.getMonthlyAverage(2024, 3);

      expect(result).toEqual({
        year: 2024,
        month: 3,
        average: 0,
      });
    });

    it("should throw error for invalid month", async () => {
      await expect(service.getMonthlyAverage(2024, 13)).rejects.toThrow(
        "Month must be between 1 and 12"
      );
    });
  });
});
