import { Component, inject, OnInit, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';

import { GalleryService } from '../gallery/gallery.service';
import { GalleryStorageService } from '../gallery/gallery-storage.service';
import { SharedGalleryService } from '../gallery/shared-gallery.service';
import { ImageType, ImageTypeSrc } from '../gallery/gallery-model';

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

  chosenImages = computed((): ImageType[] => {
    console.log("chosenImages().");

    this.sharedGalleryService.localStorageTrigger(); // To make this computed signal reactive to localStorage changes. 
    const chosenImagesRaw = localStorage.getItem("chosenImagesSrcs");

    if (chosenImagesRaw && chosenImagesRaw.length > 0) { // Checks that it is not undefined and not an empty string (empty localStorage). 
      const chosenSrcs = chosenImagesRaw ? JSON.parse(chosenImagesRaw) : [];
      const deletedImagesRaw = localStorage.getItem("deletedSrcArr");
      const deletedSrcs = deletedImagesRaw ? JSON.parse(deletedImagesRaw) : [];

      console.log("chosenImages()_chosenSrc: ", chosenSrcs);

      const validImages = (chosenSrcs as ImageType[]).filter((image: ImageType) => {
        const notDeletedSrc = !deletedSrcs.includes(image);
        console.log("chosenImages()_notDeletedSrc: ", notDeletedSrc);
        console.log("chosenImages()_image: ", image);

        return notDeletedSrc; // Returns true if image is not in deletedSrcs. 

      });
      return validImages.map((image: ImageType) => ({ // Only these images that are not deleted are mapped to the new array. 
        src: image.src,
        alt: image.alt.split('/').pop() || 'Unknown',
        relativePath: image.relativePath.split('/').pop() || 'Unknown',
      }));

    } else {
      console.log("chosenImages()_No chosen images found in localStorage.");
      return [];
    }
  });

  intervalForm = new FormGroup({
    intervalTimeInput: new FormControl("", [Validators.required, Validators.min(300), Validators.max(100000)])
  });

  async ngOnInit() {
    console.log("DeviceSettingsComponent INIT.");

    try {
      await this.loadSelectedImages();

    } catch (e) {
      console.error("DeviceSettingsComponent: An error has occured while trying to get the chosen images.", e);
    }
  }


  async loadSelectedImages() {
    console.log("loadSelectedImages().");

    try {
      const chosenImagesData = this.chosenImages();
      console.log("loadSelectedImages()_Current chosenImagesData: ", chosenImagesData);

      const fetchedImages = await this.sharedGalleryService.fetchSelectedImages(); // Only fetches new images when there are new images to load. 
      console.log("loadSelectedImages()_fetchedImages", fetchedImages);

      const updatedChosenImages = this.chosenImages();
      console.log("loadSelectedImages()_Updated chosenImagesData: ", updatedChosenImages);

      if (updatedChosenImages.length > 0) {
        this.deviceImages.set(updatedChosenImages);
        this.deviceImageLength.set(updatedChosenImages.length);
        console.log("loadSelectedImages()_Successfully loaded: ", updatedChosenImages);

      } else {
        console.log("loadSelectedImages()_No images found after fetching.");
        this.deviceImages.set([]);
        this.deviceImageLength.set(0);
      }

    } catch (error) {
      console.error("loadSelectedImages()_An error has occured while trying to load the selected images: ", error);
      const fallbackImages = this.chosenImages();
      this.deviceImages.set(fallbackImages);
      this.deviceImageLength.set(fallbackImages.length);
    }
  }


  onFetchSelectedImages() {
    console.log("onFetchSelectedImages().");
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


  async onRemoveImage() {
    console.log("onRemoveImage()_DeviceSettingsComponent.");

    const srcsToDelete = this.galleryHighlightSrcs();
    const localImages: string[] = [];
    const isDeviceSettings: boolean = true;

    if (srcsToDelete.length === 0) {
      console.log("onRemoveImage()_No image has been selected for deletion.");
      return;
    }

    for (let image of srcsToDelete) {
      console.log("onRemoveImage()_Processing image:", image);

      if (image.includes("firebasestorage.googleapis.com")) {
        localImages.push(image);
        console.log("onRemoveImage()_Firebase looking image.");
      }

    }
    console.log("onRemoveImage()_localImages.length: ", localImages.length);

    let remainingImages: ImageType[] | undefined = [];

    if (localImages.length > 0) {
      console.log(`onRemoveImage()_${localImages.length} images have been removed.`);
      remainingImages = await this.removeDeviceImages('chosenImagesSrcs', localImages);
      console.log("onRemoveImage()_remainingImages after deletion: ", remainingImages);

      this.sharedGalleryService.localStorageTrigger.set(this.sharedGalleryService.localStorageTrigger() + 1); // Makes chosenImages re-evaluate. 
      const updatedChosenImages = this.chosenImages();
      console.log("onRemoveImage()_updatedChosenImages after trigger: ", updatedChosenImages);
      this.deviceImages.set(updatedChosenImages);
    }

    if (Array.isArray(remainingImages)) {
      this.deviceImages.set(remainingImages);
      this.deviceImageLength.set(remainingImages.length);
      console.log("onRemoveImage()_remainingImages.length: ", remainingImages.length);

    } else {
      console.warn("onRemoveImage()_remainingImages is not an array, setting empty array.");
      this.deviceImages.set([]);
      this.deviceImageLength.set(0);
    }

    clearInterval(this.interval);
    this.galleryService.galleryHighlightSrcs.set([]);
    return srcsToDelete.length;
  }

  async removeDeviceImages(key: 'chosenImagesSrcs', srcsToRemove: string[]) {
    console.log("removeDeviceImages().");

    const currentImages = this.deviceImages();
    const updatedImages = currentImages.filter((img: ImageTypeSrc) => !srcsToRemove.includes(img.src));
    this.sharedGalleryService.saveToLocalStorage(key, updatedImages);
    console.log("removeDeviceImages()_updatedImages: ", updatedImages);
    return updatedImages;
  }

  onHighlightImageSelection(src: string) {
    console.log("onHighlightImageSelection().");
    this.sharedGalleryService.getHighlightImageSelection(src);
  }
}
