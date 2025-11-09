import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClassroomsService } from '../../../shared/services/classrooms.service';
import { Aula, ClassroomRegistration, DocumentItem, Registration } from '../../../shared/models/shared.models';
import { UserService } from '../../../shared/services/user.service';
import { InscriptionsService } from '../../../shared/services/inscriptions.service';
import { CommonModule, DatePipe, NgClass, SlicePipe } from "@angular/common";
import { UserStateService } from "../../../auth/services/user-state.service";
import { timestamp } from 'rxjs';

@Component({
  selector: 'app-aule',
  templateUrl: './aule.component.html',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,

    NgClass,
    ReactiveFormsModule,
    SlicePipe
  ],
  styleUrl: './aule.component.css'
})
export class AuleComponent implements OnInit, AfterViewInit {
  @ViewChild('createClassroomOffcanvas') createClassroomOffcanvasElement!: ElementRef;
  @ViewChild('viewSubUsersCanvas') showSubUsersOffcanvasElement!: ElementRef;
  @ViewChild('courseDocumentOffcanvas') courseDocumentOffcanvasElement!: ElementRef;

  allClassrooms: Aula[] = [];
  paginatedClassrooms: Aula[] = [];
  isLoading = true;
  courseDocuments: DocumentItem[] = [];
  isDocsLoading = false;
  selectedCourse: Aula | null = null;
  selectedFile?: File;
  // Proprietà per la paginazione
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  

  // Form per la nuova aula
  newClassroomForm!: FormGroup;
  private createClassroomOffcanvas: any;
  private showSubUsersOffcanvas: any;
  private courseDocumentOffcanvas: any;
  editingClassroom: Aula | null = null;
  isUploading = false;

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
    this.initForm();
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

