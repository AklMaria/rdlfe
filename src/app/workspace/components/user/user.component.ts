import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { Utente } from '../../../shared/models/shared.models';
import {CommonModule, DatePipe, NgClass} from "@angular/common";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    NgClass,
    ReactiveFormsModule
],
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit, AfterViewInit {
  @ViewChild('createUserOffcanvas') createUserOffcanvasElement!: ElementRef;

  allUsers: Utente[] = [];
  paginatedUsers: Utente[] = [];
  isLoading = true;

  // Paginazione
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Form
  newUserForm!: FormGroup;
  private createUserOffcanvas: any;
  editingUser: Utente | null = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.initForm();
  }

  ngAfterViewInit(): void {
    if (this.createUserOffcanvasElement) {
      this.createUserOffcanvas = new (window as any).bootstrap.Offcanvas(this.createUserOffcanvasElement.nativeElement);
    }
  }

  initForm(): void {
    this.newUserForm = this.fb.group({
      username: ['', Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      birthDate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      credits: [0, [Validators.required, Validators.min(0)]],
      state: [true, Validators.required],
      userLevel: ['BEGINNER', Validators.required]
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (utenti) => {
        // Filtra solo gli utenti con ruolo 'user'
        this.allUsers = utenti.filter(u => u.role === 'USER')
                               .sort((a, b) => a.id! - b.id!); // Ordina per ID
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
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  openCreateUserSidebar(): void {
    this.editingUser = null;
    this.newUserForm.reset({
      credits: 0,
      state: true
    });
    this.createUserOffcanvas.show();
  }

  openEditUserSidebar(user: Utente): void {
    this.editingUser = user;
    this.newUserForm.patchValue({
      username: user.username,
      birthDate: user.birthDate,
      email: user.email,
      credits: user.credits,
      state: user.state,
      userLevel: user.userLevel || 'BEGINNER'
    });
    this.createUserOffcanvas.show();
  }

  onSaveUser(): void {
    if (this.newUserForm.invalid) { return; }

    if (this.editingUser) {
      // Modalità Modifica
      const updatedUser: Utente = {
        ...this.editingUser,
        ...this.newUserForm.value
      };
      this.userService.updateUser(updatedUser.id!, updatedUser).subscribe({
        next: () => {
          this.createUserOffcanvas.hide();
          this.loadUsers();
        },
        error: (err) => console.error("Errore durante l'aggiornamento dell'utente", err)
      });
    } else {
      // Modalità Creazione
      const formValue = this.newUserForm.value;
      const newUser: Omit<Utente, 'id'> = {
        ...formValue,
        role: 'USER',
       // aule: []     // Nessuna aula all'inizio
      };
      console.log('quello che mando:',newUser)

      this.userService.createUser(newUser as Utente).subscribe({
        next: () => {
          this.createUserOffcanvas.hide();
          this.loadUsers(); // Ricarica la lista per mostrare il nuovo utente
        },
        error: (err) => console.error("Errore durante la creazione dell'utente", err)
      });
    }
  }

  deleteUser(id: number): void {
  this.userService.deleteUser(id).subscribe({
    next: () => {
      console.log('Utente eliminato');
      // ad esempio aggiorni la lista utenti
      this.loadUsers();
    },
    error: (err) => {
      console.error('Errore eliminazione:', err);
    }
  });
}
}
