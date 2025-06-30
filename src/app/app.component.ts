import { Component } from '@angular/core';
import { GalleryComponent } from "./gallery/gallery.component";
import { DragDropUploadComponent } from "./drag-drop-upload/drag-drop-upload.component";

@Component({
  selector: 'app-root',
  imports: [GalleryComponent, DragDropUploadComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'bilderrahmen';
}

