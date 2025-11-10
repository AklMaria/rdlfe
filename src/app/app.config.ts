import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { routes } from './app.routes';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from './environment';
import { SocialAuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from '@abacritt/angularx-social-login';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'it' },

    // 🔐 Social Login
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.GOOGLE_CLIENT_ID),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(environment.FB_CLIENT_ID),
          },
        ],
        onError: (err) => console.error(err),
      } as SocialAuthServiceConfig,
    },

    provideRouter(routes),
    provideHttpClient(),

    // ✅ Firebase init
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),

    importProvidersFrom(BrowserModule, ReactiveFormsModule),

    provideAppInitializer(() => registerLocaleData(localeIt)),
  ],
};
