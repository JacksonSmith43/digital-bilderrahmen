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

    imagesLength = 0;
    addedImages = this.dragDropUploadService.images;

    images = signal([
        { src: "assets/assassins-creed.jpg", alt: "Assassin´s-creed logo.", relativePath: "" },
        { src: "assets/car.jpg", alt: "Cool looking car.", relativePath: "" },
        { src: "assets/guinea-pig.jpg", alt: "A Guinea Pig lifting weights.", relativePath: "" },
        { src: "assets/hamsterviel.bmp", alt: "Hamsterviel laughing evily.", relativePath: "" },
        { src: "assets/snowman.jpg", alt: "A person standing behind a devil looking snowman.", relativePath: "" },
    ]);


    allImages = computed(() => [
        ...this.images(), ...this.addedImages() // Combines the images from both sources. 
    ]);

    notDeletedImages() {
        console.log("notDeletedImages().");

        const deletedImagesSrcs = localStorage.getItem("deletedSrcArr");
        this.deletedSrcArr.set(deletedImagesSrcs ? JSON.parse(deletedImagesSrcs) : []);

        console.log("notDeletedImages()_deletedImagesSrcs", deletedImagesSrcs);
        console.log("notDeletedImages()_deletedSrcArr", this.deletedSrcArr());

        this.notDeletedImagesArray.set(this.allImages().filter(img => !this.deletedSrcArr().includes(img.src))); // If the src of the image is not in the deletedSrcArr, then it is not deleted. 
        this.imagesLength = this.notDeletedImagesArray().length;

        localStorage.setItem("deletedSrcArr", JSON.stringify(this.deletedSrcArr()));
        return this.notDeletedImagesArray();
    }

    getRemoveImage(srcsToDelete: string[]) {
        console.log("getRemoveImage().");

        console.log("getRemoveImage()_srcsToDelete: ", srcsToDelete);

        this.deletedSrcArr.set([...this.deletedSrcArr(), ...srcsToDelete]);

        for (let src of srcsToDelete) {
            console.log("getRemoveImage()_src: ", src);

            const imageIndex = this.images().findIndex(img => img.src === src); // This will loop through the images array and for each image it will check if the src of the image is the same as the src of the image that is being deleted.
            console.log("getRemoveImage()_imageIndex: ", imageIndex);

            if (imageIndex !== -1) { // Removes the hardcoded images. // 3 < 5 = Removes the image at the 3 index, so Hamsterviel. -1 = Checks if the image has been found. 

                this.images.update((imageArray) => {
                    imageArray.splice(imageIndex, 1);
                    console.log("getRemoveImage()_imageArray: ", imageArray);
                    return [...imageArray];
                })
                continue;
            }

            const uploadIndex = this.addedImages().findIndex(img => img.src === src); // 3 - 5.  
            if (uploadIndex !== -1) { // Removes the uploaded images.

                this.addedImages.update((imageArray) => {
                    imageArray.splice(uploadIndex, 1);
                    return [...imageArray];
                });
            }
        }
        console.log("getRemoveImage()_this.deletedSrcArr(): ", this.deletedSrcArr());

        localStorage.setItem("deletedSrcArr", JSON.stringify(this.deletedSrcArr()));
        this.galleryHighlightSrcs.set([]); // This resets the selected images after deletion.

    }

    getHighlightImageSelection(src: string) {
        console.log("getHighlightImageSelection().");

        const selectedSrcs = this.galleryHighlightSrcs();

        if (selectedSrcs.includes(src)) { // Checks if the image is already selected.
            this.galleryHighlightSrcs.set(selectedSrcs.filter(i => i !== src)); // Removes the image from the selection if it is already selected. i => i !== index is a filter function that returns all elements that are not equal to the index of the clicked image.

        } else { // Adds the image to the selection if it has not already been selected. 
            this.galleryHighlightSrcs.set([...selectedSrcs, src]);
        }
        console.log("getHighlightImageSelection()_this.galleryHighlightIndices(): ", this.galleryHighlightSrcs());
    }

    getSelectForDevice() {
        console.log("getSelectForDevice().");

        const deviceSelectedSrcArray = this.galleryHighlightSrcs();
        const deviceSelected = [...deviceSelectedSrcArray];

        console.log("getSelectForDevice()_this.galleryHighlightIndices: ", this.galleryHighlightSrcs);
        console.log("getSelectForDevice()_deviceSelectedSrcArray: ", deviceSelectedSrcArray);
        console.log("getSelectForDevice()_deviceSelected: ", deviceSelected);

        return deviceSelected;
    }

} 