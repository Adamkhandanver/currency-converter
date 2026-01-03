import { Injectable } from '@angular/core';
import { ConversionRecord } from '../models/currency.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly HISTORY_KEY = 'currency_conversion_history';
  private readonly MAX_HISTORY_ITEMS = 50;

  saveConversion(record: ConversionRecord): void {
    const history = this.getHistory();
    history.unshift(record);
    
    // Keep only the most recent items
    const limitedHistory = history.slice(0, this.MAX_HISTORY_ITEMS);
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(limitedHistory));
  }

  getHistory(): ConversionRecord[] {
    const history = localStorage.getItem(this.HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  }

  clearHistory(): void {
    localStorage.removeItem(this.HISTORY_KEY);
  }

  getHistoryCount(): number {
    return this.getHistory().length;
  }
}