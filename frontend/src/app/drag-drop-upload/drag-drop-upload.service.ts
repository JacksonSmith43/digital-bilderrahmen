import { inject, Injectable, signal } from '@angular/core';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { Store } from '@ngrx/store';

import { selectAddDroppedFiles, selectAddImages, selectIsAdding } from '../gallery/state/gallery.selectors';
import { GalleryActions } from '../gallery/state/gallery.actions';
import { ImageType } from '../shared/model/image-type.model';
import { LocalStorageRelatedService } from '../shared/services/localstorage-related.service';
import { FileNameService } from '../shared/services/file-name.service';

@Injectable({ providedIn: 'root' })
export class DragDropUploadService {
  localStorageRelatedService = inject(LocalStorageRelatedService);
  private fileNameService = inject(FileNameService);

  store = inject(Store);

  files = signal<NgxFileDropEntry[]>([]);

  droppedFiles$ = this.store.select(selectAddDroppedFiles);
  addedImages$ = this.store.select(selectAddImages);
  isAdding$ = this.store.select(selectIsAdding);

  constructor() {
    console.log('DragDropUploadService INIT.');

    this.loadSavedImages();
  }

  loadSavedImages() {
    console.log('loadSavedImages().');
    try {
      const savedImages = this.localStorageRelatedService.getImages('addedImages');

      if (savedImages.length > 0) {
        this.store.dispatch(GalleryActions.addImagesSuccess(savedImages));
      }
    } catch (error) {
      console.error('loadSavedImages()_Error: ', error);
    }
  }

  removeAddedImages(srcsToRemove: string[]) {
    console.log('removeAddedImages().');
    this.store.dispatch(GalleryActions.removeAddedImages({ srcsToRemove }));
  }

  removeGalleryImages(srcsToRemove: string[]) {
    console.log('removeGalleryImages().');
    console.log('removeGalleryImages()_srcsToRemove: ', srcsToRemove);

    this.store.dispatch(GalleryActions.removeAddedImages({ srcsToRemove }));
    this.localStorageRelatedService.syncImageStores();

    return this.addedImages$;
  }

  getDropped(files: NgxFileDropEntry[]) {
    console.log('getDropped().');

    this.files.set(files);
    // Is it a file?
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry; // Casts the fileEntry to FileSystemFileEntry to access file methods.
        fileEntry.file((file: File) => {
          this.getHandleFile(file, droppedFile.relativePath);
          // Here you can access the real file
          console.log('getDropped()_droppedFile.relativePath, file: ', droppedFile.relativePath, file);
          this.store.dispatch(GalleryActions.addDroppedFiles({ files: [droppedFile] }));
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

  getHandleFile(file: File, relativePath: string) {
    console.log('getHandleFile().');

    const reader = new FileReader(); // This is used to read the file as a data URL.

    // This event is triggered when the file is read successfully.
    reader.onload = (e: any) => {
      // This adds the image to the images array.
      const image: ImageType = {
        src: e.target.result,
        alt: this.fileNameService.normaliseFileName(file.name),
        relativePath: this.fileNameService.normaliseFileName(relativePath),
      };
      this.store.dispatch(GalleryActions.addImages({ image }));
      this.localStorageRelatedService.saveToLocalStorage('addedImages', image);
      console.log('getHandleFile()_image', image);
    };
    reader.readAsDataURL(file); // This reads the file as a data URL, which is suitable for displaying images in the browser.
  }
}
