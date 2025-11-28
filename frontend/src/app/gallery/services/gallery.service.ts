import { Injectable, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ImageType } from '../../shared/model/image-type.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  store = inject(Store);
  private http = inject(HttpClient);

  selectedSrcs = signal<string[]>([]);
  galleryImages = signal<ImageType[]>([]);
  galleryImagesLength = signal<number>(0);
  isRemoving = signal<boolean>(false);

  constructor() {
    console.log('GalleryService INIT.');
  }

  get galleryHighlightSrcs() {
    return this.getHighlightImageSelection;
  }

  getHighlightImageSelection(src: string) {
    console.log('getHighlightImageSelection().');

    const selectedSrcs = this.selectedSrcs();

    // Checks if the image is already selected.
    if (selectedSrcs.includes(src)) {
      this.selectedSrcs.set(selectedSrcs.filter(i => i !== src)); // Removes the image from the selection if it is already selected. i => i !== index is a filter function that returns all elements that are not equal to the index of the clicked image.

      // Adds the image to the selection if it has not already been selected.
    } else {
      this.selectedSrcs.set([...selectedSrcs, src]);
    }
    console.log('getHighlightImageSelection()_this.selectedSrcs(): ', this.selectedSrcs());
  }

  deleteImage(id: number): Observable<void> {
    return this.http.delete<void>(`/api/gallery/images/${id}`);
  }

  uploadAllImages(images: ImageType[]): Observable<ImageType[]> {
    return this.http.post<ImageType[]>(`/api/gallery/images/upload`, images);
  }

  fetchAllImages(): Observable<ImageType[]> {
    return this.http.get<ImageType[]>(`/api/gallery/images`);
  }
}
