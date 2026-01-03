import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { CurrencyResponse, CurrenciesResponse, ConvertResponse } from '../models/currency.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // UPDATE: Change from 3001 to 3000
  private baseUrl = 'http://localhost:3000/currency';

  constructor(private http: HttpClient) {}

  getLatestRates(base: string, currencies?: string[]): Observable<CurrencyResponse> {
    let params = new HttpParams().set('base', base);
    if (currencies && currencies.length > 0) {
      params = params.set('currencies', currencies.join(','));
    }
    
    return this.http.get<CurrencyResponse>(`${this.baseUrl}/latest`, { params }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getHistoricalRates(date: string, base: string, currencies?: string[]): Observable<CurrencyResponse> {
    let params = new HttpParams().set('date', date).set('base', base);
    if (currencies && currencies.length > 0) {
      params = params.set('currencies', currencies.join(','));
    }
    
    return this.http.get<CurrencyResponse>(`${this.baseUrl}/historical`, { params }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getCurrencies(currencies?: string[]): Observable<CurrenciesResponse> {
    let params = new HttpParams();
    if (currencies && currencies.length > 0) {
      params = params.set('currencies', currencies.join(','));
    }
    
    return this.http.get<CurrenciesResponse>(`${this.baseUrl}/currencies`, { params }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  convertCurrency(from: string, to: string, amount: number, date?: string): Observable<ConvertResponse> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('amount', amount.toString());
    
    if (date) {
      params = params.set('date', date);
    }

    return this.http.get<ConvertResponse>(`${this.baseUrl}/convert`, { params }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getStatus(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/status`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Cannot connect to backend server. Is NestJS running on port 3000?';
          break;
        case 400:
          errorMessage = 'Invalid request: ' + (error.error?.message || 'Check your input');
          break;
        case 404:
          errorMessage = `Endpoint ${error.url} not found.`;
          break;
        case 429:
          errorMessage = 'Rate limit exceeded. Please try again later';
          break;
        case 500:
          errorMessage = 'Server error: ' + (error.error?.message || 'Internal server error');
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('CurrencyService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}