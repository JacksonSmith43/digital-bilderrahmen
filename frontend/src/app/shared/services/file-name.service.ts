import { Injectable } from '@angular/core';

import { ImageType } from '../model/image-type.model';

@Injectable({ providedIn: 'root' })
export class FileNameService {
  normaliseFileName(name: string): string {
    // This makes it so that the comparison is case insensitive and ignores underscores, hyphens, spaces, and file extensions.
    const nameWithoutQuery = name.split('?')[0];
    const nameWithoutExtension = nameWithoutQuery.replace(/\.[^/.]+$/, ''); // Removes everything after the last dot (file extension).
    const extension = nameWithoutQuery.split('.').pop();

    const normalised = nameWithoutExtension
      .replace(/^.*%2f/i, '') // Removes URL-encoded paths (%2f = /).
      .replace(/^.*\//i, '') // Removes everything before the last slash.
      .replace(/%20/g, ' ') // Removes URL-encoded spaces to add underscores.
      //.replace(/\s+/g, '_')  // Replaces spaces with underscores.
      .replace(/\.[^/.]+$/, ''); // Removes file extension.
    //  .toLowerCase();

    return extension ? `${normalised}.${extension}` : normalised;
  }

  extractImageName(imageSrc: string, imageObj?: ImageType): string {
    if (imageSrc.startsWith('data:')) {
      let extractedName = imageObj?.fileName;

      if (!extractedName || extractedName.includes('data:image') || extractedName.includes('base64')) {
        const timestamp = Date.now();
        return `base64_recovered_${timestamp}.jpg`;
      }

      return extractedName;
    } else {
      return this.normaliseFileName(imageSrc);
    }
  }

  // getImageFileName(alt?: string, relativePath?: string) {
  //   console.log('getImageFileName().');
  //   let imageName: string = '';

  //   if (relativePath && relativePath.trim() !== '') {
  //     // If a relative path is provided, use it.
  //     const pathParts = relativePath.split(/[/\\]/); // This will extract the file name from the path.
  //     const fileName = pathParts[pathParts.length - 1];
  //     imageName = fileName.replace(/[^a-zA-Z0-9_\-\.]/g, ' ');

  //     if (imageName.length < 3) {
  //       imageName = `image_rel_${Date.now()}_${imageName}`;
  //     }
  //   } else if (alt && alt.trim() !== '') {
  //     imageName = alt.replace(/[^a-zA-Z0-9_\-\.]/g, ' ');

  //     if (imageName.length < 3) {
  //       imageName = `image_alt_${Date.now()}_${imageName}`;
  //     }
  //   } else {
  //     // If both alt and relativePath are empty, generate a random name.
  //     const randomString = Math.random().toString(36).substring(2, 8);

  //     imageName = `image_random_${Date.now()}_${randomString}`; // Incase both the alt and relativePath are empty.
  //   }

  //   console.log('getImageFileName()_imageName: ', imageName);
  //   return imageName;
  // }

  // generateBase64ImageName(img: ImageType, name?: string): ImageType {
  //   console.log('generateBase64ImageName().');

  //   if (img.src.startsWith('data:')) {
  //     console.log('generateBase64ImageName()_Base64 image.');

  //     let cleanName = name;
  //     if (name?.includes('data:image') || name?.includes('base64') || !name) {
  //       const timestamp = Date.now();
  //       cleanName = `base64_${timestamp}.jpg`;
  //       console.warn('generateBase64ImageName()_Using fallback name:', cleanName);
  //     }

  //     console.log('generateBase64ImageName()_final name:', cleanName);

  //     return {
  //       src: img.src,
  //       fileName: cleanName,
  //     };
  //   }
  //   return img;
  // }
}
