import { inject, Injectable } from '@angular/core';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { ref, Storage, uploadBytesResumable, UploadTask } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class GalleryStorageService {
  action: "selectForDevice" | "uploadAllImages" | undefined = undefined;
  firestore = inject(Firestore);
  firebaseStorage = inject(Storage);

  uploadSingleImage(imageName: string, image: Blob, action: string | undefined): UploadTask {
    if (!action) {
      throw new Error('No action set for single upload.');
    }

    console.log("uploadSingleImage()_action: ", action);

    if (action === "uploadAllImages") {
      const storageRef = ref(this.firebaseStorage, `uploadedImages/${imageName}`); // This will create a reference to the images folder in the storage bucket. 
      return uploadBytesResumable(storageRef, image); // This will upload the image to the storage bucket. 

    } else if (action === "selectForDevice") {
      const storageRef = ref(this.firebaseStorage, `selectForDevice/${imageName}`);
      return uploadBytesResumable(storageRef, image);

    } else {
      throw new Error('Invalid action for uploadSingleImage.');
    }
  }


  async urlToBlob(url: string): Promise<Blob> { // This will convert the URL to a blob. Works with both external URLs like "https://example.com/image.jpg" and local paths like "assets/car.jpg".
    const response = await fetch(url); // This will fetch the image from the URL. This requests the image data from the server and loads it into memory. 
    return await response.blob(); // Only once the image has been downloaded, will it be converted to a blob.
  }

  dataURLToBlob(dataURL: string): Blob { // This will convert the data URL to a blob. An example would be "data:image/jpeg;base64,/9j/4AAQSkZJRgABAg..."
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

  async convertSrcToBlob(src: string): Promise<Blob> {
    let blob: Blob;

    if (src.startsWith('data:')) {
      blob = this.dataURLToBlob(src);

    } else {
      blob = await this.urlToBlob(src);
    }
    return blob;
  }

  async convertToBlobs(srcs: string[]): Promise<Blob[]> {
    const blobs: Blob[] = [];

    for (let src of srcs) {
      let blob = await this.convertSrcToBlob(src);
      blobs.push(blob);
    }
    console.log("convertToBlobs()_blobs: ", blobs);
    return blobs;
  }

}