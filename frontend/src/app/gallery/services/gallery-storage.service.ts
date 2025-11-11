import { inject, Injectable } from '@angular/core';
import { UploadTask } from '@angular/fire/storage';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { Store } from '@ngrx/store';

import { ImageType } from '../../shared/model/image-type.model';
import { GalleryActions } from '../state/gallery.actions';
import { selectIsDevice, selectUpdateDeviceImages } from '../../device-settings/state/device-settings.selector';
import { DeviceSettingsActions } from '../../device-settings/state/device-settings.action';
import { selectUpdateGalleryImages } from '../state/gallery.selectors';
import { SharedActions } from '../../shared/state/shared.actions';
import { LocalStorageRelatedService } from '../../shared/services/localstorage-related.service';
import { FirebaseContextService } from './firebase-context.service';
import { FileNameService } from '../../shared/services/file-name.service';

@Injectable({
  providedIn: 'root',
})
export class GalleryStorageService {
  private localStorageRelatedService = inject(LocalStorageRelatedService);
  firebaseContextService = inject(FirebaseContextService);
  private fileNameService = inject(FileNameService);

  store = inject(Store);
  isDevice = toSignal(this.store.select(selectIsDevice));

  async uploadSingleImage(imageName: string, image: Blob): Promise<UploadTask> {
    console.log('uploadSingleImage().');
    console.log('uploadSingleImage()_this.isDevice: ', this.isDevice);

    if (!this.isDevice()) {
      const storageRef = this.firebaseContextService.getReference(`uploadedAllImages/${imageName}`); // This will create a reference to the images folder in the storage bucket.
      return this.firebaseContextService.uploadBytesResumable(storageRef, image); // This will upload the image to the storage bucket.
    } else if (this.isDevice()) {
      const storageRef = this.firebaseContextService.getReference(`selectForDevice/${imageName}`);
      return this.firebaseContextService.uploadBytesResumable(storageRef, image);
    } else {
      throw new Error('Invalid action for uploadSingleImage.');
    }
  }

  async uploadImageToFolder(
    fileName: string,
    blob: Blob,
    targetFolder: 'selectForDevice' | 'uploadedAllImages'
  ): Promise<void> {
    console.log('uploadImageToFolder().');
    console.log(`uploadImageToFolder()_File: ${fileName}, Folder: ${targetFolder}`);

    try {
      const storageRef = this.firebaseContextService.getReference(`${targetFolder}/${fileName}`);

      await this.firebaseContextService.uploadBytes(storageRef, blob);

      console.log(`uploadImageToFolder()_Success: ${fileName} uploaded to ${targetFolder}`);
    } catch (error) {
      console.error(`uploadImageToFolder()_Error uploading ${fileName} to ${targetFolder}:`, error);
      throw error;
    }
  }

  async deleteImageFromFirebase(selectedImages: string[], isDeviceSettings: boolean) {
    console.log('deleteImageFromFirebase().');
    console.log('deleteImageFromFirebase()_selectedImages: ', selectedImages);

    const deletedImages: string[] = [];

    if (selectedImages.length === 0) {
      console.log('deleteImageFromFirebase()_No image has been selected for deletion.');
      return;
    }

    await Promise.all(
      selectedImages.map(async imageUrl => {
        // Promise.all is here to make sure that all the images are deleted before the function returns. The images are deleted one at a time.
        try {
          const fileNameNormalised = this.fileNameService.normaliseFileName(imageUrl);
          console.log('deleteImageFromFirebase()_fileNameNormalised', fileNameNormalised);

          let imageRef: any;
          let selectedImagesString = selectedImages.toString();
          console.log('deleteImageFromFirebase()_selectedImagesString', selectedImagesString);

          if (!fileNameNormalised) {
            console.log('deleteImageFromFirebase()_Could not extract file name from URL: ', imageUrl);
            return;
          }

          if (isDeviceSettings) {
            imageRef = this.firebaseContextService.getReference(`selectForDevice/${fileNameNormalised}`);
            console.log('deleteImageFromFirebase()_fileNameNormalised_1: ', fileNameNormalised);
            await this.firebaseContextService.deleteObject(imageRef);
          } else {
            imageRef = this.firebaseContextService.getReference(`uploadedAllImages/${fileNameNormalised}`);
            console.log('deleteImageFromFirebase()_fileNameNormalised_2: ', fileNameNormalised);
            await this.firebaseContextService.deleteObject(imageRef);
          }

          console.log(`deleteImageFromFirebase() ${fileNameNormalised} has successfully been deleted from Firebase.`);
          deletedImages.push(imageUrl);
        } catch (error) {
          console.error('An error has occured while trying to delete the image from Firebase:', error);
        }
      })
    );

    if (deletedImages.length > 0) {
      let currentImages: ImageType[] = [];
      let updatedImages: ImageType[] = [];

      if (isDeviceSettings) {
        currentImages = await firstValueFrom(this.store.select(selectUpdateDeviceImages));
        updatedImages = currentImages.filter(img => !deletedImages.includes(img.src));
        this.store.dispatch(DeviceSettingsActions.updateDeviceImages({ updatedImages }));
      } else {
        currentImages = await firstValueFrom(this.store.select(selectUpdateGalleryImages));
        updatedImages = currentImages.filter(img => !deletedImages.includes(img.src));
        this.store.dispatch(GalleryActions.updateGalleryImages({ images: updatedImages }));
      }
      console.log('deleteImageFromFirebase()_updatedImages: ', updatedImages);
    }

    this.store.dispatch(SharedActions.clearSelection());
  }

