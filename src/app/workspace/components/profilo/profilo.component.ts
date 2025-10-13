import { Component, computed, inject, OnInit } from '@angular/core';
import { DocumentItem, DocumentRequest, Utente } from '../../../shared/models/shared.models';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import { UserService } from '../../../shared/services/user.service';
import { UserStateService } from '../../../auth/services/user-state.service';


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

  selectedFile?: File;
  isUploading = false;
  private userState = inject(UserStateService);
  profile = this.userState.profile;
  currentUserId = computed(() => this.profile()?.id!);
  utente : Utente | undefined;
  ngOnInit(): void {
    this.loadDocuments();
    this.loadCurrentUserInfo();

  }
  constructor(
    private userService: UserService,
    
  ) {}



  isEditing = false;
  private backup!: Utente;
  documents: DocumentItem[] = [];




  loadCurrentUserInfo(){
       this.userService.getUserById(this.currentUserId()).subscribe({
      next: (user) => {
        this.utente = user
      },
      error: (err) => {
        console.error('Errore nel caricamento dell utente', err);

      }
    });
    
  }

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
    if (this.utente && this.utente.id) {
      this.userService.updateUser(this.utente.id, this.utente).subscribe({
        next: (updatedUser) => {
          console.log('Dati salvati:', updatedUser);
          this.utente = updatedUser;
          this.isEditing = false;
          //this.backup = null;
        },
        error: (err) => console.error('Errore durante il salvataggio:', err)
      });
    }
  }

  cancelEdit(): void {
    this.utente = { ...this.backup }; // ripristina i dati originali
    this.isEditing = false;
  }

  uploadDocument(): void {
  if (!this.utente || !this.utente.id || !this.selectedFile) return;

  this.isUploading = true;
  this.userService.uploadDocument(this.utente.id, this.selectedFile).subscribe({
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

  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
    this.uploadDocument();
  }
}
  loadDocuments(): void {
    if (this.utente && this.utente.id) {
      this.userService.getDocumentsByUserId(this.utente.id).subscribe({
        next: (docs) => {
         this.documents = docs;
        },
        error: (err) => console.error('Errore nel caricamento dei documenti:', err)
      });
    }
  }
  deleteDocument(id: number): void {
  if (confirm('Vuoi davvero eliminare questo documento?')) {
    this.userService.deleteDocument(id).subscribe({
      next: () => {
        console.log('Documento eliminato');
        this.loadDocuments();
      },
      error: (err) => console.error('Errore durante l\'eliminazione del documento:', err)
    });
  }
}


}
