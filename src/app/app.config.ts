import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { getFirestore, provideFirestore } from '@angular/fire/firestore'
import { getStorage, provideStorage } from '@angular/fire/storage'
import { AuthModule } from '@angular/fire/auth';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';

const firebaseConfig = {
  apiKey: "AIzaSyDvinepDWozXFdp8eeLhCwx2cAQb5Skh0M",
  authDomain: "projektlabor-cf0ff.firebaseapp.com",
  projectId: "projektlabor-cf0ff",
  storageBucket: "projektlabor-cf0ff.appspot.com",
  messagingSenderId: "942544039930",
  appId: "1:942544039930:web:d12bd6fc93444ab559fe43",
  measurementId: "G-6GJFT9371X"
};

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(),
    importProvidersFrom([
      
    ]), provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
      provideAuth(() => getAuth()),
      provideFirestore(()=> getFirestore()),
      provideStorage(() => getStorage()), provideAnimationsAsync()
  ],
};