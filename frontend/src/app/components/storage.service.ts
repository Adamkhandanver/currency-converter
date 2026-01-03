import { Injectable } from '@angular/core';
import { ConversionRecord } from '../models/currency.model';

const STORAGE_KEY = 'conversion_history';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  saveConversion(record: ConversionRecord): void {
    const history = this.getHistory();
    history.unshift(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  getHistory(): ConversionRecord[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
