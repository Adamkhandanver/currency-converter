import { CurrencyService } from '../services/currency.service';
export declare class CurrencyController {
    private readonly currencyService;
    constructor(currencyService: CurrencyService);
    getStatus(): Promise<any>;
    getCurrencies(currencies?: string): Promise<any>;
    getLatestRates(baseCurrency?: string, currencies?: string): Promise<any>;
    getHistoricalRates(date: string, baseCurrency?: string, currencies?: string): Promise<any>;
    convert(from: string, to: string, amount?: string, date?: string): Promise<any>;
    getHistory(): Promise<import("../entities/conversion.entity").Conversion[]>;
}
