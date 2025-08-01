import { inject, Injectable, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { getDownloadURL, listAll, ref, Storage, uploadBytesResumable, UploadTask } from '@angular/fire/storage';
import { GalleryService } from './gallery.service';

@Injectable({
  providedIn: 'root'
})
export class GalleryStorageService {
  firestore = inject(Firestore);
  firebaseStorage = inject(Storage);
  galleryService = inject(GalleryService);

  galleryImages = signal<{ src: string; alt: string; relativePath: string }[]>([]);

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
      const downloadUrls = await this.downloadAllImages();

      const images = downloadUrls.map((url, index) => ({ // This will loop through all the images and add them to the images array. 
        src: url,
        alt: `Image ${index + 1}`,
        relativePath: url.split('/').pop() || `image_${index + 1}` // This will either get the last part of the URL or "image_1" if the URL is empty.
      }));

      this.galleryImages.set(images);

    } catch (error) {
      console.error("downloadAndDisplayImages(): An error has occured whilst loading images from Firebase:", error);
    }
  }
}