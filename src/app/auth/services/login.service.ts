import {inject, Injectable} from '@angular/core';
import {HttpService} from '../../shared/services/http.service';
import {Router} from '@angular/router';
import {
  Auth,
  authState,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User
} from "@angular/fire/auth";
import {Observable} from "rxjs";
import {UserStateService} from "./user-state.service";
import {Utente} from "../../shared/models/shared.models";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private httpService = inject(HttpService)

  basicLogin(email: string, password: string): Observable<Utente> {
    return this.httpService.post<Utente>(`/users/login`, {mail: email, password});
  }

  private auth: Auth = inject(Auth);
  private router = inject(Router);
  private utente = inject(UserStateService)

  readonly authState$: Observable<User | null> = authState(this.auth);

  constructor() {
    this.authState$.subscribe(firebaseUser => {
      if (firebaseUser) {
        const basicProfile: Utente = {
          username: firebaseUser.displayName!,
          image: firebaseUser.photoURL!,
          email: firebaseUser.email!,
        };

        this.utente.setUtente(basicProfile);

      } else {
        this.utente.setUtente(null);
      }
    });
  }

  async signInWithFacebook() {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('user_birthday');

    try {
      const userCredential = await signInWithPopup(this.auth, provider);
      console.log('Firebase Facebook Authentication successful!', userCredential.user);
      this.router.navigate(['/workspace/dashboard']);
      return userCredential;
    } catch (error: any) {
      console.error('Firebase Facebook Authentication failed:', error);

      // Example of handling specific errors
      if (error.code === 'auth/account-exists-with-different-credential') {
        alert('An account with this email already exists using a different sign-in method.');
      }
      throw error;
    }
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/user.birthday.read')
    try {
      const userCredential = await signInWithPopup(this.auth, provider);
      console.log('Authentication successful!', userCredential.user);
      return userCredential;
    } catch (error: any) {
      console.error('Authentication failed:', error);
      if (error.code === 'auth/account-exists-with-different-credential') {
        alert('An account with this email already exists using a different sign-in method.');
      }
      throw error;
    }
  }

  async signOut() {
    await signOut(this.auth);
    console.log('User signed out.');
    await this.router.navigate(['/']);
  }

}