    if (this.courseDocumentOffcanvasElement) {
      this.courseDocumentOffcanvas = new (window as any).bootstrap.Offcanvas(this.courseDocumentOffcanvasElement.nativeElement);
    }
  }

  initForm(): void {
    this.newClassroomForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      maxSeats: [20, [Validators.required, Validators.min(1)]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      duration: ['', Validators.required],
      isActive: [true, Validators.required],
      completed: [false, Validators.required]
    });
  }

  loadClassrooms(): void {
    this.classroomsService.getAllClassrooms().subscribe({
      next: (aule) => {
        if (this.userRole() === 'ADMIN') {
          // L'admin vede tutte le aule, ordinate per data
          this.allClassrooms = aule.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
          // L'utente vede solo le aule future, attive, con posti liberi e a cui non è già iscritto
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          this.allClassrooms = aule.filter(aula =>
            aula.isActive && new Date(aula.date) >= now
          ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        this.totalPages = Math.ceil(this.allClassrooms.length / this.itemsPerPage);
        this.updatePaginatedClassrooms();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento delle aule', err);
        this.isLoading = false;
      }
    });
  }

  updatePaginatedClassrooms(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedClassrooms = this.allClassrooms.slice(startIndex, endIndex);
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

  openCreateClassroomSidebar(): void {
    this.editingClassroom = null;
    this.newClassroomForm.reset({
      maxEntries: 20,
      isActive: true
    });
    this.createClassroomOffcanvas.show();
  }

  openEditClassroomSidebar(aula: Aula): void {
    this.editingClassroom = aula;
    this.newClassroomForm.patchValue({
      name: aula.name,
      description: aula.description,
      maxSeats: aula.maxSeats,
      date: aula.date,
      time: aula.time,
      duration: aula.duration,
      isActive: aula.isActive,
      completed: aula.completed
    });
    this.createClassroomOffcanvas.show();
  }
  viewClassDetails(aula: Aula): void {
    this.classroomsService.getSubscribedUsers(aula.id).subscribe({
      next: (classroomRegistration) => {
        console.log(classroomRegistration)
        this.classroomRegistration = classroomRegistration;
      }
    })
    this.showSubUsersOffcanvas.show();
  }
  onSaveClassroom(): void {
    if (this.newClassroomForm.invalid) { return; }

    if (this.editingClassroom) {
      // Modalità Modifica
      const updatedAula: Aula = {
        ...this.editingClassroom,
        ...this.newClassroomForm.value
      };
      this.classroomsService.updateClassroom(updatedAula.id, updatedAula).subscribe({
        next: () => {
          this.createClassroomOffcanvas.hide();
          this.loadClassrooms();
        },
        error: (err) => console.error("Errore durante l'aggiornamento dell'aula", err)
      });
    } else {
      console.log('valori mnadati dal form:', this.newClassroomForm.value);
      // Modalità Creazione
      const newAula: Omit<Aula, 'id'> = { ...this.newClassroomForm.value, users: [] };
      this.classroomsService.createClassroom(newAula as Aula).subscribe({
        next: () => {
          this.createClassroomOffcanvas.hide();
          this.loadClassrooms();
        },
        error: (err) => console.error("Errore durante la creazione dell'aula", err)
      });
    }
  }

  subscribe(aula: Aula): void {
    var registrationRequest: Registration
    registrationRequest = {
      userId: this.currentUserId(),
      classroomId: aula.id
    };
    this.inscriptionsService.registerUserToClassroom(registrationRequest).subscribe({
      next: () => {
        this.allClassrooms = this.allClassrooms.filter(a => a.id !== aula.id);
        this.loadClassrooms();
      },
      error: (err) => {
        console.error('Errore eliminazione:', err);
      }
    })

   }
  // unsubscribe(aula: Aula): void {
  //   var registrationRequest: Registration
  //   registrationRequest = {
  //     userId: this.currentUserId(),
  //     classroomId: aula.id
  //   };
  //   this.inscriptionsService.unregisterUserToClassroom(registrationRequest).subscribe({
  //     next: () => {

  //       this.loadClassrooms();
  //     },
  //     error: (err) => {
  //       console.error('Errore eliminazione:', err);
  //     }
  //   })
  // }

  deleteClassroom(id: number): void {
    console.log('mando:', id)
    this.classroomsService.deleteClassroom(id).subscribe({
      next: () => {

        this.loadClassrooms();
      },
      error: (err) => {
        console.error('Errore eliminazione:', err);
      }
    })
  }

  openCourseDocuments(aula: Aula): void {
    this.selectedCourse = aula;
    console.log('id corso:', this.selectedCourse.id)
    this.isDocsLoading = true;
    this.courseDocuments = [];

    this.classroomsService.getClassroomDocument(aula.id!).subscribe({
      next: (docs) => {
        this.courseDocuments = docs;
        this.isDocsLoading = false;
        this.courseDocumentOffcanvas.show();
      },
      error: (err) => {
        console.error('Errore nel caricamento documenti:', err);
        this.isDocsLoading = false;
      }
    });
  }
  downloadDocument(doc: DocumentItem): void {
    this.classroomsService.downloadClassroomDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Errore durante il download del documento', err)
    });
  }

  loadDocuments(): void {
    if (this.selectedCourse && this.selectedCourse.id) {
      this.classroomsService.getClassroomDocument(this.selectedCourse.id).subscribe({
        next: (docs) => {
          this.courseDocuments = docs;
        },
        error: (err) => console.error('Errore nel caricamento dei documenti:', err)
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadDocument();
    }
  }
  uploadDocument(): void {
    console.log('id classe:', this.selectedCourse, this.selectedCourse?.id);
    if (!this.selectedCourse || !this.selectedCourse.id || !this.selectedFile) return;
    
    this.isUploading = true;
    this.classroomsService.uploadDocument(this.selectedCourse.id, this.selectedFile).subscribe({
      next: () => {
        this.isUploading = false;
        this.loadDocuments();
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Errore upload:', err);
      }
    });
  }
}
