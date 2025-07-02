import { Component } from '@angular/core';
import { GalleryComponent } from "./gallery/gallery.component";
import { DragDropUploadComponent } from "./drag-drop-upload/drag-drop-upload.component";
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [GalleryComponent, DragDropUploadComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'bilderrahmen';
  isOnlyPictures = false;
  isDragDrop = false;
  isAllView = true;
  selectedView: "viewAll" | "viewPictures" | "viewDragDrop" = "viewAll";

  onPicturesView() {
    this.isOnlyPictures = true;
    this.isAllView = false;
    this.isDragDrop = false;
    this.selectedView = "viewPictures"
  }

  onDragDropView() {
    this.isOnlyPictures = false;
    this.isAllView = false;
    this.isDragDrop = true;
    this.selectedView = "viewDragDrop"
  }

  onAllView() {
    this.isOnlyPictures = false;
    this.isAllView = true;
    this.isDragDrop = false;
    this.selectedView = "viewAll"
  }
}

