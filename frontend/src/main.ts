import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

console.log('=== main.ts: App is starting ===');

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('=== main.ts: App bootstrapped successfully ==='))
  .catch((err) => console.error('=== MAIN.TS: Bootstrap error ===', err));
