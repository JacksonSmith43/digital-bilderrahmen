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


  async fetchAllImages() {
    console.log("fetchAllImages().");

    const listRef = this.firebaseContextService.getReference(`uploadedAllImages`);
    const listResult = await this.firebaseContextService.listAll(listRef); // This will list all the images in the storage bucket. 
    const fetchUrls: string[] = [];
    const images: ImageType[] = [];
    const galleryStorageRaw = localStorage.getItem("galleryImages");
    const galleryStorage: ImageType[] = galleryStorageRaw ? JSON.parse(galleryStorageRaw) : [];
    const fetchedImagesArray = listResult.items.map(item => item.name);

    console.log("fetchAllImages()_listResult: ", listResult);
    console.log("fetchAllImages()_fetchedImagesArray", fetchedImagesArray);
    console.log("fetchAllImages()_galleryStorage: ", galleryStorage);
    const normaliseFileName = (name: string): string => { // This makes it so that the comparison is case insensitive and ignores underscores, hyphens, spaces, and file extensions. 
      return name
        .toLowerCase()
        .replace(/^.*%2f/i, '') // Removes URL-encoded paths (%2f = /). 
        .replace(/^.*\//i, '') // Removes everything before the last slash. 
        .replace(/[_\-\s]+/g, '') // Removes underscores, hyphens, spaces. 
        .replace(/\.[^/.]+$/, '') // Removes file extension. 
        .replace(/%20/g, ''); // Removes URL-encoded spaces. 
    };

    const galleryImageNames = galleryStorage.map(img => {
      const fileName = img.relativePath || img.src.split('/').pop() || '';
      return normaliseFileName(fileName);
    });
    console.log("fetchAllImages()_galleryImageNames", galleryImageNames);

    const normalisedFetchedImages = fetchedImagesArray.map(fileName => normaliseFileName(fileName));
    console.log("fetchAllImages()_normalisedFetchedImages", normalisedFetchedImages);


    const someImagesAlreadyLoaded = normalisedFetchedImages.some(fetchedName =>
      galleryImageNames.includes(fetchedName)
    );
    console.log("fetchAllImages()_someImagesAlreadyLoaded", someImagesAlreadyLoaded);

    if (someImagesAlreadyLoaded || galleryStorage.length > 0) {
      console.log("fetchAllImages()_Some fetched images are already in gallery, checking for new ones.");

      const notFetched = normalisedFetchedImages.filter(name => !galleryImageNames.includes(name));

      if (notFetched.length > 0) { // Only fetches new images if there are any that are not already in the gallery. 
        console.log("fetchAllImages()_notFetched: ", notFetched);

        const unFetchedItems = listResult.items.filter(item => { // Filters the items to only those that are not already in the gallery. This is a Firebase StorageReference object array. 
          const normalisedItemName = normaliseFileName(item.name);
          return notFetched.includes(normalisedItemName);
        });

        console.log("fetchAllImages()_unFetchedItems: ", unFetchedItems);

        const currentImages = [...this.galleryImages()];
        console.log("fetchAllImages()_currentImages: ", currentImages);

        for (let item of unFetchedItems) {
          console.log("fetchAllImages()_Loading new item: ", item);

          try {
            const url = await this.firebaseContextService.getDownloadURL(item);

            fetchUrls.push(url);
            currentImages.push({
              src: url,
              alt: item.name,
              relativePath: item.name
            });

            console.log("fetchAllImages()_New url loaded: ", url);

          } catch (error) {
            console.log(`fetchAllImages()_Error loading ${item.name}: ${error}`);
          }
        }

        this.galleryImages.set(currentImages);
        return currentImages.map(img => img.src);

      } else { // Incase no new images are to be loaded. Already existing images will be used. 
        console.log("fetchAllImages()_No new images to fetch, using existing gallery.");
        return this.galleryImages().map(img => img.src);
      }


    } else { // Load all images. 
      console.log("fetchAllImages()_No images in gallery yet, loading all images from Firebase.");

      for (let item of listResult.items) { // This will loop through all the images in the storage bucket.
        console.log("fetchAllImages()_item: ", item);

        try {
          const url = await this.firebaseContextService.getDownloadURL(item); // This will get the download URL of the image meaning that it will download/fetch the image from the storage bucket. 

          fetchUrls.push(url);
          images.push({
            src: url,
            alt: item.name,
            relativePath: item.name
          });

          console.log("fetchAllImages()_url: ", url);
          this.galleryImages.set(images);

        } catch (error) {
          console.log(`fetchAllImages()_error: ${error} for item: ${item.name}`);
        }
      }
      console.log("fetchAllImages()_fetchUrls: ", fetchUrls);
      return fetchUrls;
    }

  }


  async fetchAndDisplayImages() {
    console.log("fetchAndDisplayImages().");

    try {
      let fetchUrls: string[] = [];
      console.log("fetchAndDisplayImages()_action: ", this.action());

      if (this.action() === "uploadAllImages") {
        fetchUrls = await this.fetchAllImages();
        console.log("fetchAndDisplayImages()_this.fetchAllImages(): ");

      } else if (this.action() === "selectForDevice") {
        fetchUrls = await this.fetchSelectedImages();

      } else {
        throw new Error('fetchAndDisplayImages.');
      }

      const images = fetchUrls.map((url, index) => ({ // This will loop through all the images and add them to the images array. 
        src: url,
        alt: `Image ${index + 1}`,
        relativePath: url.split('/').pop() || `image_${index + 1}` // This will either get the last part of the URL or "image_1" if the URL is empty.
      }));

      if (this.action() === "selectForDevice") {
        this.deviceImages.set(images);

      } else if (this.action() === "uploadAllImages") {
        this.galleryImages.set(images);
        console.log("fetchAndDisplayImages()_images: ", images);
      }

    } catch (error) {
      console.error("fetchAndDisplayImages(): An error has occured whilst loading images from Firebase:", error);
    }
  }

  async fetchSelectedImages() {
    console.log("fetchSelectedImages().");

    const listRef = this.firebaseContextService.getReference(`selectForDevice`);
    const listResult = await this.firebaseContextService.listAll(listRef);
    const fetchUrls: string[] = [];

    console.log("fetchSelectedImages()_listResult: ", listResult);

    if (listResult.items.length === 0) {
      console.log("fetchSelectedImages()_No images found in 'selectForDevice' folder.");
      return fetchUrls;
    }

    for (let item of listResult.items) {
      console.log("fetchSelectedImages()_item: ", item);
      try {
        const url = await this.firebaseContextService.getDownloadURL(item); // This will get the download URL of the image meaning that it will download/fetch the image from the storage bucket. 
        fetchUrls.push(url);

        console.log("fetchSelectedImages()_url: ", url);

      } catch (error) {
        console.log(`fetchSelectedImages()_error: ${error} for item: ${item.name}`);
      }
    }
    return fetchUrls;
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

    await this.fetchAndDisplayImages();
    const storageImages = this.galleryImages();

    localStorage.setItem("galleryImages", JSON.stringify(storageImages));
    localStorage.setItem("addedImages", JSON.stringify(this.images()));

    console.log("syncAllImageStores()_storageImages.length: ", storageImages.length);
    console.log("syncAllImageStores()_this.images().length: ", this.images().length);
    return storageImages;
  }
}
