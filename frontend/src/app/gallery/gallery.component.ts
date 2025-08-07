import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GalleryService } from './gallery.service';
import { GalleryStorageService } from '../gallery/gallery-storage.service';
import { DragDropUploadService } from '../drag-drop-upload/drag-drop-upload.service';
import { AuthService } from '../auth/auth.service';

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
  authService = inject(AuthService);

  allImages = this.galleryService.allImages;
  galleryHighlightSrcs = this.galleryService.galleryHighlightSrcs;
  action = this.galleryStorageService.action;

  ngOnInit() {
    //  this.galleryService.notDeletedImages();
    // this.galleryStorageService.downloadAndDisplayImages(); // In order to have the images load after every reload. 
  }

  getGalleryImages() {
    console.log("getGalleryImages().");
    return this.galleryStorageService.galleryImages();
  }

  getGalleryImagesLength() {
    console.log("getGalleryImagesLength():");
    return this.galleryStorageService.galleryImages().length;
  }

  getCurrentUser() {
    return this.authService.currentUser();
  }

  onHighlightImageSelection(src: string) {
    console.log("onHighlightImageSelection().");
    this.galleryService.getHighlightImageSelection(src);
  }

  onRemoveImage() {
    console.log("onRemoveImage().");

    const srcsToDelete = this.galleryService.galleryHighlightSrcs();
    this.galleryStorageService.deleteImageFromFirebase(srcsToDelete);
  }

  async onSelectForDevice() {
    console.log("onSelectForDevice().");

    this.action = "selectForDevice";
    const selectedUrl = this.galleryHighlightSrcs();

    if (selectedUrl.length === 0) {
      console.log("onSelectForDevice()_No image has been selected for upload.");
      return;
    }

    for (let url of selectedUrl) {
      try {

        const imageName = this.galleryStorageService.extractFileNameFromUrl(url) || "";
        console.log("onSelectForDevice()_imageName: ", imageName);

        if (!imageName) { // Incase the image name is null then it will be skipped. 
          continue;
        }

        await this.galleryStorageService.copyImageBetweenFolders("uploadedAllImages", "selectForDevice", imageName);

      } catch (error) {
        console.error("onSelectForDevice()_error: ", error);
      }
    }
    this.galleryService.galleryHighlightSrcs.set([]);
  }


  async onUploadAllImages() {
    console.log("onUploadAllImages().");

    this.action = "uploadAllImages";
    const images = this.galleryService.allImages();
    console.log("onUploadAllImages()_images: ", images);

    for (let img of images) {
      let uploadTasks: any[] = await this.galleryStorageService.convertToBlobs([img.src]);
      console.log("onUploadAllImages()_uploadTasks: ", uploadTasks);

      const imageName = this.getImageFileName(img.alt, img.relativePath, images.indexOf(img));
      await this.galleryStorageService.uploadSingleImage(imageName, uploadTasks[0], this.action);
    }
    this.galleryService.galleryHighlightSrcs.set([]); // Incase any images are selected. 
  }

  getImageFileName(alt: string, relativePath: string, i: number) {
    console.log("getImageFileName().");
    let imageName: string = "";

    if (alt === "") {
      imageName = relativePath;

    } else if (relativePath === "") {
      imageName = alt;

    } else {
      imageName = `image_${Date.now()}_${i}`; // Incase both the alt and relativePath are empty. 
    }
    console.log("getImageFileName()_imageName: ", imageName);
    return imageName;
  }

  async onDownloadAllImages() {
    console.log("onDownloadAllImages().");
    this.galleryStorageService.action = "uploadAllImages";
    await this.galleryStorageService.downloadAllImages();
    await this.galleryStorageService.downloadAndDisplayImages();
  }


}
