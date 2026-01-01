import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  isAddImage = false;
  selectedView: 'viewPictures' | 'viewDragDrop' | 'deviceSettings' = 'viewPictures';

  getSelectedViewLabel() {
    switch (this.selectedView) {
      case 'viewPictures':
        return 'View Pictures';

      case 'viewDragDrop':
        return 'View Drag Drop';

      case 'deviceSettings':
        return 'View Device Settings';

      default:
        return 'View';
    }
  }

  getPictureView() {
    this.selectedView = 'viewPictures';
  }

  getDragDropView() {
    this.selectedView = 'viewDragDrop';
  }

  getDeviceSettingsView() {
    this.selectedView = 'deviceSettings';
  }
}
