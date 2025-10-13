import {Component, inject} from '@angular/core';
import {LoginService} from "../../../auth/services/login.service";
import {UserStateService} from "../../../auth/services/user-state.service";
import {CommonModule} from "@angular/common";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header', standalone: true, templateUrl: './header.component.html',
  imports: [
    CommonModule,RouterLink
  ],
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private loginService = inject(LoginService)
  private userState = inject(UserStateService);

  profile = this.userState.profile;

  getIniziali(name: string | null, surname: string | null): string {
    if (name && surname) {
      return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  logout(): void {
    this.loginService.signOut();
  }

}
