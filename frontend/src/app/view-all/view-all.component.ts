import { Component } from '@angular/core';

import { DragDropUploadComponent } from "../drag-drop-upload/drag-drop-upload.component";
import { GalleryComponent } from "../gallery/gallery.component";

@Component({
  selector: 'app-view-all',
  imports: [DragDropUploadComponent, GalleryComponent],
  templateUrl: './view-all.component.html',
  styleUrl: './view-all.component.css'
})

export class ViewAllComponent {

}
