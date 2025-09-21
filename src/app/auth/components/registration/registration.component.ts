import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  partialProfile = this.userState.profile;
  registrationForm!: FormGroup;

  ngOnInit(): void {
    if (!this.partialProfile()) {
      // If there's no partial profile, the user shouldn't be here
      this.router.navigate(['/']);
      return;
    }

    this.registrationForm = this.fb.group({
      username: ['', Validators.required],
      birthDate: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid || !this.partialProfile()) {
      return;
    }

    const formValue = this.registrationForm.value;

    const completeProfile: Utente = {
      ...this.partialProfile(),
      username: formValue.username,
      birthDate: formValue.birthDate,
      password: formValue.password
    };

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
