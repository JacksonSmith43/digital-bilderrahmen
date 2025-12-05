import { inject, Injectable, signal } from '@angular/core';
import { NgxFileDropEntry } from 'ngx-file-drop';

import { ImageType } from '../../shared/model/image-type.model';
import { LocalStorageRelatedService } from '../../shared/services/localstorage-related.service';
import { GalleryService } from '../../gallery/services/gallery.service';
import { NavbarService } from '../../navbar/navbar.service';

@Injectable({ providedIn: 'root' })
export class DragDropUploadService {
  localStorageRelatedService = inject(LocalStorageRelatedService);
  galleryService = inject(GalleryService);
  navService = inject(NavbarService);

  files = signal<NgxFileDropEntry[]>([]);

  addedImages = signal<ImageType[]>([]);
  // isAdding$ = this.store.select(selectIsAdding);

  constructor() {
    console.log('DragDropUploadService INIT.');

    this.loadSavedImages();
  }

  loadSavedImages() {
    console.log('loadSavedImages().');
    try {
      const savedImages = this.localStorageRelatedService.getImages('addedImages');

      if (savedImages.length > 0) {
      }
    } catch (error) {
      console.error('loadSavedImages()_Error: ', error);
    }
  }

  removeAddedImages(srcsToRemove: string[]) {
    console.log('removeAddedImages().');
  }

  removeGalleryImages(srcsToRemove: string[]) {
    console.log('removeGalleryImages().');
    console.log('removeGalleryImages()_srcsToRemove: ', srcsToRemove);

    return this.addedImages();
  }

  getDropped(files: NgxFileDropEntry[]) {
    console.log('getDropped().');

    this.files.set(files);
    // Is it a file?
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry; // Casts the fileEntry to FileSystemFileEntry to access file methods.
        fileEntry.file((file: File) => {
          console.log('getDropped()_Uploading file: ', file.name);

          // Upload file to backend immediately.
          this.galleryService.uploadImage(file).subscribe({
            next: uploadedImage => {
              console.log('getDropped()_Upload successful: ', uploadedImage);

              // Add uploaded image to addedImages signal.
              const currentImages = this.addedImages();
              this.addedImages.set([...currentImages, uploadedImage]);
              console.log('getDropped()_addedImages', this.addedImages());

              // Also display preview using FileReader.
              this.getHandleFile(file, uploadedImage);
            },
            error: error => {
              console.error('getDropped()_Upload failed: ', error);
            },
          });
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log('getDropped()_droppedFile.relativePath, fileEntry: ', droppedFile.relativePath, fileEntry);
      }
    }
    console.log(
      'getDropped()_this.files().relativePath',
      this.files().map(file => file.relativePath)
    );
  }

  getHandleFile(file: File, uploadedImage: ImageType) {
    console.log('getHandleFile().');

    const reader = new FileReader();

    // This event is triggered when the file is read successfully.
    reader.onload = (e: any) => {
      // Create preview image with base64 src for immediate display.
      const previewImage: ImageType = {
        ...uploadedImage, // Use backend data (id, filePath, etc.)
        src: e.target.result, // Add base64 preview for immediate display.
      };

      console.log('getHandleFile()_preview image created: ', previewImage);
    };
    reader.readAsDataURL(file); // This reads the file as a data URL, which is suitable for displaying images in the browser.
    console.log('getDropped()_getHandleFile', this.addedImages());
    this.localStorageRelatedService.saveToLocalStorage("addedImages", this.addedImages());
    this.navService.isAddImage = false;
  }
}
