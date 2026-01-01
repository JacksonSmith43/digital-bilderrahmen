import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavbarService } from './navbar.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private navService = inject(NavbarService);
  authService = inject(AuthService);

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
}
