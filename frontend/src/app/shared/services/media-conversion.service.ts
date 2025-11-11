import { inject, Injectable } from '@angular/core';

import { GalleryStorageService } from '../../gallery/services/gallery-storage.service';
import { FileNameService } from './file-name.service';

@Injectable({ providedIn: 'root' })
export class MediaConversionService {
  private galleryStorageService = inject(GalleryStorageService);
  private fileNameService = inject(FileNameService);

  async handleBase64Image(url: string): Promise<string | null> {
    console.log('handleBase64Image().');

    const imageName = this.fileNameService.normaliseFileName(url);

    console.log('handleBase64Image()_imageName: ', imageName);

    if (!imageName) {
      console.error('handleBase64Image()_Could not generate image name.');
      return null;
    }

    try {
      const blob = this.dataURLToBlob(url);
      await this.galleryStorageService.uploadSingleImage(imageName, blob);

      console.log(`handleBase64Image()_Successfully uploaded: ${imageName}`);
      return imageName;
    } catch (error) {
      console.error('handleBase64Image()_Error:', error);
      return null;
    }
  }

  dataURLToBlob(dataURL: string): Blob {
    // This will convert the data URL to a blob. An example would be "data:image/jpeg;base64,/9j/4AAQSkZJRgABAg..."
    console.log('dataURLToBlob().');

    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]); // bstr is a binary string.
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      // This will loop through the binary string and convert it to a Uint8Array. n-- means that it will decrement the value of n by 1 and once it reaches 0, it will stop.
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime }); // Blob([u8arr], { type: mime }) means that [u8arr] is the data and { type: mime } is the type of the data. All in all this will convert the data URL to a blob.
  }

  async urlToBlob(url: string): Promise<Blob> {
    // This will convert the URL to a blob. Works with both external URLs like "https://example.com/image.jpg" and local paths like "assets/car.jpg".
    console.log('urlToBlob().');

    const response = await fetch(url); // This will fetch the image from the URL. This requests the image data from the server and loads it into memory.
    return await response.blob(); // Only once the image has been downloaded/fetched, will it be converted to a blob.
  }

  async convertSrcToBlob(src: string): Promise<Blob> {
    console.log('convertSrcToBlob().');
    let blob: Blob;

    if (src.startsWith('data:')) {
      blob = this.dataURLToBlob(src);
      console.log('convertSrcToBlob()_blob_data: ', blob);
    } else {
      blob = await this.urlToBlob(src);
      console.log('convertSrcToBlob()_blob_url: ', blob);
    }
    return blob;
  }

  async convertToBlobs(srcs: string[]): Promise<Blob[]> {
    console.log('convertToBlobs().');
    const blobs: Blob[] = [];

    for (let src of srcs) {
      let blob = await this.convertSrcToBlob(src);
      blobs.push(blob);
      console.log('convertToBlobs()_loop_blobs: ', blobs);
    }
    console.log('convertToBlobs()_blobs: ', blobs);
    return blobs;
  }
}
