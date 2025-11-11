import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { selectIsRemoving, selectIsSelecting, selectUpdateGalleryImages } from '../state/gallery.selectors';
import { GalleryActions } from '../state/gallery.actions';
import { ImageType } from '../../shared/model/image-type.model';
import { SharedActions } from '../../shared/state/shared.actions';
import { selectCurrentAction, selectSelectedSrcs } from '../../shared/state/shared.selector';
import { LocalStorageRelatedService } from '../../shared/services/localstorage-related.service';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent implements OnInit {
  private authService = inject(AuthService);
  private localStorageRelatedService = inject(LocalStorageRelatedService);
  private store = inject(Store);

  galleryImages = toSignal(this.store.select(selectUpdateGalleryImages), {
    initialValue: [],
  });

  selectedSrcs = toSignal(this.store.select(selectSelectedSrcs), {
    initialValue: [],
  });

  isRemoving = toSignal(this.store.select(selectIsRemoving), {
    initialValue: false,
  });
  isSelecting = toSignal(this.store.select(selectIsSelecting), {
    initialValue: false,
  });

  galleryImagesLength = computed(() => this.galleryImages().length);
  isImageLoaded = computed(() => this.galleryImages() !== undefined && this.galleryImages() !== null);

  currentAction$ = this.store.select(selectCurrentAction);

  async ngOnInit() {
    console.log('GalleryComponent INIT.');
    try {
      let addedImages: ImageType[] = this.localStorageRelatedService.getImages('addedImages');
      let galleryImages: ImageType[] = this.localStorageRelatedService.getImages('galleryImages');
      console.log('ngOnInit()_galleryImages: ', galleryImages);
      console.log('ngOnInit()_galleryImages.length: ', galleryImages.length);

      if (addedImages.length > 0) {
        let allImages = [...galleryImages, ...addedImages];
        console.log('ngOnInit()_allImages: ', allImages);
        this.localStorageRelatedService.saveToLocalStorage('galleryImages', allImages);
        this.store.dispatch(GalleryActions.updateGalleryImages({ images: allImages }));
      } else if (addedImages.length === 0) {
        this.localStorageRelatedService.saveToLocalStorage('galleryImages', galleryImages);

        this.store.dispatch(GalleryActions.updateGalleryImages({ images: galleryImages }));
      }

      this.store.dispatch(SharedActions.clearSelection());
      this.store.dispatch(SharedActions.loadImages());
    } catch (error) {
      console.error('ngOnInit()_Error initialising gallery: ', error);
    }
  }

  onHighlightImageSelection(src: string) {
    console.log('onHighlightImageSelection().');
    this.store.dispatch(SharedActions.toggleImageSelection({ src }));
    let isNowSelected = this.selectedSrcs().includes(src);
    console.log('onHighlightImageSelection()_isNowSelected: ', isNowSelected);
  }

  onRemoveImage() {
    console.log('onRemoveImage().');
    this.store.dispatch(GalleryActions.deleteGalleryImages({ selectedSrcs: this.selectedSrcs() }));
  }

  onSelectForDevice(image: ImageType) {
    console.log('onSelectForDevice().');
    this.store.dispatch(
      GalleryActions.uploadToDevice({
        selectedSrcs: this.selectedSrcs(),
      })
    );
  }

  onUploadAllImages() {
    console.log('onUploadAllImages().');

    this.store.dispatch(
      GalleryActions.uploadToGallery({
        selectedSrcs: this.selectedSrcs(),
      })
    );
  }

  onFetchAllImages() {
    console.log('onFetchAllImages().');
    this.store.dispatch(SharedActions.fetchAllImages());
  }

  getCurrentUser() {
    return this.authService.currentUser();
  }

  async getCurrentAction(): Promise<string> {
    console.log('getCurrentAction().');
    return await firstValueFrom(this.currentAction$); // firstValueFrom converts Observable to Promise and resolves the first emitted value.
  }
}
