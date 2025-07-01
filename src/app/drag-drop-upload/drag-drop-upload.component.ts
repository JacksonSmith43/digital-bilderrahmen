import { Component } from '@angular/core';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { NgxFileDropModule } from 'ngx-file-drop';

@Component({
  selector: 'app-drag-drop-upload',
  imports: [NgxFileDropModule],
  templateUrl: './drag-drop-upload.component.html',
  styleUrl: './drag-drop-upload.component.css'
})

export class DragDropUploadComponent {

  public files: NgxFileDropEntry[] = [];
  public imageUrls: string[] = [];

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    //this.imageUrls = []; // Empties the list after each drop. 

    for (const droppedFile of files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry; // Casts the fileEntry to FileSystemFileEntry to access file methods. 
        fileEntry.file((file: File) => {

          const reader = new FileReader(); // This is used to read the file as a data URL. 
          reader.onload = (e: any) => { // This event is triggered when the file is read successfully. 
            this.imageUrls.push(e.target.result);
          };
          reader.readAsDataURL(file); // This reads the file as a data URL, which is suitable for displaying images in the browser. 

          // Here you can access the real file
          console.log("droppedFile.relativePath, file: ", droppedFile.relativePath, file);
          console.log("file: ", file);
          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/

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
