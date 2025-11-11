import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserStateService } from '../../services/user-state.service';
import { UserService } from '../../../shared/services/user.service';
import { Utente } from '../../../shared/models/shared.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  private userState = inject(UserStateService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Get the partial profile from the state
   partialProfile: Utente | null = null;
  registrationForm!: FormGroup;
  user!: Utente;


  ngOnInit(): void {
    const profileFromSignal = this.userState['profile'](); // usa le parentesi per ottenere il valore
    if (profileFromSignal) {
      this.partialProfile = profileFromSignal;
    } else {
      // 2️⃣ se non presente (es. refresh), prova dal sessionStorage
      const stored = sessionStorage.getItem('partialProfile');
      if (stored) {
        try {
          this.partialProfile = JSON.parse(stored);
          this.userState.setUtente(this.partialProfile);
        } catch (err) {
          console.error('Errore parsing partialProfile:', err);
        }
      }
    }

    console.log('Profilo parziale recuperato:', this.partialProfile);
    

    this.registrationForm = this.fb.group({
      username: [this.partialProfile?.username || '', Validators.required],
      birthDate: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    // Se i controlli non esistono o non sono stati ancora toccati, non fare nulla
    if (!password || !confirmPassword || !password.value || !confirmPassword.value) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordsMismatch: true };
  };

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      return;
    }

    const formValue = this.registrationForm.value;

    const completeProfile: Utente = {
      ...this.partialProfile ?? {},
      username: formValue.username,
      birthDate: formValue.birthDate,
      password: formValue.password,
      role: 'USER',
      userLevel: 'BEGINNER',
      state: true,
      credits: 0

    };
    console.log('profilo parziale:', this.partialProfile)
    console.log('profilo completo:', completeProfile)
    this.userService.createUser(completeProfile).subscribe({
      next: (createdUser) => {
        this.userState.setUtente(createdUser);
        this.router.navigate(['/workspace/dashboard']);
      },
      error: (err) => {
        console.error("Failed to complete registration:", err);
      }
    });
  }
}
