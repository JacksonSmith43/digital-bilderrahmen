import { Injectable, signal, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { User } from './login/login.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  firebaseAuth = inject(Auth);
  currentUser = signal<User | undefined>(undefined);
  user$ = user(this.firebaseAuth); // $ is used to indicate that this is an Observable. Which is used to listen to the changes in the user's authentication state.

  register(email: string, password: string): Observable<void> {
    const authPromise = createUserWithEmailAndPassword(this.firebaseAuth, email, password) // The purpose of this line is to create a new user with the given email and password.
      .then(() => { }); // This will return a Promise<void>. This is needed because the createUserWithEmailAndPassword function returns a Promise<void> and not an Observable<void>. This therefore converts the Promise<void> to an Observable<void>.

    return from(authPromise);
  }

  login(email: string, password: string): Observable<User> {
    const authPromise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((userCredentials) => {
        return {
          email: userCredentials.user.email,
          id: userCredentials.user.uid,

        } as User;
      });
    return from(authPromise);
  }

  logout(): Observable<void> {
    const authPromise = signOut(this.firebaseAuth);
    return from(authPromise);
  }
}
