import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {GoogleAuthProvider} from '@angular/fire/auth'
import {Router} from '@angular/router';
import {LoginService} from '../../services/login.service';
import {CommonModule, NgClass} from "@angular/common";
import {Utente} from "../../../shared/models/shared.models";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {UserStateService} from "../../services/user-state.service";
import {UserService} from "../../../shared/services/user.service";

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule, NgClass,],
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private loginService = inject(LoginService);
  private userService = inject(UserService);
  private userState = inject(UserStateService);

  errorMessage = '';
  loginForm!: FormGroup;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    this.loginService.basicLogin(email, password).subscribe({
      next: (loggedInUser: Utente) => {
        console.log('Login riuscito', loggedInUser);
        this.userState.setUtente(loggedInUser);
        sessionStorage.setItem('user', JSON.stringify(loggedInUser));
        this.errorMessage = '';
        this.router.navigate(['/workspace/dashboard']);
      },
      error: (err) => {
        console.error('Errore login tradizionale', err);
        this.errorMessage = 'Credenziali non valide.';
      },
    });
  }

  async loginWithFacebook(): Promise<Utente> {
    const user = await this.loginService.signInWithFacebook();
    return {
      username: user.user.displayName,
      email: user.user.email,
    } as Utente;
  }

  async loginWithGoogle(): Promise<void> {
    const userCredentials = await this.loginService.signInWithGoogle();
    if (!userCredentials) return; // login fallita o annullata

    const email = userCredentials.user.email;
    if (!email) {
      this.errorMessage = 'Impossibile ottenere l’email da Google.';
      return;
    }

    try {
      const exists = await firstValueFrom(this.userService.doesUserExist(email));

      if (exists != 0) {
  // Utente già registrato nel DB: recupera il profilo completo
        try {
          const userFromDb = await firstValueFrom(this.userService.getUserById(exists));

          this.userState.setUtente(userFromDb);
          sessionStorage.setItem('user', JSON.stringify(userFromDb));

          this.router.navigate(['/workspace/dashboard']);
        } catch (error) {
          console.error('Errore durante il recupero dell’utente dal DB:', error);
          this.errorMessage = 'Impossibile completare il login. Riprova più tardi.';
        }
      } else {
        // Nuovo utente: crea profilo parziale e vai alla registrazione
        const firebaseUser = userCredentials.user;
        const [firstName, ...rest] = (firebaseUser.displayName ?? '').split(' ');
        const lastName = rest.join(' ');

        const partialProfile: Utente = {
          firstName,
          lastName,
          username: firebaseUser.displayName ?? '',
          email: firebaseUser.email ?? '',
          image: firebaseUser.photoURL ?? '',
        };

        this.userState.setUtente(partialProfile);
        sessionStorage.setItem('partialProfile', JSON.stringify(partialProfile));

        this.router.navigate(['/registration']);
      }
    } catch (err) {
      console.error('Google Login Flow error:', err);
      this.errorMessage = 'Errore durante l’accesso con Google.';
    }
  }
}
