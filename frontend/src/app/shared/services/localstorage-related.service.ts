import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { firstValueFrom } from 'rxjs';

import { ImageType, ImageTypeSrc } from '../model/image-type.model';
import { SharedActions } from '../state/shared.actions';
import { selectAddImages, selectUpdateGalleryImages } from '../../gallery/state/gallery.selectors';
import { FileNameService } from './file-name.service';
import { ArrayUtilsService } from './array-utils.service';

@Injectable({ providedIn: 'root' })
export class LocalStorageRelatedService {
  private store = inject(Store);
  private fileNameService = inject(FileNameService);
  private arrayUtilsService = inject(ArrayUtilsService);

  galleryImages$ = this.store.select(selectUpdateGalleryImages);
  addedImages$ = this.store.select(selectAddImages);

  getImages(key: 'galleryImages' | 'addedImages' | 'chosenImagesSrcs') {
    console.log('getImages().');

    const savedImages = localStorage.getItem(key);
    if (savedImages) {
      try {
        console.log('getImages()_savedImages: ', savedImages);
        return JSON.parse(savedImages);
      } catch (error) {
        console.error(`getImages()_Error parsing ${key}:`, error);
      }
    }
    return [];
  }

  saveToLocalStorage(
    key: 'galleryImages' | 'addedImages' | 'chosenImagesSrcs' | 'deletedSrcArr',
    images: string[] | ImageType[] | ImageType | NgxFileDropEntry[]
  ) {
    console.log('saveToLocalStorage().');
    localStorage.setItem(key, JSON.stringify(images));
    this.store.dispatch(SharedActions.clearSelection());
  }

  async syncAllImageStores(): Promise<ImageType[]> {
    console.log('syncAllImageStores().');

    localStorage.removeItem('galleryImages');
    localStorage.removeItem('addedImages');

    // await this.sharedGalleryService.fetchAndDisplayImages();

    const galleryImages = await firstValueFrom(this.galleryImages$);
    const addedImages = await firstValueFrom(this.addedImages$);

    this.saveToLocalStorage('galleryImages', galleryImages);
    this.saveToLocalStorage('addedImages', addedImages);

    console.log('syncAllImageStores()_galleryImages.length: ', galleryImages.length);
    console.log('syncAllImageStores()_addedImages.length: ', addedImages.length);
    console.log('syncAllImageStores()_galleryImages: ', galleryImages);

    return galleryImages;
  }

  syncImageStores() {
    console.log('syncImageStores().');

    const addedImages = this.getImages('addedImages');
    const galleryImages = this.getImages('galleryImages');

    const addedImageSrc: string[] = addedImages.map((img: ImageTypeSrc) => img.src);

    const updatedGalleryImages = galleryImages.filter((img: ImageTypeSrc) => {
      return !img.src.startsWith('data') || addedImageSrc.includes(img.src); // Keeps all images that are not Base64 encoded or that are still in the addedImages array. So this deletes all Base64 encoded images that are not in the addedImages array.
    });

    this.saveToLocalStorage('galleryImages', updatedGalleryImages);
    console.log('syncImageStores()_updatedGalleryImages: ', updatedGalleryImages);
    return updatedGalleryImages;
  }

  removeImages(key: 'galleryImages' | 'addedImages', srcsToRemove: string[]) {
    const currentImages = this.getImages(key);
    const updatedImages = currentImages.filter((img: ImageTypeSrc) => !srcsToRemove.includes(img.src));
    this.saveToLocalStorage(key, updatedImages);
    console.log('removeImages()_updatedImages: ', updatedImages);

    return updatedImages;
  }

  async savingSizeCheck(key: string, images: string[], imagesSrc: ImageType[]) {
    const jsonString = JSON.stringify(imagesSrc);
    const sizeInKB = (new Blob([jsonString]).size / 1024).toFixed(2);
    console.log(`savingSizeCheck()_deletedSrcArr size: ${sizeInKB} KB`);

    try {
      localStorage.setItem(key, jsonString);
      console.log('savingSizeCheck()_Saved successfully.');
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        console.warn('savingSizeCheck()_Storage quota exceeded, saving minimal data.');

        const minimalData = images.map(image => ({
          type: image.startsWith('data:') ? 'BASE64' : 'URL',
          name: this.fileNameService.normaliseFileName(image).substring(0, 30),
          timestamp: Date.now(),
        }));

        localStorage.setItem(key, JSON.stringify(minimalData));
      } else {
        console.error('savingSizeCheck()_Error saving :', key, error);
      }
    }
  }

  checkCachedImages(
    cachedImagesJson: string | null,
    addedImages: ImageType[],
    storageImages: ImageType[],
    allImages: ImageType[]
  ) {
    console.log('checkCachedImages().');

    allImages = [...storageImages];

    if (addedImages && addedImages.length > 0) {
      allImages = [...allImages, ...addedImages];
    }

    if (allImages.length === 0 && cachedImagesJson) {
      try {
        const parsedCachedImages = JSON.parse(cachedImagesJson);
        console.log('checkCachedImages()_Using cached images as fallback:', parsedCachedImages.length);
        allImages = parsedCachedImages;
      } catch (error) {
        console.error('checkCachedImages()_Error parsing cachedImagesJson:', error);
      }
    }

    const uniqueImages = this.arrayUtilsService.removeDuplicatesByName(allImages);
    console.log('checkCachedImages()_All unique images:', uniqueImages.length);
    return uniqueImages;
  }
}
