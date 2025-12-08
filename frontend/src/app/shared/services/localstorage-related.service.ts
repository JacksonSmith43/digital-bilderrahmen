import { inject, Injectable } from '@angular/core';

import { ImageType } from '../model/image-type.model';
import { FileNameService } from './file-name.service';

@Injectable({ providedIn: 'root' })
export class LocalStorageRelatedService {
  private fileNameService = inject(FileNameService);

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
    images: string[] | ImageType[] | ImageType | File
  ) {
    console.log('saveToLocalStorage().');
    localStorage.setItem(key, JSON.stringify(images));
  }

  saveUserToLocalStorage(key: 'userEmail', email: string) {
    console.log('saveUserToLocalStorage().');
    localStorage.setItem(key, JSON.stringify(email));
  }

  getUser(key: 'userEmail') {
    console.log('getUser().');

    const savedUsers = localStorage.getItem(key);
    if (savedUsers) {
      try {
        console.log('getUser()_savedImages: ', savedUsers);
        return JSON.parse(savedUsers);
   
      } catch (error) {
        console.error(`getUser()_Error parsing ${key}:`, error);
      }
    }
    return [];
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
}
