import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { Conversion } from '../entities/conversion.entity';
export declare class CurrencyService {
    private readonly httpService;
    private readonly conversionRepository;
    private readonly baseUrl;
    private readonly apiKey;
    constructor(httpService: HttpService, conversionRepository: Repository<Conversion>);
    private getHeaders;
    private call;
    getStatus(): Promise<any>;
    getCurrencies(currencies?: string[]): Promise<any>;
    getLatestExchangeRates(baseCurrency?: string, targetCurrencies?: string[]): Promise<any>;
    getHistoricalRates(date: string, baseCurrency?: string, targetCurrencies?: string[]): Promise<any>;
    convertCurrency(from: string, to: string, amount?: number, date?: string): Promise<any>;
    getConversionHistory(): Promise<Conversion[]>;
}
