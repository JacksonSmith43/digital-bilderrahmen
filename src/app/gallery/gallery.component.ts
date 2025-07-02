import { Component, computed, inject, input, signal } from '@angular/core';
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
    ...this.imagesSignal(), ...this.addedImages().map(src => ({ src, alt: "" })) // Combines the images from the gallery and the added images by mapping each image URL to an object with src and alt properties. addedImages will be addded to imagesSignal when a new image is added via drag and drop upload.
  ]);

}
