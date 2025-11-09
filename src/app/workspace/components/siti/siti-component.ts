import { AfterViewInit, Component, computed, inject, OnInit } from '@angular/core';
import { SitoService } from '../../../shared/services/sito.service';
import { Sito } from '../../../shared/models/shared.models';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserStateService } from '../../../auth/services/user-state.service';

@Component({
  selector: 'app-siti-component',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './siti-component.html',
  styleUrl: './siti-component.css'
})
export class SitiComponent implements OnInit, AfterViewInit {

  newLink!: FormGroup;
  siti: Sito[] = [];
  isAdmin: boolean = true;
  private offcanvasInstance: any = null;

  private userState = inject(UserStateService);
  private profile = this.userState.profile;
  userRole = computed(() => this.profile()?.role!) 
  
  editMode = false;
  selectedSito: Sito | null = null;

  constructor(private sitoService: SitoService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.newLink = this.fb.group({
      name: ['', Validators.required],
      link: ['', Validators.required],
    });

    this.sitoService.getSites().subscribe({
      next: (data) => this.siti = data
    });
  }

  ngAfterViewInit() {
    this.initializeOffcanvas();
  }

  private initializeOffcanvas() {
    const offcanvasElement = document.getElementById('newWebsiteLink');
    if (offcanvasElement) {
      this.offcanvasInstance = new (window as any).bootstrap.Offcanvas(offcanvasElement);
    }
  }

  // 👉 Apre per aggiungere
  addLink() {
    this.editMode = false;
    this.selectedSito = null;
    this.newLink.reset();
    this.openOffcanvas();
  }

  // 👉 Apre per modificare
  updateLink(sito: Sito) {
    this.editMode = true;
    this.selectedSito = sito;
    this.newLink.patchValue({
      name: sito.name,
      link: sito.link
    });
    this.openOffcanvas();
  }

  private openOffcanvas() {
    if (this.offcanvasInstance) {
      this.offcanvasInstance.show();
    } else {
      const offcanvasElement = document.getElementById('newWebsiteLink');
      if (offcanvasElement) {
        const offcanvas = new (window as any).bootstrap.Offcanvas(offcanvasElement);
        offcanvas.show();
      }
    }
  }

  closeSidebar(): void {
    if (this.offcanvasInstance) {
      this.offcanvasInstance.hide();
    }
  }

  onSubmit() {
  if (this.newLink.invalid) return;

  const sitoData = {
    id: 0,
    name: this.newLink.value.name,
    link: this.newLink.value.link
  };

  
  if (this.editMode && this.selectedSito) {
    this.sitoService.updateSite(this.selectedSito.id, sitoData).subscribe({
      next: (updated) => {
        const index = this.siti.findIndex(s => s.id === updated.id);
        if (index !== -1) {
          this.siti[index] = updated;
        }
        this.closeSidebar();
      },
      error: (err) => console.error('Errore aggiornamento sito:', err)
    });

  
  } else {
    this.sitoService.addSite(sitoData).subscribe({
      next: (created) => {
        this.siti.push(created); // Il BE restituisce l’oggetto completo con id
        this.closeSidebar();
      },
      error: (err) => console.error('Errore creazione sito:', err)
    });
  }
  }
  deleteLink(sito: Sito) {
  if (confirm(`Sei sicuro di voler eliminare "${sito.name}"?`)) {
    this.sitoService.deleteSite(sito.id).subscribe(() => {
      console.log('id:', sito.id)
      this.siti = this.siti.filter(s => s.id !== sito.id);
    });
  }
}
}
