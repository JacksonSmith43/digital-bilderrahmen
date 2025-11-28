import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from './login/login.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  currentUser = signal<User | undefined | any>(undefined);

  register(email: string, password: string) {
    return this.http.post(`/auth/registration/${email}`, password, { responseType: 'text' }); // responseType: So that a parse problem does not occur.
  }

  login(email: string, password: string) {
    return this.http.post(`/auth/login/${email}`, password, { responseType: 'text' });
  }

  // Stateless (does not save previous states) logout. No backend required.
  logout() {
    this.currentUser.set(undefined);
  }
}
