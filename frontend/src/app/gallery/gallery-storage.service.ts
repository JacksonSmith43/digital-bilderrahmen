import { inject, Injectable } from '@angular/core';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { ref, Storage, uploadBytesResumable, UploadTask } from '@angular/fire/storage';

import { DragDropUploadService } from '../drag-drop-upload/drag-drop-upload.service';

@Injectable({
  providedIn: 'root'
})
export class GalleryStorageService {
  firestore = inject(Firestore);
  firebaseStorage = inject(Storage);

  uploadImageNames(filteredSrcs: string[]) {

    const imagesDocumentRef = doc(this.firestore, "images", this.createsSlug()); // Will create a new document called "images-<randomNumber>" in the "images" collection. 
    setDoc(imagesDocumentRef, {
      images: filteredSrcs,

    });

  }

  createsSlug() {
    console.log("createsSlug().");
    const randomNumber = Math.floor(Math.random() * 1000);
    return `images-${randomNumber}`;
  }

  uploadImages(imageName: string[], image: Blob | ArrayBuffer | Uint8Array): UploadTask {
    const storageRef = ref(this.firebaseStorage, `images/${imageName}`);
    return uploadBytesResumable(storageRef, image);
  }
  
}