import { Component, inject, OnInit } from '@angular/core';
import { GalleryService } from './gallery.service';
import { CommonModule } from '@angular/common';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})

export class GalleryComponent implements OnInit {
  private galleryService = inject(GalleryService);
  firestore = inject(Firestore);

  allImages = this.galleryService.allImages;
  galleryHighlightSrcs = this.galleryService.galleryHighlightSrcs;
  notDeletedImagesArray = this.galleryService.notDeletedImagesArray;
  imagesLength = this.galleryService.imagesLength;

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

    const imageCollectionReference = collection(this.firestore, 'images'); // This will create a reference to the images collection in the firestore database. This can be seen in the firebase console (website).
    addDoc(imageCollectionReference, { // This will add a new document to the images collection in the firestore database. Google Firebase will automatically generate a unique ID for the document.
      images: filteredSrcs
    });
  }


}
