import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import { selectIsDevice } from '../../device-settings/state/device-settings.selector';
import { DragDropUploadService } from '../../drag-drop-upload/drag-drop-upload.service';
import { GalleryStorageService } from '../../gallery/services/gallery-storage.service';
import { GalleryActions } from '../../gallery/state/gallery.actions';
import { ImageType } from '../model/image-type.model';
import { FetchImagesService } from './fetch-images.service';
import { ImageHashService } from './image-hash.service';
import { LocalStorageRelatedService } from './localstorage-related.service';
import { MediaConversionService } from './media-conversion.service';
import { FileNameService } from './file-name.service';

@Injectable({ providedIn: 'root' })
export class ImageProcessingService {
  private galleryStorageService = inject(GalleryStorageService);
  private dragDropUploadService = inject(DragDropUploadService);
  private imageHashService = inject(ImageHashService);
  private store = inject(Store);
  private localStorageRelatedService = inject(LocalStorageRelatedService);
  private fetchImagesService = inject(FetchImagesService);
  private mediaConversionService = inject(MediaConversionService);
  private fileNameService = inject(FileNameService);

  isDevice = toSignal(this.store.select(selectIsDevice));

  async loadImages(): Promise<ImageType[]> {
    console.log('loadImages().');

    try {
      await this.fetchImagesService.fetchAndDisplayImages();

      const addedImages = this.localStorageRelatedService.getImages('addedImages');
      const cachedImagesJson = localStorage.getItem('galleryImages');
      let allImages: any[] = [];

      const rawCachedImages = this.localStorageRelatedService.checkCachedImages(
        cachedImagesJson,
        addedImages,
        [],
        allImages
      );

      const uniqueImages = await this.removeDuplicatesThroughHash(rawCachedImages);
      const finalImages = uniqueImages.map(img => this.fileNameService.generateBase64ImageName(img, img.relativePath));
      console.log('loadImages()_finalImages: ', finalImages);

      this.localStorageRelatedService.saveToLocalStorage('galleryImages', finalImages);
      this.store.dispatch(GalleryActions.updateGalleryImages({ images: finalImages }));
      return finalImages;
    } catch (error) {
      console.error('loadImages()_Error: ', error);
      throw error;
    }
  }

  async deleteImages(
    srcsToDelete: string[],
    galleryImages: ImageType[],
    deviceImages: ImageType[]
  ): Promise<{
    deletedSrcs: string[];
    remainingImages: ImageType[];
    updatedDeviceImages: ImageType[];
  }> {
    if (srcsToDelete.length === 0) {
      console.log('deleteImages()_No images selected for deletion.');
      return {
        deletedSrcs: [],
        remainingImages: galleryImages,
        updatedDeviceImages: deviceImages,
      };
    }

    const { localImages, firebaseImages } = await this.categoriseImagesToDelete(srcsToDelete, galleryImages);

    await this.performImageDeletions(localImages, firebaseImages);

    const remainingImages = await this.calculateRemainingImages(galleryImages, srcsToDelete);
    const updatedDeviceImages = await this.updateDeviceImages(deviceImages, remainingImages);

    return {
      deletedSrcs: srcsToDelete,
      remainingImages,
      updatedDeviceImages,
    };
  }

  async categoriseImagesToDelete(
    srcsToDelete: string[],
    galleryImages: ImageType[]
  ): Promise<{
    localImages: { src: string; name: string; imageObj?: ImageType }[];
    firebaseImages: { src: string; name: string; imageObj?: ImageType }[];
  }> {
    console.log('categoriseImagesToDelete().');

    const localImages: { src: string; name: string; imageObj?: ImageType }[] = [];
    const firebaseImages: {
      src: string;
      name: string;
      imageObj?: ImageType;
    }[] = [];

    for (let imageSrc of srcsToDelete) {
      try {
        const imageObj = galleryImages.find(img => img.src === imageSrc);
        const imageName = this.fileNameService.extractImageName(imageSrc, imageObj);

        const status = await this.galleryStorageService.checkExistenceOfImage(imageName);
        console.log(`categoriseImagesToDelete()_Image: ${imageName}, Status: ${status}`);

        switch (status) {
          case 'FIREBASE':
            firebaseImages.push({ src: imageSrc, name: imageName, imageObj });
            break;

          case 'LOCAL':
            localImages.push({ src: imageSrc, name: imageName, imageObj });
            break;

          case 'BOTH':
            firebaseImages.push({ src: imageSrc, name: imageName, imageObj });
            localImages.push({ src: imageSrc, name: imageName, imageObj });
            break;

          default:
            console.warn('categoriseImagesToDelete()_Unknown status:', status);
        }
      } catch (error) {
        console.error('categoriseImagesToDelete()_Error:', error);
      }
    }

    return { localImages, firebaseImages };
  }

