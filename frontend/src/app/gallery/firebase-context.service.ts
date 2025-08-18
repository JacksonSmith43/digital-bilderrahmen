import { Injectable, NgZone, inject } from '@angular/core';
import { deleteObject, getDownloadURL, listAll, ListResult, ref, Storage, StorageReference, uploadBytes, uploadBytesResumable, UploadResult, UploadTask } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseContextService { // This is here to (allegedly) avoid the problem: Firebase API called outside injection context. 
  private firebaseStorage = inject(Storage);
  private zone = inject(NgZone);

  getReference(path: string): StorageReference {
    return ref(this.firebaseStorage, path);
  }

  async getDownloadURL(reference: StorageReference): Promise<string> {
    return this.zone.run(() => getDownloadURL(reference));
  }

  async listAll(reference: StorageReference): Promise<ListResult> {
    return this.zone.run(() => listAll(reference));
  }

  async deleteObject(reference: StorageReference): Promise<void> {
    return this.zone.run(() => deleteObject(reference));
  }

  uploadBytes(reference: StorageReference, data: Blob): Promise<UploadResult> {
    return this.zone.run(() => uploadBytes(reference, data));
  }

  uploadBytesResumable(reference: StorageReference, data: Blob): UploadTask {
    return this.zone.run(() => uploadBytesResumable(reference, data));
  }

}
