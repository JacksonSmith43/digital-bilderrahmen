import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userEmail = sessionStorage.getItem('userEmail');

  if (userEmail) {
    return true;
  } else {
    router.navigate(['/login']);
    return false; // The user is not logged in.
  }
};
