import { Component, computed, inject, signal } from '@angular/core';
import { GalleryService } from './gallery.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})

export class GalleryComponent {
  private galleryService = inject(GalleryService);

  images = this.galleryService.images;
  selectedImages = this.galleryService.selectedImages;
  allImages = this.galleryService.allImages;

  onRemoveImage() {
    console.log("Deleting.");
    this.galleryService.getRemoveImage();
  }

  onHighlightImageSelection(index: number) {
    this.galleryService.getHighlightImageSelection(index);
  }

}
