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
              this.addedImages.set([...this.addedImages(), uploadedImage]);
              console.log('getDropped()_addedImages', this.addedImages());

              // Also display preview using FileReader.
              this.getHandleFile(file, uploadedImage, droppedFile.relativePath);
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

  getHandleFile(file: File, uploadedImage: ImageType, relativePath: string) {
    console.log('getHandleFile().');

    const reader = new FileReader();

    // This event is triggered when the file is read successfully.
    reader.onload = (e: any) => {
      const currentImages = this.addedImages();

      const updatedImages = currentImages.map(img => {
        if (img.id === uploadedImage.id) {
          console.log('getHandleFile()_Updating image with src: ', e.target.result.substring(0, 50) + '...');
          return {
            ...img,
            src: e.target.result, // Add base64 preview.
            relativePath: relativePath, // Add for matching.
          };
        }
        return img;
      });

      this.addedImages.set(updatedImages);

      this.localStorageRelatedService.saveToLocalStorage('addedImages', this.addedImages());
    };

    reader.readAsDataURL(file);
    this.navService.isAddImage = false;
  }
}
