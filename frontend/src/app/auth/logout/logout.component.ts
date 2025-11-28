import { Component, inject } from '@angular/core';
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

  email = this.authService.currentUser()?.email ?? ''; // ?? "" is Optional Chaining.
  password = this.authService.currentUser()?.password ?? '';

  constructor() {
    this.authService.logout(this.email, this.password).subscribe({
      next: () => {
        this.authService.currentUser.set(undefined);
        this.router.navigateByUrl('/login');
      },
    });
  }
}
