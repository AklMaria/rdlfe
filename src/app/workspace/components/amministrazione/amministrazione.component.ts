import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { ClassroomsService } from '../../../shared/services/classrooms.service';
import { Utente } from '../../../shared/models/shared.models'
import {CommonModule, DatePipe} from "@angular/common";

@Component({
  selector: 'app-amministrazione',
  templateUrl: './amministrazione.component.html',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe
],
  styleUrl: './amministrazione.component.css'
})
export class AmministrazioneComponent implements OnInit{

  allUsers: Utente[] = [];
  paginatedUsers: Utente[] = [];
  isLoading = true;
  activeStandardUserCount = 0;

  // Proprietà per la paginazione
  currentPage = 1;
  // Come richiesto, 20 righe. L'ho impostato a 2 per vederlo funzionare con i tuoi dati di esempio.
  itemsPerPage = 20;
  totalPages = 0;

  constructor(private userService: UserService, private classroomService: ClassroomsService){

  }

  ngOnInit(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (utenti: any) => {
        console.log("utenti", utenti)
        // Calcola il numero di utenti standard attivi per la card
        this.activeStandardUserCount = this.countActiveStandardUsers(utenti);
        // Filtra la lista per mostrare solo gli utenti attivi nella tabella
        this.allUsers = this.getActiveUsers(utenti);
        this.totalPages = Math.ceil(this.allUsers.length / this.itemsPerPage);
        this.updatePaginatedUsers();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento degli utenti', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Filtra un array di utenti per restituire solo quelli con stato: true.
   * Questo è il metodo richiesto.
   * @param users L'array completo di utenti.
   * @returns Un array contenente solo gli utenti attivi.
   */
  getActiveUsers(users: Utente[]): Utente[] {
    return users.filter(user => user.state === true);
  }

  private countActiveStandardUsers(users: Utente[]): number {
    return users.filter(user => user.state === true && user.role === 'USER').length;
  }

  updatePaginatedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.allUsers.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedUsers();
    }
  }

  get pages(): number[] {
    // Crea un array di numeri da 1 a totalPages
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
