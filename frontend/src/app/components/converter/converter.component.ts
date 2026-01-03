import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';

import { MatDatepicker } from '@angular/material/datepicker';
import { MatOptionModule } from '@angular/material/core';
import { MatChip } from '@angular/material/chips';
import { MatSpinner } from '@angular/material/progress-spinner';

import { StorageService } from '../../services/storage.service';
import { CurrencyService } from '../../services/currency.service';
import { Currency, ConversionRecord, CurrenciesResponse, ConvertResponse } from '../../models/currency.model';

import { InputFormatterDirective } from '../../directives/input-formatter.directive';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule,

      MatCardModule,
     MatFormFieldModule,
     MatSelectModule,
     MatInputModule,
     MatDatepickerModule,
     MatNativeDateModule,
     MatButtonModule,
     MatIconModule,
     MatProgressSpinnerModule,
     MatSnackBarModule,
     MatDividerModule,
     MatChipsModule,
     MatListModule,
     MatTooltipModule,
     MatGridListModule,
     MatExpansionModule,
     MatTabsModule,

     MatDatepicker,
     MatChip,
     MatSpinner,

     InputFormatterDirective
   ],
  providers: [DatePipe],
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.scss']
})
export class ConverterComponent implements OnInit, OnDestroy {

  currencies: Currency[] = [];
  fromCurrency: Currency | null = null;
  toCurrency: Currency | null = null;

  amount = 100;
  convertedAmount = 0;
  exchangeRate = 0;
  loading = false;
  error = '';
  selectedDate: Date | null = null;
  today = new Date();

  conversionHistory: ConversionRecord[] = [];

  private destroy$ = new Subject<void>();
  private amountChange$ = new Subject<number>();

  constructor(
    private currencyService: CurrencyService,
    private storageService: StorageService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadCurrencies();
    this.loadHistory();

    this.amountChange$
      .pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.convertCurrency());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCurrencies(): void {
    console.log('ConverterComponent: loadCurrencies called');
    this.loading = true;
    this.currencyService.getCurrencies().subscribe({
      next: (response: CurrenciesResponse) => {
        console.log('ConverterComponent: loadCurrencies success', response);
        this.currencies = Object.entries(response.data).map(([_, value]: any) => ({
          code: value.code,
          name: value.name,
          symbol: value.symbol
        })).sort((a, b) => a.code.localeCompare(b.code));

        this.fromCurrency = this.currencies.find(c => c.code === 'USD') || null;
        this.toCurrency = this.currencies.find(c => c.code === 'EUR') || null;
        this.loading = false;

        this.convertCurrency();
      },
      error: (err: any) => {
        console.error('ConverterComponent: loadCurrencies error', err);
        this.loading = false;
        this.error = 'Failed to load currencies';
        this.showError('Failed to load currencies');
      }
    });
  }

  getFlagEmoji(currencyCode: string): string {
    const map: any = {
      USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
      AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭', CNY: '🇨🇳',
      INR: '🇮🇳', BRL: '🇧🇷', RUB: '🇷🇺', ZAR: '🇿🇦'
    };
    return map[currencyCode] || '🏳️';
  }

  onDateChange(): void {
    if (this.selectedDate) this.convertCurrency();
  }

  clearDate(): void {
    this.selectedDate = null;
    this.convertCurrency();
    this.showSuccess('Date cleared');
  }

  onCurrencyChange(): void {
    this.convertCurrency();
  }

  onAmountChange(): void {
    this.amountChange$.next(this.amount);
  }

  swapCurrencies(): void {
    [this.fromCurrency, this.toCurrency] = [this.toCurrency, this.fromCurrency];
    this.convertCurrency();
    this.showSuccess('Swapped');
  }

  convertCurrency(): void {
    if (!this.fromCurrency || !this.toCurrency || this.amount <= 0) {
      this.convertedAmount = 0;
      this.exchangeRate = 0;
      return;
    }

    if (this.fromCurrency.code === this.toCurrency.code) {
      this.convertedAmount = this.amount;
      this.exchangeRate = 1;
      return;
    }

    this.loading = true;
    this.error = '';

    const dateStr = this.selectedDate
      ? this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd') || ''
      : undefined;

    console.log('ConverterComponent: convertCurrency called with', { from: this.fromCurrency!.code, to: this.toCurrency!.code, amount: this.amount, date: dateStr });
    this.currencyService.convertCurrency(this.fromCurrency!.code, this.toCurrency!.code, this.amount, dateStr).subscribe({
      next: (response: ConvertResponse) => {
        console.log('ConverterComponent: convertCurrency success', response);
        this.convertedAmount = response.result;
        this.exchangeRate = response.result / this.amount;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('ConverterComponent: convertCurrency error', err);
        this.loading = false;
        this.error = 'Conversion failed';
        this.showError('Conversion failed');
      }
    });
  }

  saveConversion(): void {
    if (!this.canConvert || this.loading) return;

    const record: ConversionRecord = {
      id: Date.now().toString(),
      fromCurrency: this.fromCurrency!.code,
      toCurrency: this.toCurrency!.code,
      amount: this.amount,
      convertedAmount: this.convertedAmount,
      rate: this.exchangeRate,
      date: this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '',
      timestamp: new Date().toISOString(),
      isHistorical: !!this.selectedDate,
      historicalDate: this.selectedDate
        ? this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd') || ''
        : undefined
    };

    this.storageService.saveConversion(record);
    this.loadHistory();
    this.showSuccess('Saved to history');
  }

  clearHistory(): void {
    if (confirm('Clear history?')) {
      this.storageService.clearHistory();
      this.conversionHistory = [];
      this.showSuccess('History cleared');
    }
  }

  resetForm(): void {
    this.fromCurrency = this.currencies.find(c => c.code === 'USD') || null;
    this.toCurrency = this.currencies.find(c => c.code === 'EUR') || null;
    this.amount = 100;
    this.selectedDate = null;
    this.convertCurrency();
    this.showSuccess('Form reset');
  }

  private loadHistory(): void {
    this.conversionHistory = this.storageService.getHistory();
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  get canConvert(): boolean {
    return !!this.fromCurrency && !!this.toCurrency && this.amount > 0 && this.exchangeRate > 0;
  }
}
