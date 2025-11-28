import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { firstValueFrom } from 'rxjs';

import { ImageType } from '../model/image-type.model';
import { FileNameService } from './file-name.service';

@Injectable({ providedIn: 'root' })
export class LocalStorageRelatedService {
  private store = inject(Store);
  private fileNameService = inject(FileNameService);

  // galleryImages$ = this.store.select(selectUpdateGalleryImages);
  // addedImages$ = this.store.select(selectAddImages);

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
    // this.store.dispatch(SharedActions.clearSelection());
  }

  // async syncAllImageStores(): Promise<ImageType[]> {
  //   console.log('syncAllImageStores().');

  //   localStorage.removeItem('galleryImages');
  //   localStorage.removeItem('addedImages');

  //   const galleryImages = await firstValueFrom(this.galleryImages$);
  //   const addedImages = await firstValueFrom(this.addedImages$);

  //   this.saveToLocalStorage('galleryImages', galleryImages);
  //   this.saveToLocalStorage('addedImages', addedImages);

  //   console.log('syncAllImageStores()_galleryImages.length: ', galleryImages.length);
  //   console.log('syncAllImageStores()_addedImages.length: ', addedImages.length);
  //   console.log('syncAllImageStores()_galleryImages: ', galleryImages);

  //   return galleryImages;
  // }


 

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

}
