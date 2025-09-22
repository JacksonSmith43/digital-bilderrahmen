import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';

import { GalleryService } from '../gallery/gallery.service';
import { GalleryStorageService } from '../gallery/gallery-storage.service';
import { SharedGalleryService } from '../gallery/shared-gallery.service';

@Component({
  selector: 'app-device-settings',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './device-settings.component.html',
  styleUrl: './device-settings.component.css'
})

export class DeviceSettingsComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private galleryStorageService = inject(GalleryStorageService);
  private sharedGalleryService = inject(SharedGalleryService);

  deviceImages = this.sharedGalleryService.deviceImages;
  deviceImageLength = this.sharedGalleryService.deviceImageLength;
  galleryHighlightSrcs = this.galleryService.galleryHighlightSrcs;
  galleryImages = this.sharedGalleryService.galleryImages;

  currentImageIndex = 0;
  interval: any;

  intervalForm = new FormGroup({
    intervalTimeInput: new FormControl("", [Validators.required, Validators.min(300), Validators.max(100000)])
  });

  ngOnInit() {
    console.log("DeviceSettingsComponent INIT.");

    const chosenImagesRaw = localStorage.getItem("chosenImagesSrcs");
    const deletedImagesRaw = localStorage.getItem("deletedSrcArr");
    const deletedSrcs = deletedImagesRaw ? JSON.parse(deletedImagesRaw) : [];
    this.loadSelectedImages();

    if (chosenImagesRaw) {
      try {
        const chosenSrcs = JSON.parse(chosenImagesRaw);
        const filtersDeletedSrcs = (chosenSrcs).filter((src: string) => !deletedSrcs.includes(src)); // This filters out the deleted images.
        this.deviceImageLength.set(filtersDeletedSrcs.length);
        localStorage.setItem("chosenImagesSrcs", JSON.stringify(filtersDeletedSrcs));
        this.getChosenImages();

      } catch (e) {
        console.error("DeviceSettingsComponent: An error has occured while trying to get the chosen images.", e);
      }
    }
  }


  async loadSelectedImages() {
    console.log("loadSelectedImages().");

    try {
      const downloadUrls = await this.sharedGalleryService.downloadSelectedImages();

      const images = downloadUrls.map((url, index) => ({
        src: url,
        alt: `Selected Image ${index + 1}`,
        relativePath: url.split('/').pop() || `image_${index + 1}`
      }));

      this.deviceImages.set(images);
      this.deviceImageLength.set(images.length);

    } catch (error) {
      console.error("An error has occured while trying to load the selected images: ", error);
    }
  }

  getChosenImages() {
    console.log("getChosenImages().");
    return this.deviceImages();

  }


  onDownloadSelectedImages() {
    console.log("onDownloadSelectedImages().");
    this.galleryStorageService.action.set("selectForDevice");
    this.loadSelectedImages();
  }


  onSetTime(time: string) {
    console.log("onSetTime().");

    const intervalTime = parseInt(time);
    console.log("onSetTime()_intervalTime: ", intervalTime);

    this.imageInterval(intervalTime);
  }

  imageInterval(time: number) {
    console.log("imageInterval().");
    const chosenImages = this.deviceImages();

    if (chosenImages.length > 1) {
      this.currentImageIndex = 0;

      if (this.interval) {
        clearInterval(this.interval); // Clears the interval, so that it doesn't run multiple times.
      }

      this.interval = setInterval(() => {
        this.currentImageIndex = (this.currentImageIndex + 1) % chosenImages.length;
      }, time);

    } else {
      console.log("No images found or at least only one.");
    }
  }

  stopDiashow() {
    console.log("stopDiashow().");
    clearInterval(this.interval);
  }

  get intervalTimeFormControl() {
    return this.intervalForm.controls.intervalTimeInput;
  }

  get intervalFormErrorMessages() {
    if (this.intervalTimeFormControl.hasError("required")) {
      return "An input is required."

    } else if (this.intervalTimeFormControl.hasError("min")) {
      return "A minimum time of 300ms is required."

    } else if (this.intervalTimeFormControl.hasError("max")) {
      return "A maximum time of 100000ms is allowed."

    } else {
      return "";
    }
  }


  async onRemoveImage() { // TODO: Put this in a service, without causing a circular dependency problem. Seing as it is also used in DeviceSettingsComponent. 
    console.log("onRemoveImage()_DeviceSettingsComponent.");

    const srcsToDelete = this.galleryHighlightSrcs();
    const firebaseImages: string[] = [];
    const isDeviceSettings: boolean = true;

    if (srcsToDelete.length === 0) {
      console.log("onRemoveImage()_No image has been selected for deletion.");
      return;
    }

    for (let image of srcsToDelete) {
      console.log("onRemoveImage()_Processing image:", image);

      if (image.includes("firebasestorage.googleapis.com")) {
        firebaseImages.push(image);
        console.log("onRemoveImage()_Firebase image.");
      }

    }
    console.log("onRemoveImage()_firebaseImages.length: ", firebaseImages.length);

    if (firebaseImages.length > 0) {
      await this.galleryStorageService.deleteImageFromFirebase(firebaseImages, isDeviceSettings);
      console.log(`onRemoveImage()_${firebaseImages.length} firebase images have been removed.`);
    }

    const remainingImages = await this.getChosenImages();
    this.deviceImages.set(remainingImages);
    this.deviceImageLength.set(remainingImages.length);

    console.log("onRemoveImage()_remainingImages.length: ", remainingImages.length);
    clearInterval(this.interval);
    this.galleryService.galleryHighlightSrcs.set([]);
    return srcsToDelete.length;
  }

  onHighlightImageSelection(src: string) {
    console.log("onHighlightImageSelection().");
    this.sharedGalleryService.getHighlightImageSelection(src);
  }
}
