import { Injectable, signal, inject, computed } from "@angular/core";
import { DragDropUploadService } from "../drag-drop-upload/drag-drop-upload.service";

@Injectable({ providedIn: "root" })
export class GalleryService {
    constructor() {
        console.log("GalleryService INIT.");
    }

    private dragDropUploadService = inject(DragDropUploadService);
    public galleryHighlightIndices = signal<number[]>([]);
    public deviceSelectedIndices = signal<number[]>([]);
    public deletedIndices = signal<number[]>([]);

    private savedDeletions: number[] = (() => {
        const item = localStorage.getItem("deletedImagesIndices");
        return item ? JSON.parse(item) : [];
    })();

    addedImages = this.dragDropUploadService.images;

    images = signal([
        { src: "assets/assassins-creed.jpg", alt: "Assassin´s-creed logo.", relativePath: "" },
        { src: "assets/car.jpg", alt: "Cool looking car.", relativePath: "" },
        { src: "assets/guinea-pig.jpg", alt: "A Guinea Pig lifting weights.", relativePath: "" },
        { src: "assets/hamsterviel.bmp", alt: "Hamsterviel laughing evily.", relativePath: "" },
        { src: "assets/snowman.JPG", alt: "A person standing behind a devil looking snowman.", relativePath: "" },
    ]);


    allImages = computed(() => [
        ...this.images(), ...this.addedImages() // Combines the images from both sources. 
    ]);

    getRemoveImage() {
        console.log("getRemoveImage().");
        const getDeletedImagesIndices = localStorage.getItem("deletedImagesIndices");
        const galleryLength = this.images().length;
        const indicesDescendingOrder = [...this.galleryHighlightIndices()].sort((a, b) => b - a); // This sorts the indices in descending order so that when we remove images, we do not mess up the indices of the remaining images.
        let appendedDeletedIndices: number[] = [];

        console.log("getRemoveImage()_indicesDescendingOrder: ", indicesDescendingOrder);

        if (getDeletedImagesIndices) {
            const deletedIndicesArr = JSON.parse(getDeletedImagesIndices);
            this.deletedIndices.set(deletedIndicesArr);

            appendedDeletedIndices = [
                ...deletedIndicesArr,
                ...indicesDescendingOrder.filter((idx: any) => !deletedIndicesArr.includes(idx)) // This filters out the indices that are already in the deletedIndices array and appends them to the appendedDeletedIndices array.
            ];

            localStorage.setItem("deletedImagesIndices", JSON.stringify(appendedDeletedIndices));

        } else {
            appendedDeletedIndices = [...indicesDescendingOrder];
            localStorage.setItem("deletedImagesIndices", JSON.stringify(indicesDescendingOrder));
        }

        for (let i of indicesDescendingOrder) {
            if (i < galleryLength) { // Removes the hardcoded images. // 3 < 5 = Removes the image at the 3 index, so Hamsterviel. 

                this.images.update((imageArray) => {
                    imageArray.splice(i, 1);
                    return [...imageArray];

                })

            } else { // Removes the uploaded images. 
                const uploadIndex = i - galleryLength; // 3 - 5.  

                this.addedImages.update((imageArray) => {
                    imageArray.splice(uploadIndex, 1);
                    return [...imageArray];
                })
            }
        }

        this.saveDeletions(appendedDeletedIndices);
        this.galleryHighlightIndices.set([]); // This resets the selected images after deletion.
    }

    saveDeletions(indicesDescendingOrder: number[]) {
        console.log("saveDeletions().");

        const uniqueDeletions = [...new Set([...this.savedDeletions, ...indicesDescendingOrder])]; // ...new Set is generally used to remove duplicates from an array. The values from indicesDescendingOrder are added to the savedDeletions array and then the unique values are extracted.
        this.savedDeletions = uniqueDeletions;

        localStorage.setItem("deletedImagesIndices", JSON.stringify(this.savedDeletions));
        console.log("saveDeletions()_this.deletedIndices(): ", this.deletedIndices());
    }

    getSavedDeletions(): number[] {
        return this.savedDeletions;
    }

    getHighlightImageSelection(index: number) {
        console.log("getHighlightImageSelection().");
        const selectedImagesIndicesArray = this.galleryHighlightIndices();

        if (selectedImagesIndicesArray.includes(index)) { // Checks if the image is already selected.
            this.galleryHighlightIndices.set(selectedImagesIndicesArray.filter(i => i !== index)); // Removes the image from the selection if it is already selected. i => i !== index is a filter function that returns all elements that are not equal to the index of the clicked image.

        } else { // Adds the image to the selection if it has not already been selected. 
            this.galleryHighlightIndices.set([...selectedImagesIndicesArray, index]);
        }
        console.log("getHighlightImageSelection()_this.galleryHighlightIndices(): ", this.galleryHighlightIndices());
    }

    getSelectForDevice() {
        console.log("getSelectForDevice().");

        const deviceSelectedIndicesArray = this.galleryHighlightIndices();
        const deviceSelectedIndices = [...deviceSelectedIndicesArray];

        console.log("getSelectForDevice()_this.galleryHighlightIndices: ", this.galleryHighlightIndices);
        console.log("getSelectForDevice()_deviceSelectedIndicesArray: ", deviceSelectedIndicesArray);
        console.log("getSelectForDevice()_deviceSelectedIndices: ", deviceSelectedIndices);

        return deviceSelectedIndices;
    }

    setGallerySelectedIndices(indices: number[]) {
        console.log("setGallerySelectedIndices().");

        this.galleryHighlightIndices.set(indices);
        localStorage.setItem("chosenImagesGalleryIndices", JSON.stringify(this.galleryHighlightIndices()));

        console.log("setGallerySelectedIndices()_this.galleryHighlightIndices(): ", this.galleryHighlightIndices());
        console.log("setGallerySelectedIndices()_indices: ", indices);
    }


    getDeviceSettingsIndices(): number[] {
        console.log("getDeviceSettingsIndices().");

        const saved = localStorage.getItem("chosenImagesDeviceIndices");
        return saved ? JSON.parse(saved) : []; // JSON.parse is used to convert the string to an array.
    }

} 