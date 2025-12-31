import { Component, computed, inject, OnInit, signal } from '@angular/core';
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

  filterState = signal<'allImages' | 'deviceImages' | 'notDeviceImages'>('allImages');

  selectedSrcs = this.galleryService.selectedSrcs;
  galleryImages = this.galleryService.galleryImages;
  isRemoving = this.galleryService.isRemoving;

  galleryImagesLength = computed(() => this.galleryImages().length);
  filteredImagesLength = computed(() => this.filteredImageStates().length);
  isImageLoaded = computed(
    () => this.galleryService.galleryImages() !== undefined && this.galleryService.galleryImages() !== null
  );

  filteredImageStates = computed(() => {
    if (this.filterState() === 'allImages') {
      return this.galleryImages();
    } else if (this.filterState() === 'deviceImages') {
      let deviceImagesFiltered = this.galleryImages().filter(image => image.isSelectedForDevice);
      this.localStorageRelatedService.saveToLocalStorage('deviceImages', deviceImagesFiltered);
      return deviceImagesFiltered;
    } else {
      console.log('filteredImageStates_notDeviceImages.');
      return this.galleryImages().filter(image => !image.isSelectedForDevice);
    }
  });

  async ngOnInit() {
    console.log('GalleryComponent INIT.');
    try {
      let addedImages: ImageType[] = this.localStorageRelatedService.getImages('addedImages');
      let galleryImages: ImageType[] = this.localStorageRelatedService.getImages('galleryImages');

      console.log('ngOnInit()_galleryImages: ', galleryImages);
      console.log('ngOnInit()_galleryImages.length: ', galleryImages.length);

      this.galleryService.selectedSrcs.set([]);
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

  onHighlightImageSelection(image: ImageType) {
    console.log('onHighlightImageSelection().');

    // If the image has not been selected yet.
    if (!this.selectedSrcs().includes(image)) {
      console.log('onHighlightImageSelection()_filePath: ', image.filePath);
    }

    this.galleryService.getHighlightImageSelection(image);
  }

  isImageSelected(image: ImageType): boolean {
    return this.selectedSrcs().includes(image);
  }

  onRemoveImages() {
    console.log('onRemoveSelectedImages().');
    const imagesToDelete = this.selectedSrcs();

    if (imagesToDelete.length === 0) {
      console.log('onRemoveSelectedImages()_No images selected.');
      return;
    }

    console.log('onRemoveSelectedImages()_Deleting images:', imagesToDelete.length);
    this.isRemoving.set(true);

    let completedDeletions = 0;
    // Delete each selected image.
    imagesToDelete.forEach(image => {
      this.galleryService.deleteImage(image).subscribe({
        next: () => {
          completedDeletions++;
          console.log(`onRemoveSelectedImages()_Deleted ${completedDeletions}/${imagesToDelete.length}`);

          // When all deletions are complete.
          if (completedDeletions === imagesToDelete.length) {
            this.galleryService.selectedSrcs.set([]);
            this.onFetchAllImages();
            this.isRemoving.set(false);
            console.log('onRemoveSelectedImages()_All deletions complete.');
          }
        },
        error: error => {
          console.error('onRemoveSelectedImages()_Error deleting image: ', error);
          completedDeletions++;
          if (completedDeletions === imagesToDelete.length) {
            this.isRemoving.set(false);
          }
        },
      });
    });
  }

  onToggleImageOnDevice() {
    console.log('onToggleImageOnDevice().');

    const imagesToSelect = this.selectedSrcs();

    if (imagesToSelect.length === 0) {
      console.log('onToggleImageOnDevice()_No images selected.');
      return;
    }

    console.log('onToggleImageOnDevice()_Selecting images length:', imagesToSelect.length);
    let completedSelections = 0;

    // Iterates through all of the selected images for the device.
    imagesToSelect.forEach(image => {
      const newState = !image.isSelectedForDevice; // Toggles the state.

      this.galleryService.toggleImageForDevice(image.id, newState).subscribe({
        next: () => {
          completedSelections++;
          console.log(`onToggleImageOnDevice()_Selected ${completedSelections}/${imagesToSelect.length}`);

          // When all selections are complete.
          if (completedSelections === imagesToSelect.length) {
            this.onFetchAllImages();

            console.log('onToggleImageOnDevice()_All selections/removeale complete.');
            console.log(`onToggleImageOnDevice()_ID: ${image.id}, newState: ${newState}.`);

            this.galleryService.selectedSrcs.set([]);
          }
        },
        error: error => {
          console.error('onToggleImageOnDevice()_Error toggling image selection:', error);
          completedSelections++;
        },
      });
    });
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
        this.localStorageRelatedService.saveToLocalStorage('addedImages', []);

        let deviceImages = this.galleryImages().filter(image => image.isSelectedForDevice);
        this.localStorageRelatedService.saveToLocalStorage('deviceImages', deviceImages);
      },
      error: error => console.error('onFetchAllImages()_Fetch failed: ', error),
    });
  }

  getCurrentUser() {
    return this.authService.currentUser();
  }
}
