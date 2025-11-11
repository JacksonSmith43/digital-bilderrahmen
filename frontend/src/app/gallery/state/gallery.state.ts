import { NgxFileDropEntry } from 'ngx-file-drop';

import { ImageType } from '../../shared/model/image-type.model';
import { CurrentActionType } from '../../shared/model/current-action.model';

export interface GalleryState {
  galleryImages: ImageType[];
  addedImages: ImageType[];
  droppedFiles: NgxFileDropEntry[];

  isImageLoaded: boolean;
  isUploading: boolean;
  isAdding: boolean;
  isSelecting: boolean;
  isRemoving: boolean;
  isDeleting: boolean;

  cachedImages: ImageType[] | null;
}

export const initialGalleryState: GalleryState = {
  galleryImages: [],
  addedImages: [],
  droppedFiles: [],

  isImageLoaded: false,
  isUploading: false,
  isAdding: false,
  isSelecting: false,
  isRemoving: false,
  isDeleting: false,

  cachedImages: null,
};
