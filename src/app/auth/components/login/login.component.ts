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
  errorMessage = '';

  loginForm!: FormGroup;
  private fb = inject(FormBuilder);
  private http: HttpClient = inject(HttpClient);
  private loginService = inject(LoginService);
  private userService = inject(UserService);
  private userState = inject(UserStateService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]], password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    this.loginService.basicLogin(email, password).subscribe({
      next: (loggedInUser: Utente) => {
        console.log('login riuscito', loggedInUser);
        this.userState.setUtente(loggedInUser);
        sessionStorage.setItem('user', JSON.stringify(loggedInUser));
        this.errorMessage = '';
        this.router.navigate(['/workspace/dashboard']);
      }, error: (err) => {
        console.error('Errore login tradizionale', err);
        this.errorMessage = 'Credenziali non valide.';
      }
    });
  }


  async loginWithFacebook(): Promise<Utente> {
    const user = await this.loginService.signInWithFacebook();
    return {
      username: user.user.displayName, email: user.user.email
    } as Utente
  }

  async loginWithGoogle(): Promise<void> {
    const userCredentials = await this.loginService.signInWithGoogle();
    if (!userCredentials) return; // Login failed or was cancelled

    const email = userCredentials.user.email;
    if (!email) {
      this.errorMessage = "Could not retrieve email from Google.";
      return;
    }

    try {
      const exists = await firstValueFrom(this.userService.doesUserExist(email));
      if (exists != 0) {
        const credential = GoogleAuthProvider.credentialFromResult(userCredentials)!;
        const googleProfile = await this.fetchGoogleUserProfile(credential.accessToken!);
        const nameInfo = googleProfile.names[0];
        const birthday = googleProfile.birthdays[0].date;
        this.userState.setUtente({
          username: nameInfo?.displayName || userCredentials.user.displayName,
          image: userCredentials.user.photoURL!,
          firstName: nameInfo?.givenName,
          id: exists,
          lastName: nameInfo?.familyName,
          email: userCredentials.user.email!,
          birthDate: birthday ? `${birthday.day}/${birthday.month}/${birthday.year}` : undefined
        });
        this.router.navigate(['/workspace/dashboard']);
      } else {
        this.router.navigate(['/registration']);
      }
    } catch (err) {
      console.error("Google Login Flow", err);
    }
  }

  private async fetchGoogleUserProfile(accessToken: string): Promise<any> {
    const url = 'https://people.googleapis.com/v1/people/me?personFields=birthdays,names,emailAddresses';

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return firstValueFrom(this.http.get(url, {headers}));
  }

}
