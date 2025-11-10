import {Injectable, signal} from '@angular/core';
import {Utente} from "../../shared/models/shared.models";

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private readonly userProfileState = signal<Utente | null>(null);
  readonly profile = this.userProfileState.asReadonly();

  constructor() {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        this.userProfileState.set(JSON.parse(storedUser));
      } catch (err) {
        console.error('Errore parsing utente da sessionStorage', err);
      }
    }
  }

  /**
   * Updates the user profile state.
   * Can be called with a full profile or just partial data to update.
   */
   setUtente(profile: Partial<Utente> | null) {
    if (profile === null) {
      this.userProfileState.set(null);
      sessionStorage.removeItem('user'); 
    } else {
      this.userProfileState.update(currentState => {
        const updated = { ...currentState, ...profile };
        sessionStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    }
  }

}
