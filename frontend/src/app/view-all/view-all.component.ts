import { Component, inject, OnInit } from '@angular/core';

import { DragDropUploadComponent } from '../drag-drop-upload/drag-drop-upload.component';
import { GalleryComponent } from '../gallery/components/gallery.component';
import { AuthService } from '../auth/auth.service';
import { LocalStorageRelatedService } from '../shared/services/localstorage-related.service';

@Component({
  selector: 'app-view-all',
  imports: [DragDropUploadComponent, GalleryComponent],
  templateUrl: './view-all.component.html',
  styleUrl: './view-all.component.css',
})
export class ViewAllComponent {
  authService = inject(AuthService);
}
