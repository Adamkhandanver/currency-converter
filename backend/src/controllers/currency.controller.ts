import { Controller, Get, Query, HttpStatus, HttpException } from '@nestjs/common';
import { CurrencyService } from '../services/currency.service';

@Controller()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('status')
  async getStatus() {
    console.log('CurrencyController: getStatus called');
    try {
      const result = await this.currencyService.getStatus();
      console.log('CurrencyController: getStatus success');
      return result;
    } catch (error) {
      console.error('CurrencyController: getStatus error:', error.message);
      throw new HttpException(
        'Failed to get API status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('currencies')
  async getCurrencies(@Query('currencies') currencies?: string) {
    console.log('CurrencyController: getCurrencies called with', currencies);
    try {
      const currenciesArray = currencies ? currencies.split(',') : undefined;
      const result = await this.currencyService.getCurrencies(currenciesArray);
      console.log('CurrencyController: getCurrencies success');
      return result;
    } catch (error) {
      console.error('CurrencyController: getCurrencies error:', error.message);
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
    console.log('CurrencyController: convert called with', { from, to, amount, date });
    try {
      if (!from || !to) {
        throw new HttpException('From and to parameters are required', HttpStatus.BAD_REQUEST);
      }

      const amountNumber = amount ? parseFloat(amount) : 1;
      if (amount && (isNaN(amountNumber) || amountNumber <= 0)) {
        throw new HttpException('Amount must be a positive number', HttpStatus.BAD_REQUEST);
      }

      const result = await this.currencyService.convertCurrency(from, to, amountNumber, date);
      console.log('CurrencyController: convert success', result);
      return result;
    } catch (error) {
      console.error('CurrencyController: convert error:', error.message);
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