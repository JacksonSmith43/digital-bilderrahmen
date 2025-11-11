import { createReducer, on } from '@ngrx/store';

import { initialGalleryState } from './gallery.state';
import { GalleryActions } from './gallery.actions';
import { CurrentActionType } from '../../shared/model/current-action.model';

export const galleryReducer = createReducer(
  initialGalleryState,

  on(GalleryActions.updateGalleryImages, (state, { images }) => ({
    ...state,
    galleryImages: images,
  })),

  on(GalleryActions.addDroppedFiles, (state, { files }) => ({
    ...state,
    droppedFiles: files,
    isAdding: true,
    currentAction: 'adding' as CurrentActionType,
    error: null,
  })),

  on(GalleryActions.addImagesSuccess, (state, { addedImages }) => ({
    ...state,
    addedImages: [...state.addedImages, ...addedImages],
    isAdding: false,
    currentAction: 'idle' as CurrentActionType,
    error: null,
  })),

  on(GalleryActions.uploadToGallery, state => ({
    ...state,
    isUploading: true,
    currentAction: 'uploading' as CurrentActionType,
    error: null,
  })),

  on(GalleryActions.uploadToGallerySuccess, (state, { uploadedImages, targetFolder }) => ({
    ...state,
    uploadedImages,
    targetFolder,
    isUploading: false,
    currentAction: 'idle' as CurrentActionType,
    error: null,
  })),

  on(GalleryActions.uploadToGalleryFailure, (state, { error }) => ({
    ...state,
    currentAction: 'idle' as CurrentActionType,
    isUploading: false,
    error,
  })),

  on(GalleryActions.deleteGalleryImages, state => ({
    ...state,
    isDeleting: true,
    currentAction: 'deleting' as CurrentActionType,
    error: null,
  })),

  on(GalleryActions.deleteGalleryImagesSuccess, (state, { deletedSrcs, remainingImages, updatedDeviceImages }) => ({
    ...state,
    selectedImageSrcs: [],
    galleryImages: remainingImages,
    deviceImages: updatedDeviceImages,
    isDeleting: false,
    currentAction: 'idle' as CurrentActionType,
    error: null,
  })),

  on(GalleryActions.deleteGalleryImagesFailure, (state, { error }) => ({
    ...state,
    isDeleting: false,
    currentAction: 'idle' as CurrentActionType,
    error,
  })),

  on(GalleryActions.removeAddedImages, (state, { srcsToRemove }) => ({
    ...state,
    isRemoving: true,
    addedImages: state.addedImages.filter(img => !srcsToRemove.includes(img.src)),
    currentAction: 'removing' as CurrentActionType,
    error: null,
  })),

  on(GalleryActions.removeAddedImagesSuccess, (state, { remainingAddedImages }) => ({
    ...state,
    isRemoving: false,
    addedImages: remainingAddedImages,
    currentAction: 'idle' as CurrentActionType,
    error: null,
  })),

  on(GalleryActions.removeAddedImagesFailure, (state, { error }) => ({
    ...state,
    isRemoving: false,
    currentAction: 'idle' as CurrentActionType,
    error,
  }))
);
