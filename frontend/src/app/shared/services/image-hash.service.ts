import { inject, Injectable } from '@angular/core';

import { ImageType } from '../model/image-type.model';
import { MediaConversionService } from './media-conversion.service';

@Injectable({ providedIn: 'root' })
export class ImageHashService {
  mediaConversionService = inject(MediaConversionService);

  async blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    console.log('blobToArrayBuffer().');
    return await blob.arrayBuffer();
  }

  async getImageHash(blob: Blob): Promise<string> {
    // This calculates the SHA-256 hash of the image blob.
    console.log('getImageHash().');

    const buffer = await this.blobToArrayBuffer(blob);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    console.log('getImageHash()_hashBuffer: ', hashBuffer);

    return Array.from(new Uint8Array(hashBuffer)) // This converts the ArrayBuffer to Hex-String.
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async findMatchingImages(galleryImages: ImageType[], deviceImages: ImageType[]): Promise<ImageType[]> {
    // This finds images that are present in both gallery and device settings by comparing their hashes.
    console.log('findMatchingImages().');

    const galleryHashes = await Promise.all(
      // Calculates hashes for all gallery images.
      galleryImages.map(async img => {
        const blob = await this.mediaConversionService.urlToBlob(img.src);
        return { hash: await this.getImageHash(blob), img };
      })
    );
    console.log('findMatchingImages()_galleryHashes: ', galleryHashes);

    const deviceHashes = await Promise.all(
      // Calculates hashes for all device images.
      deviceImages.map(async img => {
        const blob = await this.mediaConversionService.urlToBlob(img.src);
        return { hash: await this.getImageHash(blob), img };
      })
    );
    console.log('findMatchingImages()_deviceHashes: ', deviceHashes);

    const galleryHashSet = new Set(galleryHashes.map(h => h.hash)); // Creates a set of gallery image hashes for quick lookup.
    console.log('findMatchingImages()_galleryHashSet: ', galleryHashSet);
    return deviceHashes.filter(dh => galleryHashSet.has(dh.hash)).map(dh => dh.img); // Returns only the images that have matching hashes.
  }
}
