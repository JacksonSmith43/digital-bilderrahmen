import { createFeatureSelector, createSelector } from '@ngrx/store';

import { GalleryState } from './gallery.state';
import { CurrentActionType } from '../../shared/model/current-action.model';
import { SharedState } from '../../shared/state/shared.state';

export const selectGalleryState = createFeatureSelector<GalleryState>('Gallery');
export const selectSharedState = createFeatureSelector<SharedState>('Shared');

export const selectUpdateGalleryImages = createSelector(selectGalleryState, state => state.galleryImages || []);

export const selectAddImages = createSelector(selectGalleryState, state => state.addedImages || []);
export const selectAddDroppedFiles = createSelector(selectGalleryState, state => state.droppedFiles || []);

export const selectedImageLength = createSelector(selectGalleryState, state => state.galleryImages.length);

export const selectIsImageLoaded = createSelector(
  selectGalleryState,
  state => state.galleryImages !== null && state.galleryImages !== undefined
);

export const selectRemoveAddedImage = createSelector(selectGalleryState, state => state.isRemoving);

export const selectIsAdding = createSelector(selectGalleryState, state => state.isAdding);
export const selectIsUploading = createSelector(selectGalleryState, state => state.isUploading);
export const selectIsSelecting = createSelector(selectGalleryState, state => state.isSelecting);
export const selectIsRemoving = createSelector(selectGalleryState, state => state.isRemoving);
export const selectIsDeleting = createSelector(selectGalleryState, state => state.isDeleting);

export const selectError = createSelector(selectSharedState, state => state.error);
