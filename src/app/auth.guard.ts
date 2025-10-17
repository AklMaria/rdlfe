import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
// import {UserStateService} from "./auth/services/user-state.service";

export const authGuard: CanActivateFn = (route, state) => {
  // const userState = inject(UserStateService);
  const router = inject(Router);

  // const currentUser = userState.profile();
  const sessionUser = sessionStorage.getItem('user');

  if (sessionUser) {
  // if (currentUser) {
    console.log(route);
    return true;
  } else {
    return router.createUrlTree(['/']);
  }
};
