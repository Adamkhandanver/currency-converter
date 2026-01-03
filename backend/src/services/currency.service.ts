import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Conversion } from '../entities/conversion.entity';

@Injectable()
export class CurrencyService {
  private readonly baseUrl = 'https://api.freecurrencyapi.com/v1/';
  private readonly apiKey = '4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2';
  
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Conversion)
    private readonly conversionRepository: Repository<Conversion>,
  ) {}

  private getHeaders() {
    return {
      apikey: this.apiKey,
      'Accept': 'application/json',
    };
  }

  private async call(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${endpoint}`, {
          headers: this.getHeaders(),
          params,
          timeout: 10000,
        })
      );
      return response.data;
    } catch (error) {
      console.error('Currency API Error:', error.message);
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          throw new HttpException('Invalid API Key', HttpStatus.UNAUTHORIZED);
        }
        if (error.response?.status === 429) {
          throw new HttpException('API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
        }
        if (error.code === 'ECONNABORTED') {
          throw new HttpException('Request timeout', HttpStatus.REQUEST_TIMEOUT);
        }
      }
      
      throw new HttpException(
        'Failed to fetch currency data from external API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStatus(): Promise<any> {
    return this.call('status');
  }

  async getCurrencies(currencies?: string[]): Promise<any> {
    const params: any = {};
    if (currencies && currencies.length > 0) {
      params.currencies = currencies;
    }
    return this.call('currencies', params);
  }

  async getLatestExchangeRates(baseCurrency?: string, targetCurrencies?: string[]): Promise<any> {
    const params: any = {};
    if (baseCurrency) {
      if (baseCurrency.length !== 3) {
        throw new HttpException('Base currency must be a 3-letter code', HttpStatus.BAD_REQUEST);
      }
      params.base_currency = baseCurrency.toUpperCase();
    }
    
    if (targetCurrencies && targetCurrencies.length > 0) {
      targetCurrencies = targetCurrencies.map(c => {
        if (c.length !== 3) {
          throw new HttpException(`Invalid currency code: ${c}`, HttpStatus.BAD_REQUEST);
        }
        return c.toUpperCase();
      });
      params.currencies = targetCurrencies;
    }
    
    return this.call('latest', params);
  }

  async getHistoricalRates(date: string, baseCurrency?: string, targetCurrencies?: string[]): Promise<any> {
    const params: any = { date };
    
    if (baseCurrency) {
      if (baseCurrency.length !== 3) {
        throw new HttpException('Base currency must be a 3-letter code', HttpStatus.BAD_REQUEST);
      }
      params.base_currency = baseCurrency.toUpperCase();
    }
    
    if (targetCurrencies && targetCurrencies.length > 0) {
      targetCurrencies = targetCurrencies.map(c => {
        if (c.length !== 3) {
          throw new HttpException(`Invalid currency code: ${c}`, HttpStatus.BAD_REQUEST);
        }
        return c.toUpperCase();
      });
      params.currencies = targetCurrencies;
    }
    
    return this.call('historical', params);
  }

  async convertCurrency(from: string, to: string, amount: number = 1, date?: string): Promise<any> {
    if (from.length !== 3) {
      throw new HttpException('From currency must be a 3-letter code', HttpStatus.BAD_REQUEST);
    }
    if (to.length !== 3) {
      throw new HttpException('To currency must be a 3-letter code', HttpStatus.BAD_REQUEST);
    }
    if (amount <= 0) {
      throw new HttpException('Amount must be positive', HttpStatus.BAD_REQUEST);
    }

    let result;
    let usedDate = date || new Date().toISOString().split('T')[0];

    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new HttpException('Date must be in YYYY-MM-DD format', HttpStatus.BAD_REQUEST);
      }
      result = await this.getHistoricalRates(date, from.toUpperCase(), [to.toUpperCase()]);
    } else {
      result = await this.getLatestExchangeRates(from.toUpperCase(), [to.toUpperCase()]);
    }

    if (!result.data || !result.data[to.toUpperCase()]) {
      throw new HttpException('Exchange rate not found', HttpStatus.NOT_FOUND);
    }

    const rate = result.data[to.toUpperCase()];
    const convertedResult = amount * rate;

    const conversion = this.conversionRepository.create({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount,
      rate,
      result: convertedResult,
      date: usedDate,
    });
    await this.conversionRepository.save(conversion);

    return {
      success: true,
      query: {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount,
        date: usedDate,
      },
      info: {
        rate,
        timestamp: result.meta?.last_updated_at || new Date().toISOString(),
      },
      result: convertedResult,
      date: usedDate,
    };
  }

  async getConversionHistory(): Promise<Conversion[]> {
    return this.conversionRepository.find({
      order: { timestamp: 'DESC' },
    });
  }
}