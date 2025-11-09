import { Component, computed, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Aula, ClassroomRegistration } from '../../../shared/models/shared.models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserStateService } from '../../../auth/services/user-state.service';
import { ClassroomsService } from '../../../shared/services/classrooms.service';
import { InscriptionsService } from '../../../shared/services/inscriptions.service';
import { UserService } from '../../../shared/services/user.service';
import { CommonModule, DatePipe, NgClass, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-corsi-completati',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    NgClass,
    SlicePipe
  ],
  templateUrl: './corsi-completati.component.html',
  styleUrl: './corsi-completati.component.css'
})
export class CorsiCompletatiComponent implements OnInit{

  @ViewChild('createClassroomOffcanvas') createClassroomOffcanvasElement!: ElementRef;
  @ViewChild('viewSubUsersCanvas') showSubUsersOffcanvasElement!: ElementRef;

  allClassroomsCompleted: Aula[] = [];
  paginatedClassrooms: Aula[] = [];
  isLoading = true;

  // Proprietà per la paginazione
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Form per la nuova aula
  newClassroomForm!: FormGroup;
  private createClassroomOffcanvas: any;
  private showSubUsersOffcanvas: any;
  editingClassroom: Aula | null = null;

  // Proprietà per ruolo utente
  private userState = inject(UserStateService);
  currentUser = this.userState.profile;
  currentUserId = computed(() => this.currentUser()?.id!); // TODO: Dovrebbe provenire da un servizio di autenticazione
  userRole = computed(() => this.currentUser()?.role!);
  classroomRegistration!: ClassroomRegistration;

  constructor(
    private classroomsService: ClassroomsService,
    private inscriptionsService: InscriptionsService,
    private userService: UserService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadCurrentUserAndClassrooms();
  }

  loadCurrentUserAndClassrooms(): void {
    this.isLoading = true;
    // Per un utente 'admin', cambia currentUserId in 2
    // this.currentUserId = 2;
    this.loadClassrooms();
  }

  ngAfterViewInit(): void {
    if (this.createClassroomOffcanvasElement) {
      this.createClassroomOffcanvas = new (window as any).bootstrap.Offcanvas(this.createClassroomOffcanvasElement.nativeElement);
    }

    if (this.showSubUsersOffcanvasElement) {
      this.showSubUsersOffcanvas = new (window as any).bootstrap.Offcanvas(this.showSubUsersOffcanvasElement.nativeElement);
    }
  }

  loadClassrooms(): void {
    this.classroomsService.getAllCompletedClassroom(this.currentUserId()).subscribe({
      next: (aule) => {
        this.allClassroomsCompleted = aule;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento delle aule completate', err);
        this.isLoading = false;
      }
    });
  }

  updatePaginatedClassrooms(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedClassrooms = this.allClassroomsCompleted.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedClassrooms();
    }
  }

  get pages(): number[] {
    // Crea un array di numeri da 1 a totalPages
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  downloadDocument(){
   console.log('metodo richiamato') 
  }

}
