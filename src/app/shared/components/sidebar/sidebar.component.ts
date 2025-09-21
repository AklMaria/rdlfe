import {Component, computed, inject, OnInit} from '@angular/core';

import {RouterLink} from "@angular/router";
import {UserStateService} from "../../../auth/services/user-state.service";


@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  imports: [
    RouterLink
],
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{

  private userState = inject(UserStateService);
  private profile = this.userState.profile;
  userRole = computed(() => this.profile()?.role!) // Simula il ruolo dell'utente
  menuItems: {icon:string; label: string; route: string }[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadMenuItems();
  }

  loadMenuItems() {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", this.userRole());
    // this.userRole = this.authService.getUserRole(); // Rimosso il servizio auth
    if (this.userRole() === 'ADMIN') {
      this.menuItems = [{icon:'bi bi-house', label: 'Amministrazione', route: 'admin'}, {icon:'bi bi-book', label: 'Corsi', route: 'corsi'},{icon:'bi bi-people', label: 'Utenti', route: 'utenti'}];
    } else if (this.userRole() === 'USER') {
      this.menuItems = [{icon:'bi bi-house', label: 'Dashboard', route: 'dashboard'},{icon:'bi bi-book', label: 'Corsi', route: 'corsi'},{icon:'bi bi-book-half', label: 'I miei corsi', route: 'i-miei-corsi'}];
    } else {
      this.menuItems = []; // Nessuna voce di menu per utenti non autenticati/con ruoli sconosciuti
    }
  }
}