  async performImageDeletions(
    localImages: { src: string; name: string }[],
    firebaseImages: { src: string; name: string }[]
  ): Promise<void> {
    console.log('performImageDeletions().');

    if (localImages.length > 0) {
      const localSrcs = localImages.map(img => img.src);
      this.dragDropUploadService.removeGalleryImages(localSrcs);

      console.log(`performImageDeletions()_${localSrcs.length} local images processed.`);
    }

    if (firebaseImages.length > 0) {
      const firebaseSrcs = firebaseImages.map(img => img.src);
      if (this.isDevice()) {
        await this.galleryStorageService.deleteImageFromFirebase(firebaseSrcs, true);
      } else {
        await this.galleryStorageService.deleteImageFromFirebase(firebaseSrcs, false);
      }
      console.log(`performImageDeletions()_${firebaseSrcs.length} firebase images deleted.`);
    }

    const allDeleted = [...localImages, ...firebaseImages];
    const mappedDeleted = allDeleted.map(img => ({
      src: img.src,
      alt: img.name,
      relativePath: img.name,
    }));

    await this.localStorageRelatedService.savingSizeCheck(
      'deletedSrcArr',
      allDeleted.map(img => img.name),
      mappedDeleted
    );
  }

  async calculateRemainingImages(currentImages: ImageType[], deletedSrcs: string[]): Promise<ImageType[]> {
    console.log('calculateRemainingImages().');

    const remaining = currentImages.filter(img => !deletedSrcs.includes(img.src));

    // Re-sync after deletion.
    await this.localStorageRelatedService.syncAllImageStores();

    return remaining;
  }

  async updateDeviceImages(deviceImages: ImageType[], remainingGalleryImages: ImageType[]): Promise<ImageType[]> {
    console.log('updateDeviceImages().');

    const matchingImages = await this.imageHashService.findMatchingImages(remainingGalleryImages, deviceImages);

    const updatedDeviceImages = deviceImages.filter(img => matchingImages.some(match => match.src === img.src));

    console.log('updateDeviceImages()_matchingImages:', matchingImages.length);
    console.log('updateDeviceImages()_updatedDeviceImages:', updatedDeviceImages.length);

    localStorage.setItem('chosenImagesSrcs', JSON.stringify(matchingImages));

    const deviceImagesToDelete = deviceImages.filter(img => !matchingImages.some(match => match.src === img.src));

    if (deviceImagesToDelete.length > 0) {
      await this.galleryStorageService.deleteImageFromFirebase(
        deviceImagesToDelete.map(img => img.src),
        true
      );
    }

    return updatedDeviceImages;
  }

  async removeDuplicatesThroughHash(images: ImageType[]): Promise<ImageType[]> {
    console.log('removeDuplicatesThroughHash().');

    if (!images || images.length === 0) {
      return [];
    }

    const seenHashes: string[] = [];
    const uniqueImages: ImageType[] = [];
    for (const img of images) {
      try {
        const blob = await this.mediaConversionService.urlToBlob(img.src);
        const hash = await this.imageHashService.getImageHash(blob);
        console.log('removeDuplicatesThroughHash()_hash: ', hash);

        if (!seenHashes.includes(hash)) {
          seenHashes.push(hash);
          uniqueImages.push(img);
          console.log('removeDuplicatesThroughHash()_img: ', img);
          console.log('removeDuplicatesThroughHash()_seenHashes: ', seenHashes);
        } else {
          // If the hash has already been seen, it is a duplicate.
          console.log('removeDuplicatesThroughHash()_Duplicate.');
          console.log('removeDuplicatesThroughHash()_ this.isDevice(): ', this.isDevice());

          if (this.isDevice()) {
            await this.galleryStorageService.deleteImageFromFirebase([img.src], true);
          } else {
            await this.galleryStorageService.deleteImageFromFirebase([img.src], false);
          }
        }
      } catch (error) {
        console.error('removeDuplicatesThroughHash()_error: ', error);
        uniqueImages.push(img);
      }
    }
    console.log('removeDuplicatesThroughHash()_uniqueImages: ', uniqueImages);
    return uniqueImages;
  }
}
