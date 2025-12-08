import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../auth/auth.service';
import { ImageType } from '../../shared/model/image-type.model';
import { LocalStorageRelatedService } from '../../shared/services/localstorage-related.service';
import { GalleryService } from '../services/gallery.service';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent implements OnInit {
  authService = inject(AuthService);
  private localStorageRelatedService = inject(LocalStorageRelatedService);
  private galleryService = inject(GalleryService);

  selectedSrcs = this.galleryService.selectedSrcs;
  galleryImages = this.galleryService.galleryImages;
  isRemoving = this.galleryService.isRemoving;

  galleryImagesLength = computed(() => this.galleryService.galleryImages().length);
  isImageLoaded = computed(
    () => this.galleryService.galleryImages() !== undefined && this.galleryService.galleryImages() !== null
  );

  async ngOnInit() {
    console.log('GalleryComponent INIT.');
    try {
      let addedImages: ImageType[] = this.localStorageRelatedService.getImages('addedImages');
      let galleryImages: ImageType[] = this.localStorageRelatedService.getImages('galleryImages');

      console.log('ngOnInit()_galleryImages: ', galleryImages);
      console.log('ngOnInit()_galleryImages.length: ', galleryImages.length);

      console.log('ngOnInit()_galleryImages()', this.galleryImages());

      this.onFetchAllImages();

      if (addedImages.length > 0) {
        let allImages = [...galleryImages, ...addedImages];
        console.log('ngOnInit()_allImages: ', allImages);
        this.localStorageRelatedService.saveToLocalStorage('galleryImages', allImages);
      } else if (addedImages.length === 0) {
        this.localStorageRelatedService.saveToLocalStorage('galleryImages', galleryImages);
      }
    } catch (error) {
      console.error('ngOnInit()_Error initialising gallery: ', error);
    }
  }

  onHighlightImageSelection(src: string) {
    console.log('onHighlightImageSelection().');
    this.galleryService.getHighlightImageSelection(src);
  }

  isImageSelected(src: string): boolean {
    return this.selectedSrcs().includes(src);
  }

  onRemoveImage(image: ImageType) {
    console.log('onRemoveImage().');
    this.galleryService.deleteImage(image.id).subscribe(success => {
      // this.removeImagesFromList(image.id);
    });
  }

  onSelectForDevice(image: ImageType) {
    console.log('onSelectForDevice().');
  }

  onFetchAllImages() {
    console.log('onFetchAllImages().');

    this.galleryService.fetchAllImages().subscribe({
      next: images => {
        console.log('onFetchAllImages()_Images fetched successfully: ', images);
        console.log('onFetchAllImages()_Number of images: ', images.length);
        console.log('onFetchAllImages()_First image filePath: ', images[0]?.filePath);
        this.galleryImages.set(images);
        console.log('onFetchAllImages()_this.galleryImages: ', this.galleryImages());

        // Save to localStorage after images have been loaded.
        this.localStorageRelatedService.saveToLocalStorage('galleryImages', this.galleryImages());
      },
      error: error => console.error('onFetchAllImages()_Fetch failed: ', error),
    });
  }

  getCurrentUser() {
    return this.authService.currentUser();
  }
}
