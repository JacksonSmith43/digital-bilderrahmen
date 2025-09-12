import { inject, Injectable, signal } from '@angular/core';

import { ImageType, ImageTypeSrc } from './gallery-model';
import { FirebaseContextService } from './firebase-context.service';

@Injectable({ providedIn: 'root' })
export class SharedGalleryService {

  firebaseContextService = inject(FirebaseContextService);

  images = signal<ImageType[]>([]);
  galleryHighlightSrcs = signal<string[]>([]);
  galleryImages = signal<ImageType[]>([]);
  galleryImageLength = signal<number>(0);
  deviceImages = signal<ImageType[]>([]);
  deviceImageLength = signal<number>(0);
  action = signal<"selectForDevice" | "uploadAllImages" | undefined>(undefined);


  getHighlightImageSelection(src: string) {
    console.log("getHighlightImageSelection().");

    const selectedSrcs = this.galleryHighlightSrcs();

    if (selectedSrcs.includes(src)) { // Checks if the image is already selected.
      this.galleryHighlightSrcs.set(selectedSrcs.filter(i => i !== src)); // Removes the image from the selection if it is already selected. i => i !== index is a filter function that returns all elements that are not equal to the index of the clicked image.

    } else { // Adds the image to the selection if it has not already been selected. 
      this.galleryHighlightSrcs.set([...selectedSrcs, src]);
    }
    console.log("getHighlightImageSelection()_this.galleryHighlightSrcs(): ", this.galleryHighlightSrcs());
  }

  getImages(key: "galleryImages" | "addedImages") {
    console.log("getImages().");

    const savedImages = localStorage.getItem(key);
    if (savedImages) {
      try {
        console.log("getImages()_savedImages: ", savedImages);
        return JSON.parse(savedImages);

      } catch (error) {
        console.error(`getImages()_Error parsing ${key}:`, error);
      }
    }
    return [];
  }

  saveToLocalStorage(key: "galleryImages" | "addedImages", images: any[]) {
    console.log("saveToLocalStorage().");
    localStorage.setItem(key, JSON.stringify(images));
  }


  removeImages(key: 'galleryImages' | 'addedImages', srcsToRemove: string[]) {
    const currentImages = this.getImages(key);
    const updatedImages = currentImages.filter((img: ImageTypeSrc) => !srcsToRemove.includes(img.src));
    this.saveToLocalStorage(key, updatedImages);
    console.log("removeImages()_updatedImages: ", updatedImages);
    return updatedImages;
  }

  syncImageStores() {
    console.log("syncImageStores().");

    const addedImages = this.getImages("addedImages");
    const galleryImages = this.getImages("galleryImages");

    const addedImageSrc: string[] = addedImages.map((img: ImageTypeSrc) => img.src);

    const updatedGalleryImages = galleryImages.filter((img: ImageTypeSrc) => {
      return !img.src.startsWith("data") || addedImageSrc.includes(img.src) // Keeps all images that are not Base64 encoded or that are still in the addedImages array. So this deletes all Base64 encoded images that are not in the addedImages array.
    });

    this.saveToLocalStorage("galleryImages", updatedGalleryImages);
    console.log("syncImageStores()_updatedGalleryImages: ", updatedGalleryImages);
    return updatedGalleryImages;
  }


  async downloadAllImages() {
    console.log("downloadAllImages().");

    const listRef = this.firebaseContextService.getReference(`uploadedAllImages`);
    const listResult = await this.firebaseContextService.listAll(listRef); // This will list all the images in the storage bucket. 
    const downloadUrls: string[] = [];
    const images: ImageType[] = [];

    console.log("downloadAllImages()_listResult: ", listResult);

    for (let item of listResult.items) { // This will loop through all the images in the storage bucket.
      console.log("downloadAllImages()_item: ", item);
      try {
        const url = await this.firebaseContextService.getDownloadURL(item); // This will get the download URL of the image meaning that it will download the image from the storage bucket. 
        downloadUrls.push(url);

        images.push({
          src: url,
          alt: item.name,
          relativePath: item.name
        });

        console.log("downloadAllImages()_url: ", url);
        this.galleryImages.set(images);

      } catch (error) {
        console.log(`downloadAllImages()_error: ${error} for item: ${item.name}`);
      }
    }
    return downloadUrls;
  }


