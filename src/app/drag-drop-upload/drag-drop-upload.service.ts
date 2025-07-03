import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class DragDropUploadService {
    images = signal<{ src: string, alt: string, relativePath: string }[]>([]);

    addImage(image: { src: string, alt: string, relativePath: string }) {
        this.images.update(imgs => [...imgs, image]);
    }

    getImages() {
        return this.images;
    }

}