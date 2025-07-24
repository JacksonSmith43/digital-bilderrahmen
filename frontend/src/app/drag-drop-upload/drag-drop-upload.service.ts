import { Injectable, signal } from "@angular/core";
import { NgxFileDropEntry } from "ngx-file-drop";

@Injectable({ providedIn: "root" })
export class DragDropUploadService {
    images = signal<{ src: string, alt: string, relativePath: string }[]>([]);
    files = signal<NgxFileDropEntry[]>([]);

    constructor() {
        console.log("DragDropUploadService INIT.");

        const savedImages = localStorage.getItem("addedImages");

        if (savedImages) {
            this.images.set(JSON.parse(savedImages));
        }
    }


    addImage(image: { src: string, alt: string, relativePath: string }) {

        this.images.update(imgs => { // This updates the images array.
            const currentImgs = Array.isArray(imgs) ? imgs : []; // This makes sure that imgs is an array.
            return [...currentImgs, image];
        });
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        localStorage.setItem("addedImages", JSON.stringify(this.images()));
    }

    getImages() {
        return this.images;
    }


    getDropped(files: NgxFileDropEntry[]) {
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
        this.saveToLocalStorage();
    }

    getHandleFile(file: File, relativePath: string) {
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