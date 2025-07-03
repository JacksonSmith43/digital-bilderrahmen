import { AfterViewInit, Component, inject } from '@angular/core';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { NgxFileDropModule } from 'ngx-file-drop';
import { CommonModule } from '@angular/common';

import { DragDropUploadService } from './drag-drop-upload.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-drag-drop-upload',
  imports: [NgxFileDropModule, CommonModule],
  templateUrl: './drag-drop-upload.component.html',
  styleUrl: './drag-drop-upload.component.css'
})

export class DragDropUploadComponent implements AfterViewInit {

  public files: NgxFileDropEntry[] = [];
  private dragDropUploadService = inject(DragDropUploadService);
  private appService = inject(AppService);
  imageUrls = this.dragDropUploadService.images;

  private openFileSelectorFn?: () => void; // Stores a function that opens the file selector dialog (provided by ngx-file-drop). 


  setOpenFileSelector(fn: () => void) { // This method is called (from the template) to save the file selector function for later use. 
    this.openFileSelectorFn = fn; // The value of the function is saved in the openFileSelectorFn variable. 
  }

  ngAfterViewInit() {
    if (this.appService.isAddImage && this.openFileSelectorFn) {
      this.openFileSelectorFn();
      this.appService.isAddImage = false;
    }
  }

  private handleFile(file: File) {
    const reader = new FileReader(); // This is used to read the file as a data URL. 
    reader.onload = (e: any) => { // This event is triggered when the file is read successfully. 
      this.dragDropUploadService.addImage(e.target.result);
    };
    reader.readAsDataURL(file); // This reads the file as a data URL, which is suitable for displaying images in the browser. 
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry; // Casts the fileEntry to FileSystemFileEntry to access file methods. 
        fileEntry.file((file: File) => {
          this.handleFile(file);
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

  public fileOver(event: any) {
    console.log("fileOver: ", event);
  }

  public fileLeave(event: any) {
    console.log("fileLeave: ", event);
  }

}