  async downloadAndDisplayImages() {
    console.log("downloadAndDisplayImages().");

    try {
      let downloadUrls: string[] = [];
      console.log("downloadAndDisplayImages()_action: ", this.action());

      if (this.action() === "uploadAllImages") {
        downloadUrls = await this.downloadAllImages();
        console.log("downloadAndDisplayImages()_this.downloadAllImages(): ");

      } else if (this.action() === "selectForDevice") {
        downloadUrls = await this.downloadSelectedImages();

      } else {
        throw new Error('downloadAndDisplayImages.');
      }

      const images = downloadUrls.map((url, index) => ({ // This will loop through all the images and add them to the images array. 
        src: url,
        alt: `Image ${index + 1}`,
        relativePath: url.split('/').pop() || `image_${index + 1}` // This will either get the last part of the URL or "image_1" if the URL is empty.
      }));

      if (this.action() === "selectForDevice") {
        this.deviceImages.set(images);

      } else if (this.action() === "uploadAllImages") {
        this.galleryImages.set(images);
        console.log("downloadAndDisplayImages()_images: ", images);
      }

    } catch (error) {
      console.error("downloadAndDisplayImages(): An error has occured whilst loading images from Firebase:", error);
    }
  }

  async downloadSelectedImages() {
    console.log("downloadSelectedImages().");

    const listRef = this.firebaseContextService.getReference(`selectForDevice`);
    const listResult = await this.firebaseContextService.listAll(listRef);
    const downloadUrls: string[] = [];

    console.log("downloadSelectedImages()_listResult: ", listResult);

    if (listResult.items.length === 0) {
      console.log("downloadSelectedImages()_No images found in 'selectForDevice' folder.");
      return downloadUrls;
    }

    for (let item of listResult.items) {
      console.log("downloadSelectedImages()_item: ", item);
      try {
        const url = await this.firebaseContextService.getDownloadURL(item); // This will get the download URL of the image meaning that it will download the image from the storage bucket. 
        downloadUrls.push(url);

        console.log("downloadSelectedImages()_url: ", url);

      } catch (error) {
        console.log(`downloadSelectedImages()_error: ${error} for item: ${item.name}`);
      }
    }
    return downloadUrls;
  }

  checkCachedImages(cachedImagesJson: string | null, addedImages: ImageType[], storageImages: ImageType[], allImages: ImageType[]) {
    console.log("checkCachedImages().");

    allImages = [...storageImages];

    if (addedImages && addedImages.length > 0) {
      allImages = [...allImages, ...addedImages];
    }

    if (allImages.length === 0 && cachedImagesJson) {
      try {
        const parsedCachedImages = JSON.parse(cachedImagesJson);
        console.log("checkCachedImages()_Using cached images as fallback:", parsedCachedImages.length);
        allImages = parsedCachedImages;

      } catch (error) {
        console.error("checkCachedImages()_Error parsing cachedImagesJson:", error);
      }
    }

    const uniqueImages = this.removeDuplicatesByName(allImages);
    console.log("checkCachedImages()_All unique images:", uniqueImages.length);
    return uniqueImages;
  }


  removeDuplicatesByName(images: any[]): any[] {
    console.log("removeDuplicates().");

    return images.filter((item, index, array) =>
      item.src && index === array.findIndex((item2) => item2.src === item.src)
    );
  }

  async syncAllImageStores() {
    console.log("syncAllImageStores().");

    localStorage.removeItem("galleryImages");
    localStorage.removeItem("addedImages");

    await this.downloadAllImages();
    const storageImages = this.galleryImages();

    localStorage.setItem("galleryImages", JSON.stringify(storageImages));
    localStorage.setItem("addedImages", JSON.stringify(this.images()));

    console.log("syncAllImageStores()_storageImages.length: ", storageImages.length);
    console.log("syncAllImageStores()_this.images().length: ", this.images().length);
    return storageImages;
  }
}
