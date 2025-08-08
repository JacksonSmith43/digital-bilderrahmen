import { inject, Injectable, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { deleteObject, getBytes, getDownloadURL, listAll, ref, Storage, uploadBytes, uploadBytesResumable, UploadTask } from '@angular/fire/storage';
import { GalleryService } from './gallery.service';

@Injectable({
  providedIn: 'root'
})
export class GalleryStorageService {
  firestore = inject(Firestore);
  firebaseStorage = inject(Storage);
  galleryService = inject(GalleryService);

  galleryImages = signal<{ src: string; alt: string; relativePath: string }[]>([]);
  deviceImages = signal<{ src: string; alt: string; relativePath: string }[]>([]);
  action: "selectForDevice" | "uploadAllImages" | undefined = undefined;

  uploadSingleImage(imageName: string, image: Blob, action: string | undefined): UploadTask {
    console.log("uploadSingleImage().");

    if (!action) {
      throw new Error('No action set for single upload.');
    }

    console.log("uploadSingleImage()_action: ", action);

    if (action === "uploadAllImages") {
      const storageRef = ref(this.firebaseStorage, `uploadedAllImages/${imageName}`); // This will create a reference to the images folder in the storage bucket. 
      return uploadBytesResumable(storageRef, image); // This will upload the image to the storage bucket. 

    } else if (action === "selectForDevice") {
      const storageRef = ref(this.firebaseStorage, `selectForDevice/${imageName}`);
      return uploadBytesResumable(storageRef, image);

    } else {
      throw new Error('Invalid action for uploadSingleImage.');
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

  async downloadAllImages() {
    console.log("downloadAllImages().");

    const listRef = ref(this.firebaseStorage, `uploadedAllImages`);
    const listResult = await listAll(listRef); // This will list all the images in the storage bucket. 
    const downloadUrls: string[] = [];

    console.log("downloadAllImages()_listResult: ", listResult);

    for (let item of listResult.items) { // This will loop through all the images in the storage bucket.
      console.log("downloadAllImages()_item: ", item);
      try {
        const url = await getDownloadURL(item); // This will get the download URL of the image meaning that it will download the image from the storage bucket. 
        downloadUrls.push(url);

        console.log("downloadAllImages()_url: ", url);

      } catch (error) {
        console.log(`downloadAllImages()_error: ${error} for item: ${item.name}`);
      }
    }
    return downloadUrls;
  }


  async downloadAndDisplayImages() {
    try {
      let downloadUrls: string[] = [];

      if (this.action === "uploadAllImages") {
        downloadUrls = await this.downloadAllImages();

      } else if (this.action === "selectForDevice") {
        downloadUrls = await this.downloadSelectedImages();

      } else {
        throw new Error('Invalid action for downloadAndDisplayImages.');
      }

      const images = downloadUrls.map((url, index) => ({ // This will loop through all the images and add them to the images array. 
        src: url,
        alt: `Image ${index + 1}`,
        relativePath: url.split('/').pop() || `image_${index + 1}` // This will either get the last part of the URL or "image_1" if the URL is empty.
      }));

      if (this.action === "selectForDevice") {
        this.deviceImages.set(images);

      } else if (this.action === "uploadAllImages") {
        this.galleryImages.set(images);
      }

    } catch (error) {
      console.error("downloadAndDisplayImages(): An error has occured whilst loading images from Firebase:", error);
    }
  }

  deleteImageFromFirebase(selectedImages: string[], action: string) {
    console.log("deleteImageFromFirebase().");
    console.log("deleteImageFromFirebase()_selectedImages: ", selectedImages);

    if (selectedImages.length === 0) {
      console.log("deleteImageFromFirebase()_No image has been selected for deletion.");
      return;
    }

    selectedImages.forEach(async (imageUrl) => {
      try {
        const fileName = this.extractFileNameFromUrl(imageUrl);
        let imageRef: any;

        if (!fileName) {
          console.log("deleteImageFromFirebase()_Could not extract file name from URL: ", imageUrl);
          return;
        }

        if (action === "uploadAllImages") {
          imageRef = ref(this.firebaseStorage, `uploadedAllImages/${fileName}`);
          await deleteObject(imageRef);

        } else if (action === "selectForDevice") {
          imageRef = ref(this.firebaseStorage, `selectForDevice/${fileName}`);
          await deleteObject(imageRef);

        } else {
          console.log("deleteImageFromFirebase()_Invalid action for deleteImageFromFirebase: ", action);
        }

        console.log(`deleteImageFromFirebase()_${fileName} has successfully been deleted from Firebase.`);

        this.downloadAndDisplayImages();

      } catch (error) {
        console.error("An error has occured while trying to delete the image from Firebase:", error);
      }
    })
    this.galleryService.galleryHighlightSrcs.set([]);
  }

  extractFileNameFromUrl(url: string): string | null {
    try {

      if (url.includes("firebasestorage.googleapis.com")) { // Checks if the URL is from Firebase Storage. 
        const urlObj = new URL(url); // Creates a URL object from the string URL to easily access its parts. 
        const pathParam = urlObj.pathname.split('/o/')[1]; // Extract the 'o' parameter from the URL which contains the path to the image. Splits the pathname at '/o/' and takes everything after it. 

        if (pathParam) { // Checks if the path parameter exists. 
          const decodedPath = decodeURIComponent(pathParam); // Decodes URL-encoded characters like %20 (space) or %2F (slash). %2F will be decoded to /. 
          return decodedPath.split('/').pop() || null; // Takes everything after the last slash (which is the filename). Returns null if there's no filename. 

        } else {
          return null;
        }

      } else {
        return url.split('/').pop() || null; // For local paths, returns the last segment after the final slash.  
      }


    } catch (error) {
      console.error("extractFileNameFromUrl()_error: ", error);
      return null;
    }
  }


  async downloadSelectedImages() {
    console.log("downloadSelectedImages().");

    const listRef = ref(this.firebaseStorage, `selectForDevice`);
    const listResult = await listAll(listRef); // This will list all the images in the storage bucket. 
    const downloadUrls: string[] = [];

    console.log("downloadSelectedImages()_listResult: ", listResult);

    for (let item of listResult.items) { // This will loop through all the images in the storage bucket.
      console.log("downloadSelectedImages()_item: ", item);
      try {
        const url = await getDownloadURL(item); // This will get the download URL of the image meaning that it will download the image from the storage bucket. 
        downloadUrls.push(url);

        console.log("downloadSelectedImages()_url: ", url);

      } catch (error) {
        console.log(`downloadSelectedImages()_error: ${error} for item: ${item.name}`);
      }
    }
    return downloadUrls;
  }

  async copyImageBetweenFolders(sourceFolder: string, targetFolder: string, imageName: string): Promise<void> {
    console.log("copyImageBetweenFolders().");

    try {
      const sourceRef = ref(this.firebaseStorage, `${sourceFolder}/${imageName}`);
      const targetRef = ref(this.firebaseStorage, `${targetFolder}/${imageName}`);

      const url = await getDownloadURL(sourceRef);
      const response = await fetch(url);
      const blob = await response.blob();

      await uploadBytes(targetRef, blob);

      console.log(`copyImageBetweenFolders()_"${imageName}" has been copied from "${sourceFolder}" to "${targetFolder}".`);

    } catch (error) {
      console.error("copyImageBetweenFolders()_error: ", error);
    }
  }

}