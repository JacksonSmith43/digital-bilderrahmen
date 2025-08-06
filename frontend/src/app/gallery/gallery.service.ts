import { Injectable, signal, inject, computed } from "@angular/core";
import { DragDropUploadService } from "../drag-drop-upload/drag-drop-upload.service";

@Injectable({ providedIn: "root" })
export class GalleryService {

    constructor() {
        console.log("GalleryService INIT.");
    }

    private dragDropUploadService = inject(DragDropUploadService);

    galleryHighlightSrcs = signal<string[]>([]);
    public deviceSelectedIndices = signal<number[]>([]);
    deletedSrcArr = signal<string[]>([]);
    notDeletedImagesArray = signal<{ src: string; alt: string; relativePath: string; }[]>([]);
    imagesLength = signal<number>(0);

    addedImages = this.dragDropUploadService.images;


    images = signal([
        { src: "assets/assassins-creed.jpg", alt: "Assassin´s-creed logo.", relativePath: "" },
        { src: "assets/car.jpg", alt: "Cool looking car.", relativePath: "" },
        { src: "assets/guinea-pig.jpg", alt: "A Guinea Pig lifting weights.", relativePath: "" },
        { src: "assets/hamsterviel.bmp", alt: "Hamsterviel laughing evily.", relativePath: "" },
        { src: "assets/snowman.JPG", alt: "A person standing behind a devil looking snowman.", relativePath: "" },
    ]);


    allImages = computed(() => {
        const uploadedImages = this.addedImages();
        return [...this.images(), ...(Array.isArray(uploadedImages) ? uploadedImages : [])]; // This will return an array of the images that are in the images array and the uploadedImages array.
    });

    getHighlightImageSelection(src: string) {
        console.log("getHighlightImageSelection().");

        const selectedSrcs = this.galleryHighlightSrcs();

        if (selectedSrcs.includes(src)) { // Checks if the image is already selected.
            this.galleryHighlightSrcs.set(selectedSrcs.filter(i => i !== src)); // Removes the image from the selection if it is already selected. i => i !== index is a filter function that returns all elements that are not equal to the index of the clicked image.

        } else { // Adds the image to the selection if it has not already been selected. 
            this.galleryHighlightSrcs.set([...selectedSrcs, src]);
        }
        console.log("getHighlightImageSelection()_this.galleryHighlightSrcs(): ", this.galleryHighlightSrcs());
    }

} 