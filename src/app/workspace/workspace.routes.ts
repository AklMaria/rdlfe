// src/app/modules/workspace/workspace.routes.ts
import { Routes } from '@angular/router';
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AmministrazioneComponent } from './components/amministrazione/amministrazione.component';
import { AuleComponent } from './components/aule/aule.component';
import { UserComponent } from './components/user/user.component';
import { IMieiCorsiComponent } from './components/i-miei-corsi/i-miei-corsi.component';
import { ProfiloComponent } from './components/profilo/profilo.component';
import { SitiComponent } from './components/siti/siti-component';
import { CorsiCompletatiComponent } from './components/corsi-completati/corsi-completati.component';

export const WORKSPACE_ROUTES: Routes = [
  {
    path: '',
    component: WorkspaceComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'corsi',
        component: AuleComponent
      },
      {
        path: 'admin',
        component: AmministrazioneComponent
      },
      {
        path: 'utenti',
        component: UserComponent
      },
      {
        path: 'i-miei-corsi',
        component: IMieiCorsiComponent,
      },
      {
        path: 'profilo',
        component: ProfiloComponent
      },

      { path: 'affiliazioni', 
        component: SitiComponent
      },
      { path: 'corsi-completati', 
        component: CorsiCompletatiComponent
      }

    ]
  }
];
