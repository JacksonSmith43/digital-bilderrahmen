import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class DragDropUploadService {
    images = signal<string[]>([]);

    addImage(url: string) {
        this.images.update(imgs => [...imgs, url]);
    }

    getImages() {
        return this.images;
    }

}