import { Injectable, signal, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  isLoggedIn = signal<boolean>(false);
  firebaseAuth = inject(Auth);

  register(email: string, password: string): Observable<void> {
    const authPromise = createUserWithEmailAndPassword(this.firebaseAuth, email, password) // The purpose of this line is to create a new user with the given email and password.
      .then(() => { }); // This will return a Promise<void>. This is needed because the createUserWithEmailAndPassword function returns a Promise<void> and not an Observable<void>. This therefore converts the Promise<void> to an Observable<void>.

    return from(authPromise);
  }
}
