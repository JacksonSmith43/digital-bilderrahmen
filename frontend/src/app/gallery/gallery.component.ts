import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getDownloadURL } from '@angular/fire/storage';

import { GalleryService } from './gallery.service';
import { GalleryStorageService } from '../gallery/gallery-storage.service';
import { DragDropUploadService } from '../drag-drop-upload/drag-drop-upload.service';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})

export class GalleryComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private galleryStorageService = inject(GalleryStorageService);

  allImages = this.galleryService.allImages;
  galleryHighlightSrcs = this.galleryService.galleryHighlightSrcs;
  notDeletedImagesArray = this.galleryService.notDeletedImagesArray;
  imagesLength = this.galleryService.imagesLength;

  dragDropUploadService = inject(DragDropUploadService);
  
    files = this.dragDropUploadService.files;
    images = this.dragDropUploadService.images;

  ngOnInit() {
    this.galleryService.notDeletedImages();
  }


  onHighlightImageSelection(src: string) {
    this.galleryService.getHighlightImageSelection(src);
  }

  onRemoveImage() {
    console.log("onRemoveImage()_Deleting.");

    const srcsToDelete = this.galleryService.galleryHighlightSrcs();
    this.galleryService.getRemoveImage(srcsToDelete);

    console.log("onRemoveImage()_s", this.galleryService.notDeletedImagesArray());

    this.galleryService.galleryHighlightSrcs.set([]);
    this.galleryService.notDeletedImages();

    console.log("onRemoveImage()_a", this.galleryService.notDeletedImagesArray());
  }

  onSelectForDevice() {
    console.log("onSelectForDevice().");

    const selectedSrcs = this.galleryService.galleryHighlightSrcs();
    const existingRaw = localStorage.getItem("chosenImagesSrcs");
    const existingSrcs = existingRaw ? JSON.parse(existingRaw) : [];
    const deletedSrcs = this.galleryService.deletedSrcArr();

    const combinedSrcs = [...new Set([...existingSrcs, ...selectedSrcs])]; // This will remove duplicates from the array.
    const availableImageSrcs = this.galleryService.notDeletedImagesArray().map(img => img.src); // This will return an array of the srcs of the images that are not deleted. 
    const filteredSrcs = combinedSrcs.filter(src => !deletedSrcs.includes(src) && availableImageSrcs.includes(src)); // This will filter out the deleted images and the images that are not available.

    localStorage.setItem("chosenImagesSrcs", JSON.stringify(filteredSrcs));
    console.log("onSelectForDevice()_combinedSrcs: ", combinedSrcs);
    console.log("onSelectForDevice()_filteredSrcs: ", filteredSrcs);

    this.galleryService.galleryHighlightSrcs.set([]);

    this.galleryStorageService.uploadImageNames(filteredSrcs);
    this.selectedImage();
  }


  selectedImage() {

    const imageNames = this.images().map(img => img.relativePath); 
    const ngxFileDropEntries = this.files(); // This will return an array of the files that were dropped. 
    
    if (ngxFileDropEntries.length > 0) {
      const fileEntry = ngxFileDropEntries[0].fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        this.galleryStorageService.uploadImages(imageNames, file)
          .then((snapshot) => {
            getDownloadURL(snapshot.ref)
              .then((downloadUrl) => {
                console.log("selectedImage()_downloadUrl: ", downloadUrl);
              })
          })
      });
    }
  }

}
