export interface ExchangeRateDay {
  date: Date;
  buyRate: number;
  sellRate: number;
}

export interface ExchangeRateRange {
  startDate: Date;
  endDate: Date;
  rates: ExchangeRateDay[];
}

export interface ExchangeRateAverage {
  year: number;
  month: number;
  average: number;
}

export interface BanguatServiceConfig {
  endpoint?: string;
  timeout?: number;
}
