import { AfterViewInit, Component, inject } from '@angular/core';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { NgxFileDropModule } from 'ngx-file-drop';
import { CommonModule } from '@angular/common';

import { DragDropUploadService } from './drag-drop-upload.service';
import { NavbarService } from '../navbar/navbar.service';

@Component({
  selector: 'app-drag-drop-upload',
  imports: [NgxFileDropModule, CommonModule],
  templateUrl: './drag-drop-upload.component.html',
  styleUrl: './drag-drop-upload.component.css'
})

export class DragDropUploadComponent implements AfterViewInit {

  private navService = inject(NavbarService);
  private dragDropUploadService = inject(DragDropUploadService);
  imageUrls = this.dragDropUploadService.images;
  files = this.dragDropUploadService.files;

  private openFileSelectorFn?: () => void; // Stores a function that opens the file selector dialog (provided by ngx-file-drop). 

  setOpenFileSelector(fn: () => void) { // This method is called (from the template) to save the file selector function for later use. 
    this.openFileSelectorFn = fn; // The value of the function is saved in the openFileSelectorFn variable. 
  }

  ngAfterViewInit() {
    if (this.navService.isAddImage && this.openFileSelectorFn) {
      this.openFileSelectorFn();
      this.navService.isAddImage = false;
    }
  }


  public dropped(files: NgxFileDropEntry[]) {
    this.dragDropUploadService.getDropped(files);
  }

  public fileOver(event: any) {
    console.log("fileOver: ", event);
  }

  public fileLeave(event: any) {
    console.log("fileLeave: ", event);
  }

}
