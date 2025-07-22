import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GalleryService } from '../gallery/gallery.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-device-settings',
  imports: [RouterModule, CommonModule],
  templateUrl: './device-settings.component.html',
  styleUrl: './device-settings.component.css'
})

export class DeviceSettingsComponent implements OnInit, AfterViewInit {
  private galleryService = inject(GalleryService);
  imagesLength = 0;

  ngOnInit(): void {
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

  getChosenImages() {
    console.log("getChosenImages().");

    const deviceSrcsRaw = localStorage.getItem("chosenImagesSrcs");
    const deviceSrcs = deviceSrcsRaw ? JSON.parse(deviceSrcsRaw) : [];
    const all = this.galleryService.allImages();
    const chosenImages = all.filter(img => deviceSrcs.includes(img.src)); // Only returns the images that are in the deviceSrcs array.

    return chosenImages; // Only returns the images that are in the deviceSrcs array. src is required because index caused the images to be out of order. 
  }

}
