import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css',
})
export class LogoutComponent {
  authService = inject(AuthService);
  router = inject(Router);

  constructor() {
    this.authService.logout();
    this.authService.isLoggedOut.set(true);
    this.authService.successMessage.set('Successful logout.');
    this.router.navigateByUrl('/login');

    setTimeout(() => {
      this.authService.successMessage.set('');
    }, 1000);
  }
}
