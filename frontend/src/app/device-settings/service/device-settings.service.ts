import { inject, Injectable, signal } from '@angular/core';

import { GalleryService } from '../../gallery/services/gallery.service';
import { ImageType } from '../../shared/model/image-type.model';

@Injectable({ providedIn: 'root' })
export class DeviceSettingsService {
  galleryService = inject(GalleryService);

  deviceImages = signal<ImageType[]>([]);
  selectedSrcs = this.galleryService.selectedSrcs;

  //       async selectForDeviceLogic(selectedSrcs: string[]): Promise<{ deviceImages: ImageType[] }> {
  //     console.log('selectForDeviceLogic().');
  //     const chosenImages: ImageType[] = this.localStorageRelatedService.getImages('chosenImagesSrcs');
  //     console.log('selectForDeviceLogic()_chosenImages', chosenImages);

  //     if (selectedSrcs.length === 0) {
  //       console.log('selectForDeviceLogic()_No image has been selected for upload.');
  //       return { deviceImages: [] };
  //     }

  //     let processedImages: ImageType[] = [];
  //     let allChosenImages: ImageType[] = [];
  //     for (let url of selectedSrcs) {
  //       try {
  //         if (url.startsWith('data:')) {
  //           const imageName = await this.mediaConversionService.handleBase64Image(url);
  //           console.log('selectForDeviceLogic()_Base64 image processed for: ', imageName);

  //           processedImages.push({
  //             src: url,
  //             alt: imageName || undefined,
  //             relativePath: imageName || undefined,
  //           });
  //           continue;
  //         }

  //         const imageName = this.fileNameService.normaliseFileName(url);
  //         if (!imageName) {
  //           console.error('selectForDeviceLogic()_Could not extract file name from URL.');
  //           continue;
  //         }

  //         const imageExists = await this.galleryStorageService.checkExistenceOfImage(imageName);
  //         if (imageExists) {
  //           await this.galleryStorageService.copyImageBetweenFolders('uploadedAllImages', 'selectForDevice', imageName);
  //           console.log(`selectForDeviceLogic()_${imageName} has been copied.`);

  //           processedImages.push({
  //             src: url,
  //             alt: imageName,
  //             relativePath: imageName,
  //           });
  //           console.log('selectForDeviceLogic()_processedImages: ', processedImages);
  //           allChosenImages = [...chosenImages, ...processedImages];
  //           console.log('selectForDeviceLogic()_allChosenImages: ', allChosenImages);
  //         } else {
  //           console.log(`selectForDeviceLogic()${imageName} does not exist in source folder.`);
  //         }
  //       } catch (error) {
  //         console.error('selectForDeviceLogic()_Error: ', error);
  //       }
  //     }
  //     this.localStorageRelatedService.saveToLocalStorage('chosenImagesSrcs', allChosenImages);

  //     return { deviceImages: processedImages };
  //   }

  //   async uploadAllDeviceImagesLogic(images: ImageType[]): Promise<number> {
  //     console.log('uploadAllImagesLogic().');

  //     let uploadedCount = 0;
  //     console.log('onUploadAllImages()_images: ', images);

  //     for (let img of images) {
  //       try {
  //         let uploadTasks: any[] = await this.mediaConversionService.convertToBlobs([img.src]);
  //         console.log('onUploadAllImages()_uploadTasks: ', uploadTasks);

  //         const imageName = this.fileNameService.getImageFileName(img.alt, img.relativePath);
  //         await this.galleryStorageService.uploadSingleImage(imageName, uploadTasks[0]);

  //         uploadedCount++;
  //       } catch (error) {
  //         console.error('uploadAllImagesLogic()_Error uploading: ', error);
  //       }
  //     }

  //     return uploadedCount;
  //   }
}
