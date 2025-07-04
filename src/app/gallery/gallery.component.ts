import { Component, computed, inject, signal } from '@angular/core';
import { GalleryService } from './gallery.service';
import { DragDropUploadService } from '../drag-drop-upload/drag-drop-upload.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})

export class GalleryComponent {
  private galleryService = inject(GalleryService);
  private dragDropUploadService = inject(DragDropUploadService);

  images = this.galleryService.images;
  addedImages = this.dragDropUploadService.images;
  public selectedImages = signal<number[]>([]);


  allImages = computed(() => [
    ...this.images(), ...this.addedImages() // Combines the images from both sources. 
  ]);

  onRemoveImage() {
    console.log(this.selectedImages());
    const galleryLength = this.images().length;
    let index: number[];

    for (let i = 0; i < this.selectedImages.length; i++) {
      index = this.selectedImages();
      if (index[i] < galleryLength) { // Removes the hardcoded images. // 3 < 5 = Removes the image at the 3 index, so Hamsterviel. 
        this.images.update((imageArray) => {
          imageArray.splice(index[i], 1);
          return [...imageArray];
        })

      } else { // Removes the uploaded images. 
        const uploadIndex = index[i] - galleryLength; // 3 - 5. 
        this.addedImages.update((imageArray) => {
          imageArray.splice(uploadIndex, 1);
          return [...imageArray];
        })
      }
    }
  }

  onHighlightImageSelection(index: number) {
    const selectedImagesArray = this.selectedImages();

    if (selectedImagesArray.includes(index)) { // Checks if the image is already selected.
      this.selectedImages.set(selectedImagesArray.filter(i => i !== index)); // Removes the image from the selection if it is already selected. i => i !== index is a filter function that returns all elements that are not equal to the index of the clicked image.

    } else { // Adds the image to the selection if it has not already been selected. 
      this.selectedImages.set([...selectedImagesArray, index]);
    }

    console.log("this.selectedImages(): ", this.selectedImages());
  }

}
