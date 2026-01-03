import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loader-container" *ngIf="isLoading">
      <mat-progress-spinner 
        [diameter]="diameter" 
        [mode]="mode"
        [color]="color">
      </mat-progress-spinner>
      <span class="loader-text" *ngIf="text">{{ text }}</span>
    </div>
  `,
  styles: [`
    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      gap: 16px;
    }
    
    .loader-text {
      color: #666;
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .loader-container {
        padding: 16px;
      }
    }
  `]
})
export class LoaderComponent {
  @Input() isLoading = false;
  @Input() diameter = 40;
  @Input() mode: 'determinate' | 'indeterminate' = 'indeterminate';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() text = '';
}