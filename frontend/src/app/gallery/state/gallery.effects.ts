import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, from, map, of, switchMap, tap, withLatestFrom } from 'rxjs';

import { selectUpdateDeviceImages } from '../../device-settings/state/device-settings.selector';
import { ImageType } from '../../shared/model/image-type.model';
import { ImageProcessingService } from '../../shared/services/image-processing.service';
import { MediaConversionService } from '../../shared/services/media-conversion.service';
import { selectSelectedSrcs } from '../../shared/state/shared.selector';
import { GalleryStorageService } from '../services/gallery-storage.service';
import { GalleryActions } from './gallery.actions';
import { selectUpdateGalleryImages } from './gallery.selectors';
import { FileNameService } from '../../shared/services/file-name.service';
import { SharedActions } from '../../shared/state/shared.actions';

@Injectable()
export class GalleryEffects {
  private actions$ = inject(Actions);
  store = inject(Store);

  galleryStorageService = inject(GalleryStorageService);
  imageProcessingService = inject(ImageProcessingService);
  mediaConversionService = inject(MediaConversionService);
  private fileNameService = inject(FileNameService);

  uploadToGallery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GalleryActions.uploadToGallery),
      tap(() => {
        this.store.dispatch(SharedActions.setCurrentAction({ action: 'uploading' }));
      }),
      switchMap(({ selectedSrcs }) => {
        console.log('uploadToGallery$_Processing:', selectedSrcs.length, 'images.');

        return from(this.uploadImagesToFolder(selectedSrcs, 'uploadedAllImages')).pipe(
          map(uploadedImages => {
            this.store.dispatch(SharedActions.setCurrentAction({ action: 'idle' }));
            this.store.dispatch(SharedActions.clearSelection());

            return GalleryActions.uploadToGallerySuccess({ uploadedImages, targetFolder: 'uploadedAllImages' });
          }),
          catchError(error => {
            this.store.dispatch(SharedActions.setCurrentAction({ action: 'idle' }));
            return of(GalleryActions.uploadToGalleryFailure({ error: error.message }));
          })
        );
      })
    )
  );

  uploadToDevice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GalleryActions.uploadToDevice),
      tap(() => {
        this.store.dispatch(SharedActions.setCurrentAction({ action: 'uploading' }));
      }),
      switchMap(({ selectedSrcs }) => {
        console.log('uploadToDevice$_Processing:', selectedSrcs.length, 'images.');

        return from(this.uploadImagesToFolder(selectedSrcs, 'selectForDevice')).pipe(
          map(uploadedImages => {
            this.store.dispatch(SharedActions.setCurrentAction({ action: 'idle' }));
            this.store.dispatch(SharedActions.clearSelection());

            return GalleryActions.uploadToDeviceSuccess({ uploadedImages, targetFolder: 'selectForDevice' });
          }),
          catchError(error => {
            this.store.dispatch(SharedActions.setCurrentAction({ action: 'idle' }));
            return of(GalleryActions.uploadToDeviceFailure({ error: error.message }));
          })
        );
      })
    )
  );

  deleteImages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GalleryActions.deleteGalleryImages),
      withLatestFrom(
        this.store.select(selectSelectedSrcs),
        this.store.select(selectUpdateGalleryImages),
        this.store.select(selectUpdateDeviceImages)
      ),
      switchMap(([action, selectedSrcs, galleryImages, deviceImages]) => {
        console.log('Gallery_deleteImages$_Starting deletion process.');
        console.log('Gallery_deleteImages$_Selected sources: ', selectedSrcs.length);
        console.log('Gallery_deleteImages$_Gallery images: ', galleryImages.length);
        console.log('Gallery_deleteImages$_Device images: ', deviceImages.length);

        return from(this.imageProcessingService.deleteImages(selectedSrcs, galleryImages, deviceImages)).pipe(
          map(result => {
            return GalleryActions.deleteGalleryImagesSuccess({
              deletedSrcs: result.deletedSrcs,
              remainingImages: result.remainingImages,
              updatedDeviceImages: result.updatedDeviceImages,
            });
          }),
          catchError(error => {
            console.error('Gallery_deleteImages$_Deletion failed: ', error);
            return of(GalleryActions.deleteGalleryImagesFailure({ error: error.message }));
          })
        );
      })
    )
  );

  async uploadImagesToFolder(
    selectedSrcs: string[],
    targetFolder: 'selectForDevice' | 'uploadedAllImages'
  ): Promise<ImageType[]> {
    console.log('uploadImagesToFolder().');
    console.log(`uploadImagesToFolder()_Target: ${targetFolder}, Count: ${selectedSrcs.length}`);

    const uploadedImages: ImageType[] = [];

    for (const src of selectedSrcs) {
      try {
        const blob = await this.mediaConversionService.convertSrcToBlob(src);
        const fileName = this.fileNameService.normaliseFileName(src);

        // Uploads to the Firebase folder.
        await this.galleryStorageService.uploadImageToFolder(fileName, blob, targetFolder);

        const uploadedImage: ImageType = {
          src: src,
          alt: fileName,
          relativePath: fileName,
        };

        uploadedImages.push(uploadedImage);
        console.log(`uploadImagesToFolder()_Uploaded: ${fileName} to ${targetFolder}`);
      } catch (error) {
        console.error(`uploadImagesToFolder()_Failed to upload ${src}:`, error);
      }
    }

    console.log(
      `uploadImagesToFolder()_Result: ${uploadedImages.length}/${selectedSrcs.length} uploaded to ${targetFolder}`
    );
    return uploadedImages;
  }

  async uploadAllGalleryImagesLogic(images: ImageType[]): Promise<number> {
    console.log('uploadAllImagesLogic().');

    let uploadedCount = 0;
    console.log('onUploadAllImages()_images: ', images);

    for (let img of images) {
      try {
        let uploadTasks: any[] = await this.mediaConversionService.convertToBlobs([img.src]);
        console.log('onUploadAllImages()_uploadTasks: ', uploadTasks);

        const imageName = this.fileNameService.getImageFileName(img.alt, img.relativePath);
        await this.galleryStorageService.uploadSingleImage(imageName, uploadTasks[0]);

        uploadedCount++;
      } catch (error) {
        console.error('uploadAllImagesLogic()_Error uploading: ', error);
      }
    }

    return uploadedCount;
  }
}
