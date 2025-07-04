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
  addedImages = this.dragDropUploadService.images;

  allImages = computed(() => [
    ...this.images(), ...this.addedImages() // Combines the images from both sources. 
  ]);

  onRemoveImage(index: number) {
    const galleryLength = this.images().length;

    if (index < galleryLength) { // Removes the hardcoded images. // 3 < 5 = Removes the image at the 3 index, so Hamsterviel. 
      this.images.update((imageArray) => {
        imageArray.splice(index, 1);
        return [...imageArray];
      })

    } else { // Removes the uploaded images. 
      const uploadIndex = index - galleryLength; // 3 - 5. 
      this.addedImages.update((imageArray) => {
        imageArray.splice(uploadIndex, 1);
        return [...imageArray];
      })
    }
  }


}
