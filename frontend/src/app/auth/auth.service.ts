import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from './login/login.model';
import { LocalStorageRelatedService } from '../shared/services/localstorage-related.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  localStorageService = inject(LocalStorageRelatedService);

  currentUser = signal<User | undefined | any>(undefined);
  isLoginSuccessful = false;

  constructor() {
    console.log('AuthService_constructor().');

    const userEmail = this.localStorageService.getUser('userEmail');
    if (userEmail) {
      console.log('AuthService: User found in localStorage:', userEmail);
      this.currentUser.set({ email: userEmail });
      this.isLoginSuccessful = true;
    }
  }

  register(email: string, password: string) {
    return this.http.post(`/auth/registration/${email}`, password, { responseType: 'text' }); // responseType: So that a parse problem does not occur.
  }

  login(email: string, password: string) {
    return this.http.post(`/auth/login/${email}`, password, { responseType: 'text' });
  }

  // Stateless (does not save previous states) logout. No backend required.
  logout() {
    localStorage.removeItem('userEmail');
    this.currentUser.set(undefined);
  }
}
