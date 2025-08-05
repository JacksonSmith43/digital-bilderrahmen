import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  private authService = inject(AuthService);
  router = inject(Router);
  errorMessage = signal<string | undefined>(undefined);
  isLoginSuccessful = false;

  loginForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
  });



  get emailControl() {
    return this.loginForm.controls.email;
  }

  get passwordControl() {
    return this.loginForm.controls.password;
  }

  onSubmit(email: string, password: string) {
    console.log("onSubmit().");

    if (this.loginForm.invalid) {
      this.isLoginSuccessful = false;
      return;
    }

    this.authService.login(email, password).subscribe({
      next: (user) => {
        this.authService.currentUser.set(user);
        this.router.navigateByUrl("/viewAll");
      },
      error: (error) => {
        console.error("onSubmit()_error: ", error);
        this.errorMessage.set(error.message);
        this.isLoginSuccessful = false;
      }
    })
  }

}
