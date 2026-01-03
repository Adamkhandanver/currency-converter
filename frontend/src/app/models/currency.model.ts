export interface Currency {
  code: string;
  name: string;
}

export interface ExchangeRate {
  [key: string]: number;
}

export interface CurrencyResponse {
  data: ExchangeRate;
  base?: string;
  date?: string;
  timestamp?: string;
}

export interface CurrenciesResponse {
  data: { [key: string]: string };
}

export interface ConversionRecord {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  date: string;
  timestamp: string;
  isHistorical: boolean;
  historicalDate?: string;
}

export interface ConvertResponse {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  date: string;
  timestamp: string;
}