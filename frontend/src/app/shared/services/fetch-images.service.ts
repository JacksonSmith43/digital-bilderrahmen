import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import { DeviceSettingsActions } from '../../device-settings/state/device-settings.action';
import { selectIsDevice, selectUpdateDeviceImages } from '../../device-settings/state/device-settings.selector';
import { FirebaseContextService } from '../../gallery/services/firebase-context.service';
import { GalleryActions } from '../../gallery/state/gallery.actions';
import { ImageType } from '../model/image-type.model';
import { SharedActions } from '../state/shared.actions';
import { ArrayUtilsService } from './array-utils.service';
import { FileNameService } from './file-name.service';
import { LocalStorageRelatedService } from './localstorage-related.service';

@Injectable({ providedIn: 'root' })
export class FetchImagesService {
  private firebaseContextService = inject(FirebaseContextService);
  private localStorageRelatedService = inject(LocalStorageRelatedService);
  private store = inject(Store);
  private fileNameService = inject(FileNameService);
  private arrayUtilsService = inject(ArrayUtilsService);

  isDevice = toSignal(this.store.select(selectIsDevice));
  deviceImages = toSignal(this.store.select(selectUpdateDeviceImages));

  async fetchAndDisplayImages() {
    console.log('fetchAndDisplayImages().');

    try {
      let fetchUrls: ImageType[] = [];
      let fetchUrlsSrc: string[] = [];

      if (!this.isDevice()) {
        console.log('fetchAndDisplayImages()_this.fetchAllImages(): ');
        fetchUrls = await this.fetchAllImages();
        this.store.dispatch(SharedActions.fetchAllImagesSuccess({ images: fetchUrls }));
      } else if (this.isDevice()) {
        fetchUrls = await this.fetchImagesFromFolder('selectForDevice', 'chosenImagesSrcs');
        this.store.dispatch(DeviceSettingsActions.uploadForDeviceSuccess({ deviceImages: fetchUrls }));
      } else {
        console.log('fetchAndDisplayImages()_Different action selected.');
      }

      fetchUrlsSrc = fetchUrls.map(url => url.src);

      // This will loop through all the images and add them to the images array.
      const images = fetchUrlsSrc.map((url, index) => ({
        src: url,
        alt: this.fileNameService.normaliseFileName(url),
        relativePath: this.fileNameService.normaliseFileName(url),
      }));
      console.log('fetchAndDisplayImages()_this.isDevice(): ', this.isDevice());

      // !this.isDevice() is selectForDevice.
      if (this.isDevice()) {
        this.store.dispatch(DeviceSettingsActions.uploadForDevice({ image: this.deviceImages() || [] }));

        // !this.isDevice() is uploadAllImages.
      } else if (!this.isDevice()) {
        console.log('fetchAndDisplayImages()_images: ', images);
      }
    } catch (error) {
      this.store.dispatch(SharedActions.fetchAllImagesFailure({ error: JSON.stringify(error) }));
      console.error('fetchAndDisplayImages(): An error has occured whilst loading images from Firebase:', error);
    }
  }

  async fetchAllImages(): Promise<ImageType[]> {
    console.log('fetchAllImages().');
    return this.fetchImagesFromFolder('uploadedAllImages', 'galleryImages');
  }

  async fetchImagesFromFolder(
    folderName: 'uploadedAllImages' | 'selectForDevice',
    localStorageKey: 'galleryImages' | 'chosenImagesSrcs'
  ): Promise<ImageType[]> {
    console.log('fetchImagesFromFolder().');
    console.log(`fetchImagesFromFolder()_Folder: ${folderName}, Storage: ${localStorageKey}`);

    try {
      const listRef = this.firebaseContextService.getReference(folderName);
      const listResult = await this.firebaseContextService.listAll(listRef);

      if (listResult.items.length === 0) {
        console.warn(`fetchImagesFromFolder()_No images found in ${folderName} folder.`);
        this.localStorageRelatedService.saveToLocalStorage(localStorageKey, []);
        return [];
      }

      const cachedImages: ImageType[] = this.localStorageRelatedService.getImages(localStorageKey);

      console.log(`fetchImagesFromFolder()_Firebase: ${listResult.items.length}, Cached: ${cachedImages.length}`);

      const cachedFileNames = cachedImages.map(img =>
        this.fileNameService.normaliseFileName(img.relativePath || img.alt || '')
      );
      const firebaseFileNames = listResult.items.map(item => this.fileNameService.normaliseFileName(item.name));

      const newImageNames = firebaseFileNames.filter(name => !cachedFileNames.includes(name));
      console.log(`fetchImagesFromFolder()_New images to fetch: ${newImageNames.length}`);

      if (newImageNames.length === 0) {
        console.log(`fetchImagesFromFolder()_No new images, using cached data.`);
        return cachedImages;
      }

      const newImages = await this.fetchNewImagesFromFirebase(listResult.items, newImageNames);
      const allImages = [...cachedImages, ...newImages];

      const uniqueImages = this.arrayUtilsService.removeDuplicatesByName(allImages);

      this.localStorageRelatedService.saveToLocalStorage(localStorageKey, uniqueImages);

      if (folderName === 'uploadedAllImages') {
        this.store.dispatch(GalleryActions.updateGalleryImages({ images: uniqueImages }));
      } else {
        this.store.dispatch(DeviceSettingsActions.updateDeviceImages({ updatedImages: uniqueImages }));
      }

      console.log(`fetchImagesFromFolder()_Result: ${uniqueImages.length} total images.`);
      return uniqueImages;
    } catch (error) {
      console.error(`fetchImagesFromFolder()_Error fetching from ${folderName}:`, error);
      throw error;
    }
  }

  private async fetchNewImagesFromFirebase(allFirebaseItems: any[], newImageNames: string[]): Promise<ImageType[]> {
    console.log('fetchNewImagesFromFirebase()_Fetching:', newImageNames.length);

    const itemsToFetch = allFirebaseItems.filter(item => {
      const normalisedName = this.fileNameService.normaliseFileName(item.name);
      return newImageNames.includes(normalisedName);
    });

    // Fetch all URLs at once.
    const fetchPromises = itemsToFetch.map(async item => {
      try {
        const url = await this.firebaseContextService.getDownloadURL(item);
        return {
          src: url,
          alt: item.name,
          relativePath: item.name,
        };
      } catch (error) {
        console.error(`fetchNewImagesFromFirebase()_Error loading ${item.name}:`, error);
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);

    // Remove failed fetches.
    const validImages = results.filter(img => img !== null);

    console.log(`fetchNewImagesFromFirebase()_Successfully fetched: ${validImages.length}/${itemsToFetch.length}`);
    return validImages;
  }
}
