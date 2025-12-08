import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { environment } from '../environments/environment';
import { NavbarComponent } from "./navbar/navbar.component";
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  isProd = environment.prod; // Is it the production environment.
  
  // Inject AuthService to ensure it's initialized on app startup
  private authService = inject(AuthService);
  
  constructor() {
    console.log('AppComponent initialized - AuthService loaded');
  }
}

