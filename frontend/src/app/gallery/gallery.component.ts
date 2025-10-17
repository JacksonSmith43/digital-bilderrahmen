import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GalleryService } from './gallery.service';
import { GalleryStorageService } from '../gallery/gallery-storage.service';
import { DragDropUploadService } from '../drag-drop-upload/drag-drop-upload.service';
import { AuthService } from '../auth/auth.service';
import { SharedGalleryService } from './shared-gallery.service';
import { ImageType } from './gallery-model';
import { ImageHashService } from '../shared/image-hash.service';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private galleryStorageService = inject(GalleryStorageService);
  dragDropUploadService = inject(DragDropUploadService);
  authService = inject(AuthService);
  sharedGalleryService = inject(SharedGalleryService);
  private imageHashService = inject(ImageHashService);

  isImageLoaded = signal<boolean>(false);

  galleryHighlightSrcs = this.galleryService.galleryHighlightSrcs;
  action = this.sharedGalleryService.action;
  galleryImages = this.sharedGalleryService.galleryImages;
  galleryImageLength = this.sharedGalleryService.galleryImageLength;
  private cachedImages: any[] | null = null;

  async ngOnInit() {
    console.log('GalleryComponent INIT.');
    await this.loadImages();
    this.galleryHighlightSrcs.set([]);
  }

  async getGalleryImages(): Promise<ImageType[]> {
    //console.log("getGalleryImages().");

    try {
      if (this.cachedImages) {
        const isValid = this.cachedImages.every(
          (img) => img.alt && !img.alt.includes('data:image')
        );

        if (isValid) {
          console.log('getGalleryImages()_Using valid cache.');
          return this.cachedImages;
        } else {
          console.warn('getGalleryImages()_Cache corrupted, clearing.');
          this.cachedImages = null;
        }
      }

      const addedImagesSignal =
        this.sharedGalleryService.getImages('addedImages');
      const addedImages = addedImagesSignal;
      const storageImages = this.galleryImages();
      const cachedImagesJson = localStorage.getItem('galleryImages');

      let allImages: any[] = [];

      const rawCachedImages = this.sharedGalleryService.checkCachedImages(
        cachedImagesJson,
        addedImages,
        storageImages,
        allImages
      );
      console.log('getGalleryImages()_rawCachedImages: ', rawCachedImages);

      let removedDuplicates = await this.removeDuplicatesThroughHash(
        rawCachedImages
      );
      console.log('getGalleryImages()_removedDuplicates', removedDuplicates);

      const generateBase64ImageName: ImageType[] = (
        removedDuplicates || []
      ).map((img: ImageType) =>
        this.generateBase64ImageName(img, img.relativePath)
      );
      console.log(
        'getGalleryImages()_generateBase64ImageName',
        generateBase64ImageName
      );

      localStorage.setItem(
        'galleryImages',
        JSON.stringify(generateBase64ImageName)
      );

      this.cachedImages = generateBase64ImageName;

      return generateBase64ImageName;
    } catch (error) {
      console.error('getGalleryImages()_Error: ', error);
      return [];
    }
  }

  private generateBase64ImageName(img: ImageType, name: string): ImageType {
    console.log('generateBase64ImageName().');

    if (img.src.startsWith('data:')) {
      console.log('generateBase64ImageName()_Base64 image.');

      let cleanName = name;
      if (name?.includes('data:image') || name?.includes('base64') || !name) {
        const timestamp = Date.now();
        cleanName = `base64_${timestamp}.jpg`;
        console.warn(
          'generateBase64ImageName()_Using fallback name:',
          cleanName
        );
      }

      console.log('generateBase64ImageName()_final name:', cleanName);

      return {
        src: img.src,
        alt: cleanName,
        relativePath: cleanName,
      };
    }
    return img;
  }

  onHighlightImageSelection(src: string) {
    console.log('onHighlightImageSelection().');
    this.sharedGalleryService.getHighlightImageSelection(src);
  }

  async loadImages() {
    console.log('loadImages().');

    try {
      if (!this.action()) {
        this.action.set('uploadAllImages');
      }

      await this.sharedGalleryService.fetchAndDisplayImages();

      this.cachedImages = null;

      const images = await this.getGalleryImages();
      this.galleryImages.set(images);
      console.log('loadImages()_images: ', images);

      if (images.length === 0) {
        const storageImages = this.galleryImages();
        console.log('loadImages()_direct storage images:', storageImages);

        if (storageImages.length > 0) {
          this.galleryImages.set(storageImages);
          this.galleryImageLength.set(storageImages.length);
        }
      } else {
        this.galleryImages.set(images);
        this.galleryImageLength.set(images.length);
      }

      console.log(
        'loadImages()_galleryImagesLength: ',
        this.galleryImageLength()
      );
      this.isImageLoaded.set(true);
    } catch (error) {
      console.error('loadImages()_Error: ', error);
    }
  }

  async onRemoveImage() {
    console.log('onRemoveImage()_GalleryComponent.');

    const srcsToDelete = this.galleryHighlightSrcs();

    let isDeviceSettings: boolean = false;
    const localImages: { src: string; name: string; imageObj?: ImageType }[] =
      [];
    const firebaseImages: {
      src: string;
      name: string;
      imageObj?: ImageType;
    }[] = [];

    if (srcsToDelete.length === 0) {
      console.log('onRemoveImage()_No image has been selected for deletion.');
      return;
    }

    for (let image of srcsToDelete) {
      console.log('onRemoveImage()_Processing image:', image);
      console.log('onRemoveImage()_srcsToDelete', srcsToDelete);

      let imageName: string;
      let imageObj: ImageType | undefined;

      try {
        if (image.startsWith('data:')) {
          imageObj = this.galleryImages().find((img) => img.src === image);
          imageName =
            imageObj?.relativePath ??
            this.sharedGalleryService.normaliseFileName(image);
          console.log('onRemoveImage()_imageObj: ', imageObj);
        } else {
          imageName = this.sharedGalleryService.normaliseFileName(image);
        }

        console.log('onRemoveImage()_imageName', imageName);
        const status = await this.galleryStorageService.checkExistenceOfImage(
          imageName
        );

        console.log(`onRemoveImage()_Image: ${imageName}, Status: ${status}`);

        switch (status) {
          case 'FIREBASE':
            console.log(`onRemoveImage()_Firebase image: ${imageName}`);
            firebaseImages.push({ src: image, name: imageName, imageObj });

            break;

          case 'LOCAL':
            console.log('onRemoveImage()_Local Base64 image.');
            localImages.push({ src: image, name: imageName, imageObj });
            break;

          case 'BOTH':
            firebaseImages.push({ src: image, name: imageName, imageObj });
            localImages.push({ src: image, name: imageName, imageObj });
            break;

          default:
            console.warn(
              'onRemoveImage()_None of the above options are valid.'
            );
            break;
        }
      } catch (error) {
        console.error('onRemoveImage()_Error checking image existence:', error);
      }
    }

    let localImagesMaped: ImageType[] = localImages.map((image) => {
      let processedSrc: string;

      if (image.src.includes('data:')) {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 6);
        processedSrc = `LOCAL_BASE64_${timestamp}_${randomId}`;
      } else {
        processedSrc = image.src;
      }

      return {
        src: processedSrc,
        alt: image.name,
        relativePath: image.name,
      };
    });

    let firebaseImagesMaped: ImageType[] = firebaseImages.map((image) => {
      return {
        src: image.src,
        alt: image.name,
        relativePath: image.name,
      };
    });

    let allRemovedImagesMaped = [...localImagesMaped, ...firebaseImagesMaped];
    let allRemovedImages = allRemovedImagesMaped.map((img) => img.alt);
    console.log('onRemoveImage()_allRemovedImages: ', allRemovedImages);
    console.log(
      'onRemoveImage()_allRemovedImagesMaped: ',
      allRemovedImagesMaped
    );

    await this.sharedGalleryService.savingSizeCheck(
      'deletedSrcArr',
      allRemovedImages,
      allRemovedImagesMaped
    );

    const localImageSrcs = localImages.map((img) => img.src);
    const firebaseImageSrcs = firebaseImages.map((img) => img.src);

    console.log(
      'onRemoveImage()_localImageSrcs.length: ',
      localImageSrcs.length
    );
    console.log(
      'onRemoveImage()_firebaseImageSrcs.length: ',
      firebaseImageSrcs.length
    );

    if (localImageSrcs.length > 0) {
      // Removes local images.
      this.dragDropUploadService.removeGalleryImages(localImageSrcs);
      console.log(
        `onRemoveImage()_${localImageSrcs.length} local images have been removed.`
      );
    }

    if (firebaseImageSrcs.length > 0) {
      await this.galleryStorageService.deleteImageFromFirebase(
        firebaseImageSrcs,
        isDeviceSettings
      );
      console.log(
        `onRemoveImage()_${firebaseImageSrcs.length} firebase images have been removed.`
      );

      console.log('onRemoveImage()_firebaseImageSrcs: ', firebaseImageSrcs);
      console.log(
        'onRemoveImage()_this.sharedGalleryService.deviceImages(): ',
        this.sharedGalleryService.deviceImages()
      );

      if (
        firebaseImageSrcs.some((img) =>
          this.sharedGalleryService
            .deviceImages()
            .map((deviceImg) => deviceImg.src)
            .includes(img)
        )
      ) {
        // If any of the deleted images are in the deviceImages array, they need to be removed from there too.
        isDeviceSettings = true;
        await this.galleryStorageService.deleteImageFromFirebase(
          firebaseImageSrcs,
          isDeviceSettings
        );
      }
    }

    this.cachedImages = null;
    await this.sharedGalleryService.syncAllImageStores();

    const remainingImages = await this.getGalleryImages();
    this.galleryImages.set(remainingImages);
    this.galleryImageLength.set(remainingImages.length);

    let matchingImages = await this.imageHashService.findMatchingImages(
      this.galleryImages(),
      this.sharedGalleryService.deviceImages()
    );
    let deviceImagesToDelete = this.sharedGalleryService
      .deviceImages()
      .filter((img) => !matchingImages.includes(img)); // Only keeps images that are not in the matchingImages array, so images that have been deleted from the gallery.

    this.sharedGalleryService.deviceImages.set(deviceImagesToDelete);
    this.sharedGalleryService.deviceImageLength.set(
      deviceImagesToDelete.length
    );

    console.log('onRemoveImage()_matchingImages: ', matchingImages);
    console.log('onRemoveImage()_deviceImagesToDelete: ', deviceImagesToDelete);
    console.log(
      'onRemoveImage()_remainingImages.length: ',
      remainingImages.length
    );

    localStorage.setItem('chosenImagesSrcs', JSON.stringify(matchingImages));

    this.galleryStorageService.deleteImageFromFirebase(
      deviceImagesToDelete.map((img) => img.src),
      true
    );
    this.galleryService.galleryHighlightSrcs.set([]);

    return srcsToDelete.length;
  }

  async onSelectForDevice(name: ImageType) {
    console.log('onSelectForDevice().');
    this.action.set('selectForDevice');
    let imageData: ImageType[] = [];

    const selectedUrl = this.galleryHighlightSrcs();
    console.log('onSelectForDevice()_selectedUrl', selectedUrl);

    if (selectedUrl.length === 0) {
      console.log('onSelectForDevice()_No image has been selected for upload.');
      return;
    }

    for (let url of selectedUrl) {
      try {
        if (url.startsWith('data:')) {
          const imageName = await this.galleryStorageService.handleBase64Image(
            url,
            name
          );
          console.log(
            'onSelectForDevice()_Base64 image processed for: ',
            imageName
          );
          continue;
        }

        const imageName = this.galleryStorageService.extractFileNameFromUrl(
          url,
          name
        );
        if (!imageName) {
          console.error(
            'onSelectForDevice()_Could not extract file name from URL.'
          );
          continue;
        }

        const imageExists =
          await this.galleryStorageService.checkExistenceOfImage(imageName);
        if (imageExists) {
          await this.galleryStorageService.copyImageBetweenFolders(
            'uploadedAllImages',
            'selectForDevice',
            imageName
          );
          console.log(`onSelectForDevice()_${imageName} has been copied.`);

          imageData = selectedUrl.map((url) => ({
            src: url,
            alt: this.sharedGalleryService.normaliseFileName(url),
            relativePath: this.sharedGalleryService.normaliseFileName(url),
          }));
          console.log('onSelectForDevice()_imageData: ', imageData);
        } else {
          console.log(
            `onSelectForDevice()${imageName} does not exist in source folder.`
          );
        }
      } catch (error) {
        console.error('onSelectForDevice()_error: ', error);
      }
    }
    localStorage.setItem('chosenImagesSrcs', JSON.stringify(imageData));
    this.galleryService.galleryHighlightSrcs.set([]);
  }

  async removeDuplicatesThroughHash(images: ImageType[]): Promise<ImageType[]> {
    console.log('removeDuplicatesThroughHash().');

    const seenHashes: string[] = [];
    const uniqueImages: ImageType[] = [];

    for (const img of images) {
      const blob = await this.galleryStorageService.urlToBlob(img.src);
      const hash = await this.imageHashService.getImageHash(blob);
      console.log('removeDuplicatesThroughHash()_hash: ', hash);

      if (!seenHashes.includes(hash)) {
        seenHashes.push(hash);
        uniqueImages.push(img);
        console.log('removeDuplicatesThroughHash()_img: ', img);
        console.log('removeDuplicatesThroughHash()_seenHashes: ', seenHashes);
      } else {
        // If the hash has already been seen, it is a duplicate.
        console.log('removeDuplicatesThroughHash()_Duplicate.');
        this.galleryStorageService.deleteImageFromFirebase([img.src], false);
      }
    }
    console.log('removeDuplicatesThroughHash()_uniqueImages: ', uniqueImages);
    this.galleryImages.set(uniqueImages);
    return uniqueImages;
  }

  async onUploadAllImages() {
    console.log('onUploadAllImages().');

    this.action.set('uploadAllImages');
    const images = await this.getGalleryImages();
    console.log('onUploadAllImages()_images: ', images);
    this.cachedImages = null;

    for (let img of images) {
      let uploadTasks: any[] = await this.galleryStorageService.convertToBlobs([
        img.src,
      ]);
      console.log('onUploadAllImages()_uploadTasks: ', uploadTasks);

      const imageName = this.getImageFileName(img.alt, img.relativePath);
      await this.galleryStorageService.uploadSingleImage(
        imageName,
        uploadTasks[0]
      );
    }

    this.galleryService.galleryHighlightSrcs.set([]); // Incase any images are selected.
  }

  async onFetchAllImages() {
    console.log('onFetchAllImages().');

    this.cachedImages = null;

    this.sharedGalleryService.action.set('uploadAllImages');
    console.log(
      'onFetchAllImages()_this.galleryStorageService.action(): ',
      this.galleryStorageService.action()
    );

    await this.loadImages();
    console.log('onFetchAllImages()_this.loadImages(): ', this.loadImages);
  }

  getImageFileName(alt: string, relativePath: string) {
    console.log('getImageFileName().');
    let imageName: string = '';

    if (relativePath && relativePath.trim() !== '') {
      // If a relative path is provided, use it.
      const pathParts = relativePath.split('/[/\\]/'); // This will extract the file name from the path.
      const fileName = pathParts[pathParts.length - 1];
      imageName = fileName.replace(/[^a-zA-Z0-9_\-\.]/g, ' ');

      if (imageName.length < 3) {
        imageName = `image_rel_${Date.now()}_${imageName}`;
      }
    } else if (alt && alt.trim() !== '') {
      imageName = alt.replace(/[^a-zA-Z0-9_\-\.]/g, ' ');

      if (imageName.length < 3) {
        imageName = `imgage_alt_${Date.now()}_${imageName}`;
      }
    } else {
      // If both alt and relativePath are empty, generate a random name.
      const randomString = Math.random().toString(36).substring(2, 8);

      imageName = `image_random_${Date.now()}_${randomString}`; // Incase both the alt and relativePath are empty.
    }

    console.log('getImageFileName()_imageName: ', imageName);
    return imageName;
  }

  getCurrentUser() {
    return this.authService.currentUser();
  }
}
