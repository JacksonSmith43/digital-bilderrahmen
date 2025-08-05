import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";

import { NavbarService } from './navbar.service';
import { AuthService } from '../auth/auth.service';
import { User as FireAuthUser } from '@angular/fire/auth';
import { User } from '../auth/login/login.model';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {
  private navService = inject(NavbarService);
  authService = inject(AuthService);

  constructor() {
    this.authService.user$.subscribe({ // This is required to get the current user, so that the navbar can be updated when the user logs in or out. 
      next: (user: FireAuthUser | null) => {
        if (user) {
          const applicationUser: User = {
            email: user.email!,
            id: user.uid
          };
          this.authService.currentUser.set(applicationUser);
        }
      }
    });
  }

  onAllView() {
    return this.navService.getAllView();
  }

  onPicturesView() {
    return this.navService.getPictureView();
  }

  onDragDropView() {
    return this.navService.getDragDropView();
  }

  onDeviceSettingsView() {
    return this.navService.getDeviceSettingsView();
  }

  getSelectedViewLabel() {
    return this.navService.getSelectedViewLabel();
  }

  onIsAddImage() {
    console.log(this.navService.getIsAddImage());
    return this.navService.getIsAddImage();
  }

  onLogin() {
    this.authService.isLoggedIn.set(true);
  }

  onLogout() {
    this.authService.isLoggedIn.set(false);
  }

}
