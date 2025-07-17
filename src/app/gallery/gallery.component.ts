import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { GalleryService } from './gallery.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})

export class GalleryComponent implements OnInit {
  private galleryService = inject(GalleryService);

  allImages = this.galleryService.allImages;
  galleryHighlightSrcs = this.galleryService.galleryHighlightSrcs;
  notDeledtedImagesArray = this.galleryService.notDeletedImagesArray;
  imagesLength = this.galleryService.imagesLength;

  ngOnInit() {
    this.galleryService.notDeletedImages();
  }


  onHighlightImageSelection(src: string) {
    this.galleryService.getHighlightImageSelection(src);
  }

  onRemoveImage() {
    console.log("onRemoveImage()_Deleting.");

    const srcsToDelete = this.galleryService.galleryHighlightSrcs();
    this.galleryService.getRemoveImage(srcsToDelete);

    console.log("onRemoveImage()_s", this.galleryService.notDeletedImagesArray());

    this.galleryService.galleryHighlightSrcs.set([]);
    this.galleryService.notDeletedImages();

    console.log("onRemoveImage()_a", this.galleryService.notDeletedImagesArray());
  }

  onSelectForDevice() {
    console.log("onSelectForDevice().");

    const selectedSrcs = this.galleryService.galleryHighlightSrcs();

    localStorage.setItem("chosenImagesSrcs", JSON.stringify(selectedSrcs));
    this.galleryService.galleryHighlightSrcs.set([]);
  }


}
