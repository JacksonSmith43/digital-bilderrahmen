import { inject, Injectable, signal } from "@angular/core";
import { NgxFileDropEntry } from "ngx-file-drop";
import { SharedGalleryService } from "../gallery/shared-gallery.service";

@Injectable({ providedIn: "root" })
export class DragDropUploadService {
    sharedGalleryService = inject(SharedGalleryService);
    files = signal<NgxFileDropEntry[]>([]);
    images = this.sharedGalleryService.images;

    constructor() {
        console.log("DragDropUploadService INIT.");

        const savedImages = this.sharedGalleryService.getImages('addedImages');

        if (savedImages.length > 0) {
            this.images.set(savedImages);
        }
    }


    addImage(image: { src: string, alt: string, relativePath: string }) {
        console.log("addImage().");

        this.images.update(imgs => { // This updates the images array.
            const currentImgs = Array.isArray(imgs) ? imgs : []; // This makes sure that imgs is an array.
            return [...currentImgs, image];
        });
        this.sharedGalleryService.saveToLocalStorage("addedImages", this.images());
    }

    removeGalleryImages(srcsToRemove: string[]) {
        console.log("removeGalleryImages().");
        console.log("removeGalleryImages()_srcsToRemove: ", srcsToRemove);

        const updatedImages = this.sharedGalleryService.removeImages("addedImages", srcsToRemove);
        this.images.set(updatedImages);

        this.sharedGalleryService.syncImageStores();
        // localStorage.setItem("addedImages", JSON.stringify(updatedImages));
        console.log("removeGalleryImages()_updatedImages: ", updatedImages);
        return updatedImages;
    }

    getDropped(files: NgxFileDropEntry[]) {
        console.log("getDropped().");

        this.files.set(files);
        for (const droppedFile of files) {

            // Is it a file?
            if (droppedFile.fileEntry.isFile) {
                const fileEntry = droppedFile.fileEntry as FileSystemFileEntry; // Casts the fileEntry to FileSystemFileEntry to access file methods. 
                fileEntry.file((file: File) => {
                    this.getHandleFile(file, droppedFile.relativePath);
                    // Here you can access the real file
                    console.log("getDropped()_droppedFile.relativePath, file: ", droppedFile.relativePath, file);
                });

            } else {
                // It was a directory (empty directories are added, otherwise only files)
                const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
                console.log("getDropped()_droppedFile.relativePath, fileEntry: ", droppedFile.relativePath, fileEntry);
            }
        }
        this.sharedGalleryService.saveToLocalStorage("addedImages", this.files());
    }

    getHandleFile(file: File, relativePath: string) {
        console.log("getHandleFile().");

        const reader = new FileReader(); // This is used to read the file as a data URL. 
        reader.onload = (e: any) => { // This event is triggered when the file is read successfully. 
            this.addImage({ // This adds the image to the images array. 
                src: e.target.result,
                alt: "",
                relativePath
            });
        };
        reader.readAsDataURL(file); // This reads the file as a data URL, which is suitable for displaying images in the browser. 
    }

}