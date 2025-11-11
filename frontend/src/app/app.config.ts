import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { galleryReducer } from './gallery/state/gallery.reducer';
import { GalleryEffects } from './gallery/state/gallery.effects';
import { DeviceSettingsEffects } from './device-settings/state/device-settings.effects';
import { SharedEffects } from './shared/state/shared.effects';
import { sharedReducer } from './shared/state/shared.reducer';
import { deviceSettingsReducer } from './device-settings/state/device-settings.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideStore({
      Gallery: galleryReducer,
      Shared: sharedReducer,
      DeviceSettings: deviceSettingsReducer,
    }),
    provideEffects([GalleryEffects, DeviceSettingsEffects, SharedEffects]),
    provideStoreDevtools(),
  ],
};
