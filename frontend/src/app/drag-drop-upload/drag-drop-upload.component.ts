import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { NgxFileDropModule } from 'ngx-file-drop';
import { CommonModule } from '@angular/common';

import { DragDropUploadService } from './drag-drop-upload.service';
import { NavbarService } from '../navbar/navbar.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-drag-drop-upload',
  imports: [NgxFileDropModule, CommonModule],
  templateUrl: './drag-drop-upload.component.html',
  styleUrl: './drag-drop-upload.component.css'
})

export class DragDropUploadComponent implements AfterViewInit, OnInit {

  navService = inject(NavbarService);
  dragDropUploadService = inject(DragDropUploadService);
  authService = inject(AuthService);

  imageUrls = this.dragDropUploadService.images;
  files = this.dragDropUploadService.files;

  private openFileSelectorFn?: () => void; // Stores a function that opens the file selector dialog (provided by ngx-file-drop). 

  setOpenFileSelector(fn: () => void) { // This method is called (from the template) to save the file selector function for later use. 
    this.openFileSelectorFn = fn; // The value of the function is saved in the openFileSelectorFn variable. 
  }


  ngOnInit(): void {
    this.files.set([]);
  }

  ngAfterViewInit() {
    console.log("DragDropUploadComponent_ngAfterViewInit().");

    if (this.navService.isAddImage && this.openFileSelectorFn) {
      this.openFileSelectorFn();
      this.navService.isAddImage = false;
    }
  }


  public dropped(files: NgxFileDropEntry[]) {
    console.log("dropped: ", files);
    this.dragDropUploadService.getDropped(files);
  }

  public fileOver(event: any) {
    console.log("fileOver: ", event);
  }

  public fileLeave(event: any) {
    console.log("fileLeave: ", event);
  }

}
