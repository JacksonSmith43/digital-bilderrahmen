import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../auth.service';
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {
  private authService = inject(AuthService)
  isRegistrationSuccessful = false;
  errorMessage = signal<string | undefined>(undefined);

  registerForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
  });


  get emailControl() {
    return this.registerForm.controls.email;
  }

  get passwordControl() {
    return this.registerForm.controls.password;
  }

  onSubmit(email: string, password: string) {
    console.log("onSubmit().");

    if (this.registerForm.invalid) {
      this.isRegistrationSuccessful = false;
      return;
    }

    console.log(this.registerForm.value);

    if (this.registerForm.valid) {
      this.errorMessage.set(undefined);

      this.authService.register(email, password).subscribe({
        next: () => {
          this.isRegistrationSuccessful = true;

          setTimeout((() => {
            this.isRegistrationSuccessful = false;
            this.registerForm.reset();
          }), 2000)
        },
        error: (error) => {
          console.error("onSubmit()_error: ", error);
          this.errorMessage.set(error.message);
          this.isRegistrationSuccessful = false;
        }
      });
    }
  }

}
