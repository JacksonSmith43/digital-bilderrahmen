import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GalleryService } from './gallery.service';
import { GalleryStorageService } from '../gallery/gallery-storage.service';
import { DragDropUploadService } from '../drag-drop-upload/drag-drop-upload.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})

export class GalleryComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private galleryStorageService = inject(GalleryStorageService);
  dragDropUploadService = inject(DragDropUploadService);


  allImages = this.galleryService.allImages;
  galleryHighlightSrcs = this.galleryService.galleryHighlightSrcs;
  notDeletedImagesArray = this.galleryService.notDeletedImagesArray;
  imagesLength = this.galleryService.imagesLength;
  files = this.dragDropUploadService.files;
  images = this.dragDropUploadService.images;

  action = this.galleryStorageService.action;

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
    this.action = "selectForDevice";

    const selectedSrcs = this.galleryService.galleryHighlightSrcs();
    const existingRaw = localStorage.getItem("chosenImagesSrcs");
    const existingSrcs = existingRaw ? JSON.parse(existingRaw) : [];
    const deletedSrcs = this.galleryService.deletedSrcArr();

    const combinedSrcs = [...new Set([...existingSrcs, ...selectedSrcs])]; // This will remove duplicates from the array.
    const availableImageSrcs = this.galleryService.notDeletedImagesArray().map(img => img.src); // This will return an array of the srcs of the images that are not deleted. 
    const filteredSrcs = combinedSrcs.filter(src => !deletedSrcs.includes(src) && availableImageSrcs.includes(src)); // This will filter out the deleted images and the images that are not available.

    const imageNames = filteredSrcs.map(src =>
      src.substring(src.lastIndexOf('/') + 1) // This will return the name of the image. lastIndexOf('/') + 1 means that the first character after the last / will be returned. 
    );

    localStorage.setItem("chosenImagesSrcs", JSON.stringify(filteredSrcs));
    console.log("onSelectForDevice()_combinedSrcs: ", combinedSrcs);
    console.log("onSelectForDevice()_filteredSrcs: ", filteredSrcs);
    console.log("onSelectForDevice()_typeoffilteredSrcs: ", typeof filteredSrcs);

    this.galleryService.galleryHighlightSrcs.set([]);

    if (filteredSrcs.length > 0) { // Checks if the filteredSrcs array is empty. 
      this.galleryStorageService.convertToBlobs(filteredSrcs[0]) // [filteredSrcs[0]] creates an array with the first element of the filteredSrcs array because this methode requires an array. 
        .then((blobs: Blob[]) => { // The result of the convertToBlobs method is stored in the blobs variable which is an array of Blobs.
          this.galleryStorageService.uploadSingleImage(imageNames[0], blobs[0], this.action);
          console.log("onSelectForDevice()_blobs: ", blobs);
        });
    }
  }


  async onUploadAllImages() {
    console.log("onUploadAllImages().");

    this.action = "uploadAllImages";
    const images = this.galleryService.allImages();
    let imageName: string = "";
    console.log("onUploadAllImages()_images: ", images);

    for (let img of images) {
      let uploadTasks: any[] = await this.galleryStorageService.convertToBlobs([img.src]);
      console.log("onUploadAllImages()_uploadTasks: ", uploadTasks);

      if (img.alt === "") {
        imageName = img.relativePath;

      } else if (img.relativePath === "") {
        imageName = img.alt;

      } else {
        imageName = `image_${Date.now()}_${img}`; // Incase both the alt and relativePath are empty. 
      }

      await this.galleryStorageService.uploadSingleImage(imageName, uploadTasks[0], this.action);
    }
    this.galleryService.galleryHighlightSrcs.set([]); // Incase any images are selected. 
  }

}
