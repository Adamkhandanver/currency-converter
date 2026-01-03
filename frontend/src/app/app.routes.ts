import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/converter/converter.component').then(m => m.ConverterComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];