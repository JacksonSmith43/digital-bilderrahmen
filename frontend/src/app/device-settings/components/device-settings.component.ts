import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ImageType } from '../../shared/model/image-type.model';
import { GalleryService } from '../../gallery/services/gallery.service';
import { LocalStorageRelatedService } from '../../shared/services/localstorage-related.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-device-settings',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './device-settings.component.html',
  styleUrl: './device-settings.component.css',
})
export class DeviceSettingsComponent implements OnInit {
  galleryService = inject(GalleryService);
  localStorageService = inject(LocalStorageRelatedService);
  authService = inject(AuthService);

  deviceImages = signal<ImageType[]>([]);

  galleryImages = this.galleryService.galleryImages;

  images = computed(() => this.deviceImages());
  deviceImagesLength = computed(() => this.deviceImages().length);

  currentImageIndex = 0;
  interval: any;

  intervalForm = new FormGroup({
    intervalTimeInput: new FormControl('', [Validators.required, Validators.min(300), Validators.max(100000)]),
  });

  async ngOnInit() {
    console.log('DeviceSettingsComponent INIT.');

    try {
      this.onFetchImages();
    } catch (e) {
      console.error('DeviceSettingsComponent: An error has occured while trying to get the images.', e);
    }
  }

  onFetchImages() {
    console.log('onFetchImages().');

    let galleryImagesStorage = this.localStorageService.getImages('galleryImages');

    let deviceImages = galleryImagesStorage.filter((image: ImageType) => image.isSelectedForDevice);
    this.deviceImages.set(deviceImages);

    this.localStorageService.saveToLocalStorage('deviceImages', deviceImages);

    console.log('onFetchImages()_this.deviceImages()', this.deviceImages());

    return deviceImages;
  }

  onSetTime(time: string) {
    console.log('onSetTime().');

    const intervalTime = parseInt(time);
    console.log('onSetTime()_intervalTime: ', intervalTime);

    this.imageInterval(intervalTime);
  }

  imageInterval(time: number) {
    console.log('imageInterval().');

    if (this.deviceImagesLength() > 1) {
      this.currentImageIndex = 0;

      if (this.interval) {
        clearInterval(this.interval); // Clears the interval, so that it doesn't run multiple times.
      }

      this.interval = setInterval(() => {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.deviceImagesLength();
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
