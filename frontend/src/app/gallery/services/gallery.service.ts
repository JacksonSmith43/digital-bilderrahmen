import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ImageType } from '../../shared/model/image-type.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private http = inject(HttpClient);

  selectedSrcs = signal<string[]>([]);
  galleryImages = signal<ImageType[]>([]);
  galleryImagesLength = signal<number>(0);
  isRemoving = signal<boolean>(false);

  constructor() {
    console.log('GalleryService INIT.');
  }

  getHighlightImageSelection(filePath: string) {
    console.log('getHighlightImageSelection().');

    const selectedSrcs = this.selectedSrcs();
    console.log('getHighlightImageSelection()_filePath: ', filePath);

    // Checks if the image is already selected.
    if (selectedSrcs.includes(filePath)) {
      this.selectedSrcs.set(selectedSrcs.filter(i => i !== filePath)); // Removes the image from the selection if it is already selected. i => i !== index is a filter function that returns all elements that are not equal to the index of the clicked image.
      console.log('getHighlightImageSelection()_selectedSrcs: ', selectedSrcs);

      // Adds the image to the selection if it has not already been selected.
    } else {
      this.selectedSrcs.set([...selectedSrcs, filePath]);
      console.log('getHighlightImageSelection()_New image selected_selectedSrcs: ', selectedSrcs);
    }
    console.log('getHighlightImageSelection()_this.selectedSrcs(): ', this.selectedSrcs());
  }

  deleteImage(id: number): Observable<void> {
    return this.http.delete<void>(`/api/gallery/images/${id}`);
  }

  uploadImage(file: File, description?: string): Observable<ImageType> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    return this.http.post<ImageType>(`/api/gallery/images/upload`, formData);
  }

  fetchAllImages(): Observable<ImageType[]> {
    return this.http.get<ImageType[]>(`/api/gallery/images`);
  }
}
