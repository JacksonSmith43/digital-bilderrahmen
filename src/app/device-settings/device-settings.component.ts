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
  selectedImagesIndicesCopy = this.galleryService.getSelectForDevice();


  ngOnInit(): void {
    console.log("DeviceSettingsComponent INIT.");
    const savedImagesIndices = localStorage.getItem("chosenImagesIndices");

    if (savedImagesIndices) {
      this.galleryService.galleryHighlightIndices.set(JSON.parse(savedImagesIndices));
    }
  }

  ngAfterViewInit(): void {
    this.galleryService.galleryHighlightIndices.set([]);
  }

  getChosenImages() {
    console.log("getChosenImages().");

    const all = this.galleryService.allImages();
    const deviceSrcsRaw = localStorage.getItem("chosenImagesSrcs");
    const deviceSrcs = deviceSrcsRaw ? JSON.parse(deviceSrcsRaw) : [];

    return all.filter(img => deviceSrcs.includes(img.src)); // Only returns the images that are in the deviceSrcs array. src is required because index caused the images to be out of order. 

  }

}
