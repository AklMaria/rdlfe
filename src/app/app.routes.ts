// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import {authGuard} from "./auth.guard";
import {RegistrationComponent} from "./auth/components/registration/registration.component";

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'workspace',
    loadChildren: () => import('./workspace/workspace.routes').then(r => r.WORKSPACE_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'registration',
    component: RegistrationComponent,
  },
  {
    path: '**',
    redirectTo: ''
  }
];
