import {Injectable, signal} from '@angular/core';
import {Utente} from "../../shared/models/shared.models";

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private readonly userProfileState = signal<Utente | null>(null);
  readonly profile = this.userProfileState.asReadonly();

  constructor() { }

  /**
   * Updates the user profile state.
   * Can be called with a full profile or just partial data to update.
   */
   setUtente(profile: Partial<Utente> | null) {
    if (profile === null) {
      this.userProfileState.set(null);
    } else {
      this.userProfileState.update(currentState => ({ ...currentState, ...profile }));
    }
  }

}
