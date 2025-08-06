import { AfterViewInit, Component, inject, signal, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';

import { GalleryService } from '../gallery/gallery.service';
import { GalleryStorageService } from '../gallery/gallery-storage.service';

@Component({
  selector: 'app-device-settings',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './device-settings.component.html',
  styleUrl: './device-settings.component.css'
})

export class DeviceSettingsComponent implements OnInit, AfterViewInit {
  private galleryService = inject(GalleryService);
  private galleryStorageService = inject(GalleryStorageService);

  selectedImages = signal<any[]>([]);

  imagesLength = 0;
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

    if (chosenImagesRaw) {
      try {
        const chosenSrcs = JSON.parse(chosenImagesRaw);
        const filtersDeletedSrcs = (chosenSrcs).filter((src: string) => !deletedSrcs.includes(src)); // This filters out the deleted images.
        this.imagesLength = filtersDeletedSrcs.length;
        localStorage.setItem("chosenImagesSrcs", JSON.stringify(filtersDeletedSrcs));

      } catch (e) {
        console.error("DeviceSettingsComponent: An error has occured while trying to get the chosen images.", e);
      }
    }
  }

  ngAfterViewInit(): void {
    this.galleryService.galleryHighlightSrcs.set([]);
  }

  async loadSelectedImages() {
    console.log("loadSelectedImages().");

    try {
      const downloadUrls = await this.galleryStorageService.downloadSelectedImages();

      const images = downloadUrls.map((url, index) => ({
        src: url,
        alt: `Selected Image ${index + 1}`,
        relativePath: url.split('/').pop() || `image_${index + 1}`
      }));

      this.selectedImages.set(images);
      this.imagesLength = images.length;

    } catch (error) {
      console.error("An error has occured while trying to load the selected images: ", error);
    }
  }

  getChosenImages() {
    console.log("getChosenImages().");
    return this.selectedImages();
  }


  onDownloadSelectedImages() {
    console.log("onDownloadSelectedImages().");
    this.galleryStorageService.action = "selectForDevice";
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
    const chosenImages = this.selectedImages();

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

}
