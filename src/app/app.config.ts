import {ApplicationConfig, importProvidersFrom, LOCALE_ID, provideAppInitializer} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { routes } from './app.routes';
import { ReactiveFormsModule } from '@angular/forms';

import { SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from '@abacritt/angularx-social-login';
import {environment} from "./environment";
import {provideRouter} from "@angular/router";
import {provideHttpClient} from "@angular/common/http";
import {getAuth, provideAuth} from "@angular/fire/auth";
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { registerLocaleData } from '@angular/common'; // <-- Importa questo
import localeIt from '@angular/common/locales/it';
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'it'
    },
    {
      provide: "SocialAuthServiceConfig",
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              environment.GOOGLE_CLIENT_ID
            )
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(
              environment.FB_CLIENT_ID
            )
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    },

    provideAnimationsAsync(),
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    importProvidersFrom(
      BrowserModule,
      ReactiveFormsModule,
    ),
    provideAppInitializer(() => {
      registerLocaleData(localeIt);
    }),
  ]
};
