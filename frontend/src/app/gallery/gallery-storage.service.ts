import { inject, Injectable, signal } from '@angular/core';
import { UploadTask } from '@angular/fire/storage';

import { SharedGalleryService } from './shared-gallery.service';
import { ImageType } from './gallery-model';
import { FirebaseContextService } from './firebase-context.service';

@Injectable({
  providedIn: 'root'
})
export class GalleryStorageService {
  sharedGalleryService = inject(SharedGalleryService);
  firebaseContextService = inject(FirebaseContextService);

  galleryImages = signal<ImageType[]>([]);
  deviceImages = signal<ImageType[]>([]);
  action = signal<"selectForDevice" | "uploadAllImages" | undefined>(undefined);

  uploadSingleImage(imageName: string, image: Blob): UploadTask {
    console.log("uploadSingleImage().");

    if (!this.action()) {
      throw new Error('No action set for single upload.');
    }

    console.log("uploadSingleImage()_action: ", this.action());

    if (this.action() === "uploadAllImages") {
      const storageRef = this.firebaseContextService.getReference(`uploadedAllImages/${imageName}`); // This will create a reference to the images folder in the storage bucket. 
      return this.firebaseContextService.uploadBytesResumable(storageRef, image); // This will upload the image to the storage bucket. 

    } else if (this.action() === "selectForDevice") {
      const storageRef = this.firebaseContextService.getReference(`selectForDevice/${imageName}`);
      return this.firebaseContextService.uploadBytesResumable(storageRef, image);

    } else {
      throw new Error('Invalid action for uploadSingleImage.');
    }
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

  async deleteImageFromFirebase(selectedImages: string[]) {
    console.log("deleteImageFromFirebase().");
    console.log("deleteImageFromFirebase()_selectedImages: ", selectedImages);

    const deletedImages: string[] = [];

    if (selectedImages.length === 0) {
      console.log("deleteImageFromFirebase()_No image has been selected for deletion.");
      return;
    }

    await Promise.all(selectedImages.map(async (imageUrl) => { // Promise.all is here to make sure that all the images are deleted before the function returns. The images are deleted one at a time. 
      try {
        const fileName = this.extractFileNameFromUrl(imageUrl);
        let imageRef: any;

        if (!fileName) {
          console.log("deleteImageFromFirebase()_Could not extract file name from URL: ", imageUrl);
          return;
        }

        imageRef = this.firebaseContextService.getReference(`uploadedAllImages/${fileName}`);
        console.log("deleteImageFromFirebase()_selectedImages_2: ", selectedImages);
        await this.firebaseContextService.deleteObject(imageRef);

        console.log(`deleteImageFromFirebase()_${fileName} has successfully been deleted from Firebase.`);
        deletedImages.push(imageUrl);

      } catch (error) {
        console.error("An error has occured while trying to delete the image from Firebase:", error);
      }
    }));

    if (deletedImages.length > 0) {
      const currentImages = this.galleryImages();
      const updatedImages = currentImages.filter(img => !deletedImages.includes(img.src));
      this.galleryImages.set(updatedImages);
      console.log("deleteImageFromFirebase()_updatedImages: ", updatedImages);
    }

    this.sharedGalleryService.galleryHighlightSrcs.set([]);
    return this.downloadAndDisplayImages();
  }

  async downloadSelectedImages() {
    console.log("downloadSelectedImages().");

    const listRef = this.firebaseContextService.getReference(`selectForDevice`);
    const listResult = await this.firebaseContextService.listAll(listRef);
    const downloadUrls: string[] = [];

    console.log("downloadSelectedImages()_listResult: ", listResult);

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

  extractFileNameFromUrl(url: string): string | null {
    console.log("extractFileNameFromUrl().");

    try {

      if (!url) {
        console.log("extractFileNameFromUrl()_URL is null or undefined");
        return null;
      }

      if (url.includes("firebasestorage.googleapis.com")) { // Checks if the URL is from Firebase Storage. 
        const urlObj = new URL(url); // Creates a URL object from the string URL to easily access its parts. 
        const pathParam = urlObj.pathname.split('/o/')[1]; // Extract the 'o' parameter from the URL which contains the path to the image. Splits the pathname at '/o/' and takes everything after it. 

        if (pathParam) { // Checks if the path parameter exists. 
          const decodedPath = decodeURIComponent(pathParam); // Decodes URL-encoded characters like %20 (space) or %2F (slash). %2F will be decoded to /. 
          const fileName = decodedPath.split('/').pop() || null; // Takes everything after the last slash (which is the filename). Returns null if there's no filename. 

          return fileName;

        } else {
          console.log("extractFileNameFromUrl()_Could not extract file name from URL: ", url);
          return null;
        }

      } else if (url.startsWith("data:")) { // This is for Base64 data URLs. 
        console.log("extractFileNameFromUrl()_Data URL detected.");

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        let extension = "png";

        console.log("extractFileNameFromUrl()_A name has been generated for the Base64 image.");
        console.log("extractFileNameFromUrl()_URL:", url);


        try {
          extension = url.split(";")[0].split("/")[1] || "png";

          if (extension === "jpeg") {
            extension = "jpg";  // Converts 'jpeg' to 'jpg'. 
          }

        } catch (e) {
          console.log("Could not extract extension from Base64 data URL. Using default extension 'png'.");
        }

        const imageName = `image_data_${timestamp}_${randomString}.${extension}`; // This will generate a unique image name. 
        console.log("extractFileNameFromUrl()_imageName: ", imageName);
        return imageName;

      } else { // For local paths or other URLs. 
        const segments = url.split('/');
        const fileName = segments.pop() || null; // For local paths, returns the last segment after the final slash. 
        console.log("extractFileNameFromUrl()_Local path filename:", fileName);
        return fileName;
      }


    } catch (error) {
      console.error("extractFileNameFromUrl()_error: ", error);
      return null;
    }
  }


  async checkExistenceOfImage(image: string): Promise<boolean> {
    console.log("checkExistenceOfImage().");

    const imageName = image.includes("/") || image.includes("data:") ? this.extractFileNameFromUrl(image) : image; // If the image is a URL, extract the file name, otherwise use the image name directly. 

    if (!imageName || imageName.length < 2) {
      console.error("checkExistenceOfImage()_Invalid image name:", imageName);
      return false;
    }

    try { // Checks whether the image exists in the uploadedAllImages folder. 
      const sourceRef = this.firebaseContextService.getReference(`uploadedAllImages/${imageName}`);
      await this.firebaseContextService.getDownloadURL(sourceRef); // This wil throw an error if the image does not exist. 
      return true;

    } catch (error) {
      console.error(`checkExistenceOfImage()_Error checking image: ${imageName}`, error);
      return false;
    }
  }

  async handleBase64Image(url: string): Promise<string | null> {
    console.log("handleBase64Image().");

    const imageName = this.extractFileNameFromUrl(url);
    console.log("handleBase64Image()_imageName: ", imageName);

    if (!imageName) {
      console.error("handleBase64Image()_Could not generate image name.");
      return null;
    }

    try {
      const blob = this.dataURLToBlob(url);
      await this.uploadSingleImage(imageName, blob);

      console.log(`handleBase64Image()_Successfully uploaded: ${imageName}`);
      return imageName;

    } catch (error) {
      console.error("handleBase64Image()_Error:", error);
      return null;
    }
  }

  async copyImageBetweenFolders(sourceFolder: string, destinationFolder: string, imageName: string): Promise<void> {
    console.log("copyImageBetweenFolders().");

    try {

      try { // Checks if the destination folder exists. 
        const testRef = this.firebaseContextService.getReference(`${destinationFolder}/`);
        await this.firebaseContextService.listAll(testRef); // Tries to list the files in the destination folder. 

      } catch (error) { // If the destination folder does not exist it will be created. 
        console.log(`copyImageBetweenFolders()_DestinationFolder "${destinationFolder}" does not exist. It will be created.`);
        const emptyBlob = new Blob([''], { type: 'text/plain' });
        const placeholderRef = this.firebaseContextService.getReference(`${destinationFolder}/.placeholder`);
        await this.firebaseContextService.uploadBytes(placeholderRef, emptyBlob);
      }

      const sourceRef = this.firebaseContextService.getReference(`${sourceFolder}/${imageName}`);
      const destinationRef = this.firebaseContextService.getReference(`${destinationFolder}/${imageName}`);

      const url = await this.firebaseContextService.getDownloadURL(sourceRef);
      const response = await fetch(url);
      const blob = await response.blob();

      await this.firebaseContextService.uploadBytes(destinationRef, blob);

      console.log(`copyImageBetweenFolders()_"${imageName}" has been copied from "${sourceFolder}" to "${destinationRef}".`);

    } catch (error) {
      console.error("copyImageBetweenFolders()_error: ", error);
    }
  }


  dataURLToBlob(dataURL: string): Blob { // This will convert the data URL to a blob. An example would be "data:image/jpeg;base64,/9j/4AAQSkZJRgABAg..."
    console.log("dataURLToBlob().");

    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]); // bstr is a binary string. 
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) { // This will loop through the binary string and convert it to a Uint8Array. n-- means that it will decrement the value of n by 1 and once it reaches 0, it will stop.
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime }); // Blob([u8arr], { type: mime }) means that [u8arr] is the data and { type: mime } is the type of the data. All in all this will convert the data URL to a blob. 
  }

  async urlToBlob(url: string): Promise<Blob> { // This will convert the URL to a blob. Works with both external URLs like "https://example.com/image.jpg" and local paths like "assets/car.jpg".
    console.log("urlToBlob().");

    const response = await fetch(url); // This will fetch the image from the URL. This requests the image data from the server and loads it into memory. 
    return await response.blob(); // Only once the image has been downloaded, will it be converted to a blob.
  }

  async convertSrcToBlob(src: string): Promise<Blob> {
    console.log("convertSrcToBlob().");
    let blob: Blob;

    if (src.startsWith('data:')) {
      blob = this.dataURLToBlob(src);
      console.log("convertSrcToBlob()_blob_data: ", blob);

    } else {
      blob = await this.urlToBlob(src);
      console.log("convertSrcToBlob()_blob_url: ", blob);
    }
    return blob;
  }

  async convertToBlobs(srcs: string[]): Promise<Blob[]> {
    console.log("convertToBlobs().");
    const blobs: Blob[] = [];

    for (let src of srcs) {
      let blob = await this.convertSrcToBlob(src);
      blobs.push(blob);
      console.log("convertToBlobs()_loop_blobs: ", blobs);
    }
    console.log("convertToBlobs()_blobs: ", blobs);
    return blobs;
  }
}