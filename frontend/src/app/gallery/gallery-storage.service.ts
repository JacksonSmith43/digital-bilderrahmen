import { inject, Injectable } from '@angular/core';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class GalleryStorageService {
  firestore = inject(Firestore);

  uploadImages(filteredSrcs: string[]) {

    const imagesDocumentRef = doc(this.firestore, "images", this.createsSlug()); // Will create a new document called "images-<randomNumber>" in the "images" collection. 
    setDoc(imagesDocumentRef, {
      images: filteredSrcs
    });

  }

  createsSlug() {
    console.log("createsSlug().");

    //const slug = filteredSrc.map((src: string) => src.toLowerCase().replace(/\s+/g, '-'));
    const randomNumber = Math.floor(Math.random() * 1000);
    return `images-${randomNumber}`;
  }

}