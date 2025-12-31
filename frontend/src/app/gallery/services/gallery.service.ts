import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ImageType } from '../../shared/model/image-type.model';
import { LocalStorageRelatedService } from '../../shared/services/localstorage-related.service';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private http = inject(HttpClient);
  localStorageService = inject(LocalStorageRelatedService);

  selectedSrcs = signal<ImageType[]>([]);
  galleryImages = signal<ImageType[]>([]);
  galleryImagesLength = signal<number>(0);
  isRemoving = signal<boolean>(false);

  constructor() {
    console.log('GalleryService INIT.');
  }

  getHighlightImageSelection(image: ImageType) {
    console.log('getHighlightImageSelection().');

    // Checks if the image is already selected.
    if (this.selectedSrcs().includes(image)) {
      this.selectedSrcs.set(this.selectedSrcs().filter(i => i !== image)); // Removes the image from the selection if it is already selected. i => i !== index is a filter function that returns all elements that are not equal to the index of the clicked image.

      // Adds the image to the selection if it has not already been selected.
    } else {
      this.selectedSrcs.set([...this.selectedSrcs(), image]);
      console.log('getHighlightImageSelection()_New image selected_selectedSrcs: ', this.selectedSrcs());
    }
    console.log('getHighlightImageSelection()_this.selectedSrcs(): ', this.selectedSrcs());
  }

  deleteImage(images: ImageType): Observable<ImageType> {
    console.log('deleteImage().');

    return this.http.delete<ImageType>(`/api/gallery/images/deleted/${images.id}`);
  }

  uploadImage(file: File, description?: string): Observable<ImageType> {
    console.log('uploadImage().');

    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    return this.http.post<ImageType>(`/api/gallery/images/upload`, formData);
  }

  fetchAllImages(): Observable<ImageType[]> {
    console.log('fetchAllImages().');

    return this.http.get<ImageType[]>(`/api/gallery/images`);
  }

  toggleImageForDevice(imageId: number, isSelectedForDevice: boolean): Observable<void> {
    console.log('toggleImageForDevice().');
    console.log('toggleImageForDevice()_imageId:', imageId);

    return this.http.post<void>(`/api/gallery/images/${imageId}/${isSelectedForDevice}`, {});
  }
}
