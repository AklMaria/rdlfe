import { Component, computed, inject, Input, OnInit } from '@angular/core';

import {RouterLink} from "@angular/router";
import {CommonModule} from "@angular/common";
import { UserStateService } from '../../../auth/services/user-state.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  imports: [
    CommonModule,
    RouterLink
  ],
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{

  private userState = inject(UserStateService);
  private profile = this.userState.profile;
  userRole = computed(() => this.profile()?.role!) 


  
  menuItems: {icon:string; route: string }[] = [];

  ngOnInit(): void {
  }

}
