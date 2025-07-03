import { Component, computed, inject, signal } from '@angular/core';
import { GalleryService } from './gallery.service';
import { DragDropUploadService } from '../drag-drop-upload/drag-drop-upload.service';

@Component({
  selector: 'app-gallery',
  imports: [],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})

export class GalleryComponent {
  private galleryService = inject(GalleryService);
  private dragDropUploadService = inject(DragDropUploadService);

  images = this.galleryService.images;
  imagesSignal = signal(this.images);
  addedImages = this.dragDropUploadService.images;

  allImages = computed(() => [
    ...this.imagesSignal(), ...this.addedImages() // Combines the images from both sources. 
  ]);

}
