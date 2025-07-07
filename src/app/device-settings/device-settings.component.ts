import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GalleryService } from '../gallery/gallery.service';

@Component({
  selector: 'app-device-settings',
  imports: [RouterModule],
  templateUrl: './device-settings.component.html',
  styleUrl: './device-settings.component.css'
})

export class DeviceSettingsComponent {
  private galleryService = inject(GalleryService);

  getChosenImages() {
    return this.galleryService.allImages();
  }
}
