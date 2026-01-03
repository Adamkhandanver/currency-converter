import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ConversionRecord } from '../../models/currency.model';

@Component({
  selector: 'app-currency-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
  ],
  providers: [DatePipe],
  template: `
    <mat-card class="history-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>history</mat-icon>
          Conversion History
          <span class="history-count">({{ history.length }})</span>
        </mat-card-title>
        <button mat-icon-button 
                color="warn" 
                (click)="onClear.emit()"
                [disabled]="history.length === 0"
                matTooltip="Clear all history">
          <mat-icon>delete</mat-icon>
        </button>
      </mat-card-header>
      
      <mat-card-content>
        <mat-list *ngIf="history.length > 0; else noHistory">
          <mat-list-item *ngFor="let record of history; let i = index">
            <div class="history-item">
              <div class="history-main">
                <span class="amount">{{ record.amount | number:'1.2-2' }}</span>
                <span class="currency-code">{{ record.fromCurrency }}</span>
                <mat-icon class="arrow-icon">arrow_forward</mat-icon>
                <span class="amount">{{ record.convertedAmount | number:'1.2-2' }}</span>
                <span class="currency-code">{{ record.toCurrency }}</span>
              </div>
              
              <div class="history-details">
                <div class="rate-info">
                  <span class="rate-label">Rate:</span>
                  <span class="rate-value">1 {{ record.fromCurrency }} = {{ record.rate | number:'1.6-6' }} {{ record.toCurrency }}</span>
                </div>
                
                <div class="date-info">
                  <mat-icon class="small-icon">access_time</mat-icon>
                  <span class="timestamp">{{ record.timestamp | date:'medium' }}</span>
                </div>
                
                <mat-chip *ngIf="record.isHistorical" color="accent" class="historical-chip">
                  <mat-icon class="chip-icon">calendar_today</mat-icon>
                  {{ record.historicalDate }}
                </mat-chip>
              </div>
            </div>
            <mat-divider *ngIf="i < history.length - 1"></mat-divider>
          </mat-list-item>
        </mat-list>
        
        <ng-template #noHistory>
          <div class="no-history">
            <mat-icon>history_toggle_off</mat-icon>
            <h3>No Conversion History</h3>
            <p>Your conversions will appear here</p>
          </div>
        </ng-template>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .history-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .history-count {
      color: #666;
      font-size: 0.875rem;
      margin-left: 8px;
    }
    
    .history-item {
      width: 100%;
      padding: 12px 0;
    }
    
    .history-main {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    
    .amount {
      font-weight: 600;
      font-size: 1.125rem;
      color: #1976d2;
    }
    
    .currency-code {
      font-weight: 500;
      font-size: 0.875rem;
      color: #666;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 12px;
    }
    
    .arrow-icon {
      color: #666;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .history-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .rate-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.875rem;
      color: #666;
    }
    
    .rate-label {
      font-weight: 500;
    }
    
    .rate-value {
      font-family: 'Roboto Mono', monospace;
    }
    
    .date-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: #999;
    }
    
    .small-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    
    .historical-chip {
      margin-top: 4px;
      width: fit-content;
      font-size: 0.75rem;
      padding: 0 8px;
    }
    
    .chip-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      margin-right: 4px;
    }
    
    .no-history {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #999;
    }
    
    .no-history mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #e0e0e0;
    }
    
    .no-history h3 {
      margin: 0 0 8px 0;
      font-weight: 500;
    }
    
    .no-history p {
      margin: 0;
      font-size: 0.875rem;
    }
    
    mat-card-content {
      flex: 1;
      overflow-y: auto;
    }
    
    @media (max-width: 768px) {
      .history-main {
        gap: 6px;
      }
      
      .amount {
        font-size: 1rem;
      }
      
      .currency-code {
        font-size: 0.75rem;
        padding: 1px 6px;
      }
      
      .arrow-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      
      .history-details {
        font-size: 0.75rem;
      }
      
      .no-history {
        padding: 40px 16px;
      }
      
      .no-history mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
    }
    
    @media (max-width: 480px) {
      .history-main {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      
      .arrow-icon {
        transform: rotate(90deg);
      }
    }
  `]
})
export class CurrencyHistoryComponent {
  @Input() history: ConversionRecord[] = [];
  @Output() onClear = new EventEmitter<void>();
}