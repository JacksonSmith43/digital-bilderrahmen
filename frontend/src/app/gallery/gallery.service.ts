import { Injectable, inject, signal } from "@angular/core";

import { SharedGalleryService } from "./shared-gallery.service";

@Injectable({ providedIn: "root" })
export class GalleryService {
    private sharedGalleryService = inject(SharedGalleryService);

    constructor() {
        console.log("GalleryService INIT.");
    }

    get galleryHighlightSrcs() {
        return this.sharedGalleryService.galleryHighlightSrcs;
    }

} 