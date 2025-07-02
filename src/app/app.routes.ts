import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { GalleryComponent } from './gallery/gallery.component';

export const routes: Routes = [
    { path: "", component: AppComponent },
    { path: "gallery", component: GalleryComponent }
];
