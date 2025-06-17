import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { MainRoutingModule } from './main-routing.module';
import { HomeComponent } from './components/home/home.component';
import { SharedModule } from '../shared/shared.module';
import { MainComponent } from './components/main/main.component';




@NgModule({
  declarations: [
    HomeComponent,
    MainComponent,
    
    

  ],
  providers: [
  provideHttpClient()
],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MainRoutingModule
  ]
})
export class MainModule { }
