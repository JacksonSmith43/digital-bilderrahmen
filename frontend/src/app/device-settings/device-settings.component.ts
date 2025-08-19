import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';

import { GalleryService } from '../gallery/gallery.service';
import { GalleryStorageService } from '../gallery/gallery-storage.service';
import { SharedGalleryService } from '../gallery/shared-gallery.service';
import { DragDropUploadService } from '../drag-drop-upload/drag-drop-upload.service';

@Component({
  selector: 'app-device-settings',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './device-settings.component.html',
  styleUrl: './device-settings.component.css'
})

export class DeviceSettingsComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private galleryStorageService = inject(GalleryStorageService);
  private dragDropUploadService = inject(DragDropUploadService);
  private sharedGalleryService = inject(SharedGalleryService);

  deviceImages = this.sharedGalleryService.deviceImages;
  deviceImageLength = this.sharedGalleryService.deviceImageLength;
  galleryHighlightSrcs = this.galleryService.galleryHighlightSrcs;

  imagesLength = 0;
  currentImageIndex = 0;
  interval: any;
  private cachedImages: any[] | null = null;

  intervalForm = new FormGroup({
    intervalTimeInput: new FormControl("", [Validators.required, Validators.min(300), Validators.max(100000)])
  });

  ngOnInit() {
    console.log("DeviceSettingsComponent INIT.");

    const chosenImagesRaw = localStorage.getItem("chosenImagesSrcs");
    const deletedImagesRaw = localStorage.getItem("deletedSrcArr");
    const deletedSrcs = deletedImagesRaw ? JSON.parse(deletedImagesRaw) : [];

    if (chosenImagesRaw) {
      try {
        const chosenSrcs = JSON.parse(chosenImagesRaw);
        const filtersDeletedSrcs = (chosenSrcs).filter((src: string) => !deletedSrcs.includes(src)); // This filters out the deleted images.
        this.imagesLength = filtersDeletedSrcs.length;
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
      this.imagesLength = images.length;

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

    if (chosenImages.length > 0) {
      this.currentImageIndex = 0;

      if (this.interval) {
        clearInterval(this.interval); // Clears the interval, so that it doesn't run multiple times.
      }

      this.interval = setInterval(() => {
        this.currentImageIndex = (this.currentImageIndex + 1) % chosenImages.length;
      }, time);

    } else {
      console.log("No images found.");
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
    console.log("onRemoveImage()_GalleryComponent.");

    const srcsToDelete = this.galleryHighlightSrcs();
    const localImages: string[] = [];
    const firebaseImages: string[] = [];

    if (srcsToDelete.length === 0) {
      console.log("onRemoveImage()_No image has been selected for deletion.");
      return;
    }

    for (let image of srcsToDelete) {
      console.log("onRemoveImage()_Processing image:", image);

      if (image.startsWith("data:")) { // Base64-images (locale images). 
        localImages.push(image);
        console.log("onRemoveImage()_Local Base64 image.");

        const imageName = this.galleryStorageService.extractFileNameFromUrl(image);
        if (imageName) {
          try {
            const exists = await this.galleryStorageService.checkExistenceOfImage(imageName);

            if (exists) {
              console.log(`onRemoveImage()_Base64 image exists in Firebase as ${imageName}`);
              firebaseImages.push(`uploadedAllImages/${imageName}`);
            }
          } catch (error) {
            console.error("Error checking image existence:", error);
          }
        }

      } else if (!image.includes("firebasestorage.googleapis.com")) { // Other local images. 
        localImages.push(image);
        console.log("onRemoveImage()_Local image.");

      } else { // Firebase Storage URLs
        firebaseImages.push(image);
        localImages.push(image);
        console.log("onRemoveImage()_locaImages:", localImages);
        console.log("onRemoveImage()_Firebase image.");
      }
    }
    console.log("onRemoveImage()_localImages.length: ", localImages.length);
    console.log("onRemoveImage()_firebaseImages.length: ", firebaseImages.length);

    if (localImages.length > 0) {  // Removes local images. 
      this.dragDropUploadService.removeGalleryImages(localImages);
      console.log(`onRemoveImage()_${localImages.length} local images have been removed.`);
    }

    if (firebaseImages.length > 0) {
      await this.galleryStorageService.deleteImageFromFirebase(firebaseImages);
      console.log(`onRemoveImage()_${firebaseImages.length} firebase images have been removed.`);
    }

    this.cachedImages = null;
    localStorage.removeItem("galleryImages");

    const remainingImages = await this.getChosenImages();
    this.deviceImages.set(remainingImages);
    this.deviceImageLength.set(remainingImages.length);

    localStorage.setItem("galleryImages", JSON.stringify(remainingImages));

    console.log("onRemoveImage()_remainingImages.length: ", remainingImages.length);
    this.galleryService.galleryHighlightSrcs.set([]);
    return srcsToDelete.length;
  }

  onHighlightImageSelection(src: string) {
    console.log("onHighlightImageSelection().");
    this.sharedGalleryService.getHighlightImageSelection(src);
  }
}
