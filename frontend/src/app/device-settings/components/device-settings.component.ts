import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ImageType } from '../../shared/model/image-type.model';
import { LocalStorageRelatedService } from '../../shared/services/localstorage-related.service';
import { FileNameService } from '../../shared/services/file-name.service';
import { DeviceSettingsService } from '../service/device-settings.service';

@Component({
  selector: 'app-device-settings',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './device-settings.component.html',
  styleUrl: './device-settings.component.css',
})
export class DeviceSettingsComponent implements OnInit {
  private localStorageRelatedService = inject(LocalStorageRelatedService);
  private fileNameService = inject(FileNameService);
  deviceSettingsService = inject(DeviceSettingsService);
  // storageUpdateTrigger = signal(0); // So that localStorage updates are detected.

  deviceImages = this.deviceSettingsService.deviceImages;
  deviceImagesLength = computed(() => this.deviceImages().length);
  selectedSrcs = this.deviceSettingsService.selectedSrcs;

  currentImageIndex = 0;
  interval: any;

  chosenImages = computed(() /*: ImageType[]*/ => {
    console.log('chosenImages().');

    const chosenSrcs = this.localStorageRelatedService.getImages('chosenImagesSrcs');

    // if (chosenSrcs && chosenSrcs.length > 0) {
    //   // Checks that it is not undefined and not an empty string (empty localStorage).
    //   const deletedImagesRaw = localStorage.getItem('deletedSrcArr');
    //   const deletedSrcs = deletedImagesRaw ? JSON.parse(deletedImagesRaw) : [];

    //   console.log('chosenImages()_chosenSrc: ', chosenSrcs);

    //   const validImages = (chosenSrcs as ImageType[]).filter((image: ImageType) => {
    //     const notDeletedSrc = !deletedSrcs.includes(image);
    //     console.log('chosenImages()_notDeletedSrc: ', notDeletedSrc);
    //     console.log('chosenImages()_image: ', image);

    //     return notDeletedSrc; // Returns true if image is not in deletedSrcs.
    //   });
    //   return validImages.map((image: ImageType) => ({
    //     // Only these images that are not deleted are mapped to the new array.
    //     id: 0,
    //     src: image.src,
    //     fileName: this.fileNameService.normaliseFileName(image.fileName ?? ''),
    //     filePath: ,
    //     uploadDate

    //   }));
    // } else {
    //   console.log('chosenImages()_No chosen images found in localStorage.');
    //   return [];
    // }
  });

  intervalForm = new FormGroup({
    intervalTimeInput: new FormControl('', [Validators.required, Validators.min(300), Validators.max(100000)]),
  });

  async ngOnInit() {
    console.log('DeviceSettingsComponent INIT.');

    try {
    } catch (e) {
      console.error('DeviceSettingsComponent: An error has occured while trying to get the chosen images.', e);
    }
  }

  onHighlightImageSelection(src: string) {
    console.log('onHighlightImageSelection().');
  }

  onFetchSelectedImages() {
    console.log('onFetchSelectedImages().');
  }

  async onRemoveImage() {
    console.log('onRemoveImage()_DeviceSettingsComponent.');

    clearInterval(this.interval);

    // this.store.dispatch(DeviceSettingsActions.deleteDeviceImages());
  }

  onSetTime(time: string) {
    console.log('onSetTime().');

    const intervalTime = parseInt(time);
    console.log('onSetTime()_intervalTime: ', intervalTime);

    this.imageInterval(intervalTime);
  }

  async selectImagesForDevice(selectedSrcs: string[]) {
    console.log('selectImagesForDevice().');
    console.log('selectImagesForDevice()_Selected sources:', selectedSrcs.length);
  }

  imageInterval(time: number) {
    console.log('imageInterval().');
    // const chosenImagesData = this.chosenImages();

    // if (chosenImagesData.length > 1) {
    //   this.currentImageIndex = 0;

    //   if (this.interval) {
    //     clearInterval(this.interval); // Clears the interval, so that it doesn't run multiple times.
    //   }

    //   this.interval = setInterval(() => {
    //     this.currentImageIndex = (this.currentImageIndex + 1) % chosenImagesData.length;
    //   }, time);
    // } else {
    //   console.log('No images found or at least only one.');
    // }
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
