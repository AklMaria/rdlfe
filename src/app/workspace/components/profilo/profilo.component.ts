import { Component, OnInit } from '@angular/core';
import { Utente } from '../../../shared/models/shared.models';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";


@Component({
  selector: 'app-profilo',
  templateUrl: './profilo.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  styleUrl: './profilo.component.css'
})
export class ProfiloComponent implements OnInit{

  utente: Utente = {
    firstName: 'Mario',
    lastName: 'Rossi',
    id: 1,
    username: 'mrossi',
    email: 'mario.rossi@example.com',
    birthDate: '1990-05-12',
    role: 'Studente',
    state: true,
    credits: 20
  };

  isEditing = false;
  private backup!: Utente;

  toggleEdit(): void {
    if (!this.isEditing) {
      // entra in modalità modifica
      this.backup = { ...this.utente };
      this.isEditing = true;
    } else {
      // salva i dati
      this.saveChanges();
    }
  }

  saveChanges(): void {
    console.log('Dati salvati:', this.utente);
    this.isEditing = false;
    // TODO: chiamata al service per salvare nel backend
  }

  cancelEdit(): void {
    this.utente = { ...this.backup }; // ripristina i dati originali
    this.isEditing = false;
  }

  ngOnInit(): void {

  }

}
