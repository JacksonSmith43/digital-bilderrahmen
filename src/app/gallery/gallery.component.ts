import { Component, inject, input } from '@angular/core';
import { GalleryService } from './gallery.service';

@Component({
  selector: 'app-gallery',
  imports: [],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})

export class GalleryComponent {
  private galleryService = inject(GalleryService);
  images = input(this.galleryService.images);

  gallery() {
    return this.galleryService.images;
  }

}
