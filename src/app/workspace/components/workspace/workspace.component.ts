import { Component, inject, OnInit } from '@angular/core';
import {CommonModule, NgClass} from "@angular/common";
import {HeaderComponent} from "../../../shared/components/header/header.component";
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component";
import {RouterOutlet} from "@angular/router";
import {NavbarComponent} from "../../../shared/components/navbar/navbar.component";
import { UserStateService } from '../../../auth/services/user-state.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    HeaderComponent,
    SidebarComponent,
    RouterOutlet,
    NavbarComponent
  ],
  styleUrl: './workspace.component.css'
})
export class WorkspaceComponent implements OnInit{

  isSidebarCollapsed: boolean = false;

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  ngOnInit(): void {

  }


}
