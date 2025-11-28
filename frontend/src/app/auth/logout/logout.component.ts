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

  constructor() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
