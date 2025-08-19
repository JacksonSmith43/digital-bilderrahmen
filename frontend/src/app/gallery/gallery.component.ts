import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GalleryService } from './gallery.service';
import { GalleryStorageService } from '../gallery/gallery-storage.service';
import { DragDropUploadService } from '../drag-drop-upload/drag-drop-upload.service';
import { AuthService } from '../auth/auth.service';
import { SharedGalleryService } from './shared-gallery.service';
import { ImageType } from './gallery-model';

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
  sharedGalleryService = inject(SharedGalleryService);

  isImageLoaded = signal<boolean>(false);

  galleryHighlightSrcs = this.galleryService.galleryHighlightSrcs;
  action = this.sharedGalleryService.action;
  galleryImages = this.sharedGalleryService.galleryImages;
  galleryImageLength = this.sharedGalleryService.galleryImageLength;
  private cachedImages: any[] | null = null;

  async ngOnInit() {
    console.log("GalleryComponent INIT.");
    await this.loadImages();
  }


  async getGalleryImages(): Promise<ImageType[]> {
    //console.log("getGalleryImages().");

    try {

      if (this.cachedImages) {
        return this.cachedImages;
      }

      const addedImagesSignal = this.sharedGalleryService.getImages("addedImages");
      const addedImages = addedImagesSignal;
      const storageImages = this.sharedGalleryService.galleryImages();
      const cachedImagesJson = localStorage.getItem("galleryImages");

      let allImages: any[] = [];

      this.cachedImages = this.sharedGalleryService.checkCachedImages(cachedImagesJson, addedImages, storageImages, allImages);
      console.log("getGalleryImages()_this.cachedImages: ", this.cachedImages);

      return this.sharedGalleryService.removeDuplicates(this.cachedImages);

    } catch (error) {
      console.error("getGalleryImages()_Error: ", error);
      return [];
    }
  }


  onHighlightImageSelection(src: string) {
    console.log("onHighlightImageSelection().");
    this.sharedGalleryService.getHighlightImageSelection(src);
  }

  async loadImages() {
    console.log("loadImages().");

    try {

      if (!this.action()) {
        this.action.set("uploadAllImages");
      }
      await this.sharedGalleryService.downloadAllImages();
      await this.sharedGalleryService.downloadAndDisplayImages();

      this.cachedImages = null;

      const images = await this.getGalleryImages();
      this.galleryImages.set(images);
      console.log("loadImages()_images: ", images);

      if (images.length === 0) {
        const storageImages = this.galleryImages();
        console.log("loadImages()_direct storage images:", storageImages);

        if (storageImages.length > 0) {
          this.galleryImages.set(storageImages);
          this.galleryImageLength.set(storageImages.length);
        }

      } else {
        this.galleryImages.set(images);
        this.galleryImageLength.set(images.length);
      }

      this.isImageLoaded.set(true);

    } catch (error) {
      console.error("loadImages()_Error: ", error);
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
    await this.sharedGalleryService.syncAllImageStores();

    const remainingImages = await this.getGalleryImages();
    this.sharedGalleryService.galleryImages.set(remainingImages);
    this.sharedGalleryService.galleryImageLength.set(remainingImages.length);

    console.log("onRemoveImage()_remainingImages.length: ", remainingImages.length);
    this.galleryService.galleryHighlightSrcs.set([]);
    return srcsToDelete.length;
  }


  async onSelectForDevice() {
    console.log("onSelectForDevice().");
    this.action.set("selectForDevice");

    const selectedUrl = this.galleryHighlightSrcs();
    localStorage.setItem("chosenImagesSrcs", JSON.stringify(selectedUrl));

    if (selectedUrl.length === 0) {
      console.log("onSelectForDevice()_No image has been selected for upload.");
      return;
    }

    for (let url of selectedUrl) {
      try {

        if (url.startsWith("data:")) {
          const imageName = await this.galleryStorageService.handleBase64Image(url);
          console.log("onSelectForDevice()_Base64 image processed for: ", imageName);
          continue;
        }

        const imageName = this.galleryStorageService.extractFileNameFromUrl(url);
        if (!imageName) {
          console.error("onSelectForDevice()_Could not extract file name from URL.");
          continue;
        }

        const imageExists = await this.galleryStorageService.checkExistenceOfImage(imageName);
        if (imageExists) {
          await this.galleryStorageService.copyImageBetweenFolders("uploadedAllImages", "selectForDevice", imageName);
          console.log(`onSelectForDevice()_${imageName} has been copied.`);

        } else {
          console.log(`onSelectForDevice()${imageName} does not exist in source folder.`);
        }

      } catch (error) {
        console.error("onSelectForDevice()_error: ", error);
      }
    }
    this.galleryService.galleryHighlightSrcs.set([]);
  }

  async onUploadAllImages() {
    console.log("onUploadAllImages().");

    this.action.set("uploadAllImages");
    const images = await this.getGalleryImages();
    console.log("onUploadAllImages()_images: ", images);
    this.cachedImages = null;

    for (let img of images) {
      let uploadTasks: any[] = await this.galleryStorageService.convertToBlobs([img.src]);
      console.log("onUploadAllImages()_uploadTasks: ", uploadTasks);

      const imageName = this.getImageFileName(img.alt, img.relativePath);
      await this.galleryStorageService.uploadSingleImage(imageName, uploadTasks[0]);
    }

    this.galleryService.galleryHighlightSrcs.set([]); // Incase any images are selected. 
  }

  async onDownloadAllImages() {
    console.log("onDownloadAllImages().");

    this.cachedImages = null;

    this.sharedGalleryService.action.set("uploadAllImages");
    console.log("onDownloadAllImages()_this.galleryStorageService.action(): ", this.galleryStorageService.action());

    await this.loadImages();
    console.log("onDownloadAllImages()_this.loadImages(): ", this.loadImages());
  }

  getImageFileName(alt: string, relativePath: string) {
    console.log("getImageFileName().");
    let imageName: string = "";

    if (relativePath && relativePath.trim() !== "") { // If a relative path is provided, use it. 
      const pathParts = relativePath.split("/[\/\\]/"); // This will extract the file name from the path. 
      const fileName = pathParts[pathParts.length - 1];
      imageName = fileName.replace(/[^a-zA-Z0-9_\-\.]/g, "_");

      if (imageName.length < 3) {
        imageName = `image_rel_${Date.now()}_${imageName}`;
      }

    } else if (alt && alt.trim() !== "") {
      imageName = alt.replace(/[^a-zA-Z0-9_\-\.]/g, "_");

      if (imageName.length < 3) {
        imageName = `imgage_alt_${Date.now()}_${imageName}`;
      }

    } else { // If both alt and relativePath are empty, generate a random name. 
      const randomString = Math.random().toString(36).substring(2, 8);

      imageName = `image_random_${Date.now()}_${randomString}`; // Incase both the alt and relativePath are empty. 
    }

    console.log("getImageFileName()_imageName: ", imageName);
    return imageName;
  }

  getCurrentUser() {
    return this.authService.currentUser();
  }


}
