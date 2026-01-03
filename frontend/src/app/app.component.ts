import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <mat-icon class="toolbar-icon">currency_exchange</mat-icon>
      <span class="toolbar-title">Currency Converter</span>
    </mat-toolbar>
    
    <main class="app-content">
      <router-outlet></router-outlet>
    </main>
    
    <footer class="app-footer">
      <p>Powered by Adam Khan Danver</p>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .toolbar-icon {
      margin-right: 12px;
    }
    
    .toolbar-title {
      font-size: 1.5rem;
      font-weight: 500;
    }
    
    .app-content {
      flex: 1;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    
    .app-footer {
      background: #f5f5f5;
      padding: 16px;
      text-align: center;
      color: #666;
      border-top: 1px solid #e0e0e0;
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .app-content {
        padding: 16px 12px;
      }
      
      .toolbar-title {
        font-size: 1.25rem;
      }
    }
    
    @media (max-width: 480px) {
      .app-content {
        padding: 12px 8px;
      }
    }
  `]
})
export class AppComponent {}