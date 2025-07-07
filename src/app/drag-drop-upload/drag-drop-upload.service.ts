import { Injectable, signal } from "@angular/core";
import { NgxFileDropEntry } from "ngx-file-drop";

@Injectable({ providedIn: "root" })
export class DragDropUploadService {
    images = signal<{ src: string, alt: string, relativePath: string }[]>([]);
    files = signal<NgxFileDropEntry[]>([]);


    addImage(image: { src: string, alt: string, relativePath: string }) {
        this.images.update(imgs => [...imgs, image]);
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
                    console.log("droppedFile.relativePath, file: ", droppedFile.relativePath, file);
                });
            } else {
                // It was a directory (empty directories are added, otherwise only files)
                const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
                console.log("droppedFile.relativePath, fileEntry: ", droppedFile.relativePath, fileEntry);
            }
        }
    }

    getHandleFile(file: File, relativePath: string) {
        const reader = new FileReader(); // This is used to read the file as a data URL. 
        reader.onload = (e: any) => { // This event is triggered when the file is read successfully. 
            this.addImage({
                src: e.target.result,
                alt: "",
                relativePath
            });
        };
        reader.readAsDataURL(file); // This reads the file as a data URL, which is suitable for displaying images in the browser. 
    }

}