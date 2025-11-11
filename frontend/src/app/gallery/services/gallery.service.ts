import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { selectSelectedSrcs } from '../../shared/state/shared.selector';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  store = inject(Store);

  selectedSrcs$ = this.store.select(selectSelectedSrcs);

  constructor() {
    console.log('GalleryService INIT.');
  }

  get galleryHighlightSrcs() {
    return this.selectedSrcs$;
  }
}
