import { Controller, Get, Query, HttpStatus, HttpException } from '@nestjs/common';
import { CurrencyService } from '../services/currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('status')
  async getStatus() {
    try {
      return await this.currencyService.getStatus();
    } catch (error) {
      throw new HttpException(
        'Failed to get API status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('currencies')
  async getCurrencies(@Query('currencies') currencies?: string) {
    try {
      const currenciesArray = currencies ? currencies.split(',') : undefined;
      return await this.currencyService.getCurrencies(currenciesArray);
    } catch (error) {
      throw new HttpException(
        'Failed to get currencies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('latest')
  async getLatestRates(
    @Query('base') baseCurrency?: string,
    @Query('currencies') currencies?: string,
  ) {
    try {
      const currenciesArray = currencies ? currencies.split(',') : undefined;
      return await this.currencyService.getLatestExchangeRates(baseCurrency, currenciesArray);
    } catch (error) {
      throw new HttpException(
        'Failed to get latest exchange rates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('historical')
  async getHistoricalRates(
    @Query('date') date: string,
    @Query('base') baseCurrency?: string,
    @Query('currencies') currencies?: string,
  ) {
    try {
      if (!date) {
        throw new HttpException('Date parameter is required', HttpStatus.BAD_REQUEST);
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new HttpException('Date must be in YYYY-MM-DD format', HttpStatus.BAD_REQUEST);
      }
      
      const currenciesArray = currencies ? currencies.split(',') : undefined;
      return await this.currencyService.getHistoricalRates(date, baseCurrency, currenciesArray);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to get historical rates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('convert')
  async convert(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount?: string,
    @Query('date') date?: string,
  ) {
    try {
      if (!from || !to) {
        throw new HttpException('From and to parameters are required', HttpStatus.BAD_REQUEST);
      }

      const amountNumber = amount ? parseFloat(amount) : 1;
      if (amount && (isNaN(amountNumber) || amountNumber <= 0)) {
        throw new HttpException('Amount must be a positive number', HttpStatus.BAD_REQUEST);
      }

      return await this.currencyService.convertCurrency(from, to, amountNumber, date);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to convert currency',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history')
  async getHistory() {
    try {
      return await this.currencyService.getConversionHistory();
    } catch (error) {
      throw new HttpException(
        'Failed to get conversion history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}