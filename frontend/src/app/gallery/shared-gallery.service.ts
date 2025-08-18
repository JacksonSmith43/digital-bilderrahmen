import { Injectable, signal } from '@angular/core';
import { ImageType, ImageTypeSrc } from './gallery-model';

@Injectable({ providedIn: 'root' })
export class SharedGalleryService {

  images = signal<ImageType[]>([]);
  galleryHighlightSrcs = signal<string[]>([]);

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
    return updatedGalleryImages;
  }

}
