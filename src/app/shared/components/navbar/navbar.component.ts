import { Component, Input, OnInit } from '@angular/core';

import {RouterLink} from "@angular/router";
import {CommonModule} from "@angular/common";

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


  currentRole: 'USER' | 'ADMIN' = 'USER';
  menuItems: {icon:string; route: string }[] = [];

  ngOnInit(): void {
   console.log(this.currentRole)
  }

}
