import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';

import { GalleryStorageService } from '../../gallery/services/gallery-storage.service';
import { GalleryService } from '../../gallery/services/gallery.service';
import { ImageType } from '../../shared/model/image-type.model';
import { FetchImagesService } from '../../shared/services/fetch-images.service';
import { LocalStorageRelatedService } from '../../shared/services/localstorage-related.service';
import { MediaConversionService } from '../../shared/services/media-conversion.service';
import { SharedActions } from '../../shared/state/shared.actions';
import { DeviceSettingsActions } from '../state/device-settings.action';
import { selectUpdateDeviceImages } from '../state/device-settings.selector';
import { FileNameService } from '../../shared/services/file-name.service';

@Component({
  selector: 'app-device-settings',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './device-settings.component.html',
  styleUrl: './device-settings.component.css',
})
export class DeviceSettingsComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private store = inject(Store);
  private galleryStorageService = inject(GalleryStorageService);
  private localStorageRelatedService = inject(LocalStorageRelatedService);
  private fetchImagesService = inject(FetchImagesService);
  private mediaConversionService = inject(MediaConversionService);
  private fileNameService = inject(FileNameService);

  storageUpdateTrigger = signal(0); // So that localStorage updates are detected.

  deviceImages = toSignal(this.store.select(selectUpdateDeviceImages), { initialValue: [] });
  selectedSrcs = toSignal(this.galleryService.galleryHighlightSrcs);

  deviceImagesLength = computed(() => this.deviceImages()?.length);

  currentImageIndex = 0;
  interval: any;

  chosenImages = computed((): ImageType[] => {
    console.log('chosenImages().');

    this.storageUpdateTrigger();
    const chosenSrcs = this.localStorageRelatedService.getImages('chosenImagesSrcs');

    if (chosenSrcs && chosenSrcs.length > 0) {
      // Checks that it is not undefined and not an empty string (empty localStorage).
      const deletedImagesRaw = localStorage.getItem('deletedSrcArr');
      const deletedSrcs = deletedImagesRaw ? JSON.parse(deletedImagesRaw) : [];

      console.log('chosenImages()_chosenSrc: ', chosenSrcs);

      const validImages = (chosenSrcs as ImageType[]).filter((image: ImageType) => {
        const notDeletedSrc = !deletedSrcs.includes(image);
        console.log('chosenImages()_notDeletedSrc: ', notDeletedSrc);
        console.log('chosenImages()_image: ', image);

        return notDeletedSrc; // Returns true if image is not in deletedSrcs.
      });
      return validImages.map((image: ImageType) => ({
        // Only these images that are not deleted are mapped to the new array.
        src: image.src,
        alt: this.fileNameService.normaliseFileName(image.alt ?? ''),
        relativePath: this.fileNameService.normaliseFileName(image.relativePath ?? ''),
      }));
    } else {
      console.log('chosenImages()_No chosen images found in localStorage.');
      return [];
    }
  });

  intervalForm = new FormGroup({
    intervalTimeInput: new FormControl('', [Validators.required, Validators.min(300), Validators.max(100000)]),
  });

  async ngOnInit() {
    console.log('DeviceSettingsComponent INIT.');

    try {
      await this.loadSelectedImages();
      this.store.dispatch(SharedActions.clearSelection());
    } catch (e) {
      console.error('DeviceSettingsComponent: An error has occured while trying to get the chosen images.', e);
      this.store.dispatch(SharedActions.loadImagesFailure({ error: e instanceof Error ? e.message : 'Unknown error' }));
    }
  }

  onHighlightImageSelection(src: string) {
    console.log('onHighlightImageSelection().');
    this.store.dispatch(SharedActions.toggleImageSelection({ src }));
  }

  async loadSelectedImages() {
    console.log('loadSelectedImages().');

    try {
      const images = await this.fetchImagesService.fetchImagesFromFolder('selectForDevice', 'chosenImagesSrcs');

      if (images.length > 0) {
        this.store.dispatch(DeviceSettingsActions.uploadForDeviceSuccess({ deviceImages: images }));
        console.log('loadSelectedImages()_Success:', images.length);
      } else {
        console.log('loadSelectedImages()_No images found.');
        this.store.dispatch(SharedActions.clearSelection());
      }
    } catch (error) {
      console.error('loadSelectedImages()_An error has occured while trying to load the selected images: ', error);
      this.store.dispatch(DeviceSettingsActions.uploadForDeviceFailure({ error: JSON.stringify(error) }));
    }
  }

  onFetchSelectedImages() {
    console.log('onFetchSelectedImages().');
    this.loadSelectedImages();
  }

  async onRemoveImage() {
    console.log('onRemoveImage()_DeviceSettingsComponent.');

    clearInterval(this.interval);

    this.store.dispatch(DeviceSettingsActions.deleteDeviceImages());
    this.storageUpdateTrigger();
  }

  onSetTime(time: string) {
    console.log('onSetTime().');

    const intervalTime = parseInt(time);
    console.log('onSetTime()_intervalTime: ', intervalTime);

    this.imageInterval(intervalTime);
  }

  async selectImagesForDevice(selectedSrcs: string[]): Promise<ImageType[]> {
    console.log('selectImagesForDevice().');
    console.log('selectImagesForDevice()_Selected sources:', selectedSrcs.length);

    if (selectedSrcs.length === 0) {
      console.log('selectImagesForDevice()_No images selected for device.');
      return [];
    }

    const processedImages: ImageType[] = [];
    const existingChosenImages: ImageType[] = this.localStorageRelatedService.getImages('chosenImagesSrcs');

    for (const src of selectedSrcs) {
      try {
        const processedImage = await this.processImageForDevice(src);

        if (processedImage) {
          processedImages.push(processedImage);
        }
      } catch (error) {
        console.error('selectImagesForDevice()_Error processing:', src, error);
      }
    }

    const allChosenImages = [...existingChosenImages, ...processedImages];

    const uniqueImages = allChosenImages.filter(
      (image, index, array) => array.findIndex(img => img.src === image.src) === index
    );

    console.log('selectImagesForDevice()_Result:', uniqueImages.length, 'unique images');

    this.localStorageRelatedService.saveToLocalStorage('chosenImagesSrcs', uniqueImages);

    return processedImages;
  }

  private async processImageForDevice(src: string): Promise<ImageType | null> {
    console.log('processImageForDevice().');
    console.log('processImageForDevice()_Processing: ', src.substring(0, 50));

    // Base64 image.
    if (src.startsWith('data:')) {
      const imageName = await this.mediaConversionService.handleBase64Image(src);

      if (imageName) {
        console.log('processImageForDevice()_Base64 processed: ', imageName);
        return {
          src,
          alt: imageName,
          relativePath: imageName,
        };
      }
      return null;
    }

    const imageName = this.fileNameService.normaliseFileName(src);
    if (!imageName) {
      console.error('processImageForDevice()_Could not extract filename from: ', src);
      return null;
    }

    const copied = await this.copyImageToDevice(imageName);

    if (copied) {
      console.log('processImageForDevice()_URL processed and copied: ', imageName);
      return {
        src,
        alt: imageName,
        relativePath: imageName,
      };
    }

    return null;
  }

  private async copyImageToDevice(imageName: string): Promise<boolean> {
    console.log('copyImageToDevice().');

    try {
      const exists = await this.galleryStorageService.checkExistenceOfImage(imageName);
      console.log('copyImageToDevice()_exists: ', exists);

      if (exists === 'FIREBASE' || exists === 'BOTH') {
        await this.galleryStorageService.copyImageBetweenFolders('uploadedAllImages', 'selectForDevice', imageName);
        console.log('copyImageToDevice()_Successfully copied:', imageName);
        return true;
      } else {
        console.log('copyImageToDevice()_Image not found in gallery:', imageName);
        return false;
      }
    } catch (error) {
      console.error('copyImageToDevice()_Failed to copy:', imageName, error);
      return false;
    }
  }

  imageInterval(time: number) {
    console.log('imageInterval().');
    const chosenImagesData = this.chosenImages();

    if (chosenImagesData.length > 1) {
      this.currentImageIndex = 0;

      if (this.interval) {
        clearInterval(this.interval); // Clears the interval, so that it doesn't run multiple times.
      }

      this.interval = setInterval(() => {
        this.currentImageIndex = (this.currentImageIndex + 1) % chosenImagesData.length;
      }, time);
    } else {
      console.log('No images found or at least only one.');
    }
  }

  stopDiashow() {
    console.log('stopDiashow().');
    clearInterval(this.interval);
  }

  get intervalTimeFormControl() {
    return this.intervalForm.controls.intervalTimeInput;
  }

  get intervalFormErrorMessages() {
    if (this.intervalTimeFormControl.hasError('required')) {
      return 'An input is required.';
    } else if (this.intervalTimeFormControl.hasError('min')) {
      return 'A minimum time of 300ms is required.';
    } else if (this.intervalTimeFormControl.hasError('max')) {
      return 'A maximum time of 100000ms is allowed.';
    } else {
      return '';
    }
  }
}
