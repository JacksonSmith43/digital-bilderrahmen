import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { LocalStorageRelatedService } from '../../shared/services/localstorage-related.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  localStorageService = inject(LocalStorageRelatedService);

  errorMessage = signal<string | undefined>(undefined);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
  });

  get emailControl() {
    return this.loginForm.controls.email;
  }

  get passwordControl() {
    return this.loginForm.controls.password;
  }

  onSubmit(email: string, password: string) {
    console.log('onSubmit().');

    if (this.loginForm.invalid) {
      this.authService.isLoginSuccessful = false;
      return;
    }

    this.authService.login(email, password).subscribe({
      next: user => {
        console.log('login()_user', user);
        this.authService.currentUser.set(user);
        this.authService.isLoggedOut.set(false);
        this.authService.isLoginSuccessful = true;
        this.localStorageService.saveUserToLocalStorage('userEmail', email);
        this.authService.successMessage.set('Successful login.');

        setTimeout(() => {
          this.authService.successMessage.set('');
          this.router.navigateByUrl('/viewAll');
        }, 1000);
      },
      error: error => {
        console.error('onSubmit()_error: ', error);
        this.errorMessage.set(error.message);
        this.authService.isLoginSuccessful = false;
      },
    });
  }
}
