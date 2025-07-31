import { Component, inject } from '@angular/core';

import { DragDropUploadComponent } from "../drag-drop-upload/drag-drop-upload.component";
import { GalleryComponent } from "../gallery/gallery.component";
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-view-all',
  imports: [DragDropUploadComponent, GalleryComponent],
  templateUrl: './view-all.component.html',
  styleUrl: './view-all.component.css'
})

export class ViewAllComponent {
  private authService = inject(AuthService);
  isLoggedIn = this.authService.isLoggedIn;

}