  async checkExistenceOfImage(imageName: string): Promise<boolean | string> {
    console.log('checkExistenceOfImage().');
    console.log('checkExistenceOfImage()_imageName', imageName);

    const addedImages: ImageType[] = this.localStorageRelatedService.getImages('addedImages');
    const addedImagesMap = addedImages.map(img => img.relativePath);

    console.log('checkExistenceOfImage()_addedImages', addedImages);
    console.log('checkExistenceOfImage()_addedImagesMap', addedImagesMap);

    if (!imageName || imageName.length < 2) {
      console.error('checkExistenceOfImage()_Invalid image name:', imageName);
      return false;
    }

    const isAddedLocally = addedImages.some(addedImages => {
      const normalisedAddedImages = this.fileNameService.normaliseFileName(addedImages.relativePath || '');

      return normalisedAddedImages === imageName;
    });

    if (isAddedLocally) {
      console.log('checkExistenceOfImage()_isAddedLocally', isAddedLocally);
      return 'LOCAL';
    }

    try {
      console.log('checkExistenceOfImage()_try-catch start.');

      let sourceRef;
      // Gets the reference for image from the selectForDevice folder.
      if (this.isDevice()) {
        sourceRef = this.firebaseContextService.getReference(`/selectForDevice/${imageName}`);
      } else {
        sourceRef = this.firebaseContextService.getReference(`uploadedAllImages/${imageName}`);
      }

      console.log('checkExistenceOfImage()_try-catch middle_1.');
      // This wil throw an error if the image does not exist.
      const donwloadURL = await this.firebaseContextService.getDownloadURL(sourceRef);
      console.log('checkExistenceOfImage()_donwloadURL', donwloadURL);

      if (isAddedLocally) {
        return 'BOTH';
      } else {
        return 'FIREBASE';
      }
    } catch (error) {
      console.error(`checkExistenceOfImage()_Error checking image: ${imageName}`, error);
      return false;
    }
  }

  async copyImageBetweenFolders(sourceFolder: string, destinationFolder: string, imageName: string): Promise<void> {
    console.log('copyImageBetweenFolders().');
    console.log(`copyImageBetweenFolders()_Copying from "${sourceFolder}" to "${destinationFolder}"`);

    try {
      const sourceRef = this.firebaseContextService.getReference(`${sourceFolder}/${imageName}`);
      const destinationRef = this.firebaseContextService.getReference(`${destinationFolder}/${imageName}`);
      const url = await this.firebaseContextService.getDownloadURL(sourceRef);
      const response = await fetch(url);
      const blob = await response.blob();
      await this.firebaseContextService.uploadBytes(destinationRef, blob);

      console.log(`Successfully copied "${imageName}" from "${sourceFolder}" to "${destinationFolder}"`);
    } catch (error) {
      // If the destination folder does not exist it will be created.
      console.log(
        `copyImageBetweenFolders()_DestinationFolder "${destinationFolder}" does not exist. It will be created.`
      );
      const emptyBlob = new Blob([''], { type: 'text/plain' });
      const placeholderRef = this.firebaseContextService.getReference(`${destinationFolder}/.placeholder`);
      await this.firebaseContextService.uploadBytes(placeholderRef, emptyBlob);
    }
  }
}
