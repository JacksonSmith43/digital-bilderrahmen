import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { NgxFileDropModule } from 'ngx-file-drop';
import { CommonModule } from '@angular/common';

import { DragDropUploadService } from './service/drag-drop-upload.service';
import { NavbarService } from '../navbar/navbar.service';
import { AuthService } from '../auth/auth.service';
import { FileNameService } from '../shared/services/file-name.service';
import { ImageType } from '../shared/model/image-type.model';

@Component({
  selector: 'app-drag-drop-upload',
  imports: [NgxFileDropModule, CommonModule],
  templateUrl: './drag-drop-upload.component.html',
  styleUrl: './drag-drop-upload.component.css',
})
export class DragDropUploadComponent implements AfterViewInit, OnInit {
  navService = inject(NavbarService);
  dragDropUploadService = inject(DragDropUploadService);
  authService = inject(AuthService);
  private fileNameService = inject(FileNameService);

  files = this.dragDropUploadService.files;
  addedImages = this.dragDropUploadService.addedImages;

  private openFileSelectorFn?: () => void; // Stores a function that opens the file selector dialog (provided by ngx-file-drop).

  // This method is called (from the template) to save the file selector function for later use.
  setOpenFileSelector(fn: () => void) {
    this.openFileSelectorFn = fn; // The value of the function is saved in the openFileSelectorFn variable.
  }

  ngOnInit(): void {
    this.files.set([]);
  }

  ngAfterViewInit() {
    console.log('DragDropUploadComponent_ngAfterViewInit().');

    if (this.navService.isAddImage && this.openFileSelectorFn) {
      this.openFileSelectorFn();
      this.navService.isAddImage = false;
    }
  }

  getImageForFile(file: NgxFileDropEntry, addedImage: ImageType[]): ImageType | undefined {
    // console.log('getImageForFile().');
    let found = addedImage.find(img => img.fileName === file.relativePath);

    // Try normalised match if it has not been found.
    if (!found && file.relativePath) {
      const normalisedFile = this.fileNameService.normaliseFileName(file.relativePath);

      found = addedImage.find(img => {
        const normalisedImgPath = img.fileName ? this.fileNameService.normaliseFileName(img.fileName) : null;
        console.log('getImageForFile()_Not found.');
        return normalisedImgPath === normalisedFile;
      });
    }

    return found; // Returns the found image or undefined if not found.
  }

  public dropped(files: NgxFileDropEntry[]) {
    console.log('dropped: ', files);
    this.navService.isAddImage = true;
    this.dragDropUploadService.getDropped(files);
    console.log('dropped()_this.addedImages()', this.addedImages());
  }

  public fileOver(event: any) {
    console.log('fileOver: ', event);
  }

  public fileLeave(event: any) {
    console.log('fileLeave: ', event);
  }
}
