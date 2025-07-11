import { Component, computed, inject, signal } from '@angular/core';
import { GalleryService } from './gallery.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})

export class GalleryComponent {
  private galleryService = inject(GalleryService);

  images = this.galleryService.images;
  allImages = this.galleryService.allImages;
  galleryHighlightIndices = this.galleryService.galleryHighlightIndices;

  ngOnDestroy() {
    this.galleryService.setGallerySelectedIndices([]);
  }


  onHighlightImageSelection(index: number) {
    this.galleryService.getHighlightImageSelection(index);
    this.galleryService.setGallerySelectedIndices(this.galleryService.galleryHighlightIndices());
  }

  onRemoveImage() {
    console.log("Deleting.");
    this.galleryService.getRemoveImage();
  }

  onSelectForDevice() {
    console.log("onSelectForDevice().");

    const all = this.galleryService.allImages();
    const selectedSrcs = this.galleryService.galleryHighlightIndices().map(idx => all[idx]?.src).filter(src => !!src); // !!src is a filter function that returns all elements that are truthy. This is used to remove any falsy values from the array so any values that are not src are removed.
    const deviceSrcsRaw = localStorage.getItem("chosenImagesSrcs");
    const deviceSrcs = deviceSrcsRaw ? JSON.parse(deviceSrcsRaw) : [];
    const appendedSrcs = [...deviceSrcs, ...selectedSrcs.filter(src => !deviceSrcs.includes(src))]; // This filters out the srcs that are already in the deviceSrcs array and appends them to the appendedSrcs array. 

    localStorage.setItem("chosenImagesSrcs", JSON.stringify(appendedSrcs));
    this.galleryService.galleryHighlightIndices.set([]);

  }


}
