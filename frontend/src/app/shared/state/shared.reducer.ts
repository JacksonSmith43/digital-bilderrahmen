import { createReducer, on } from '@ngrx/store';

import { initialSharedState } from './shared.state';
import { CurrentActionType } from '../model/current-action.model';
import { SharedActions } from './shared.actions';

export const sharedReducer = createReducer(
  initialSharedState,

  on(SharedActions.toggleImageSelection, (state, { src }) => {
    const isSelected = state.selectedImageSrcs.includes(src);
    let newSelection = isSelected ? state.selectedImageSrcs.filter(s => s !== src) : [...state.selectedImageSrcs, src];

    return {
      ...state,
      isSelecting: !isSelected, // Workaround to get the state from showing the current state.
      selectedImageSrcs: newSelection,
    };
  }),

  on(SharedActions.clearSelection, state => ({
    ...state,
    selectedImageSrcs: [],
  })),

  on(SharedActions.loadImages, state => ({
    ...state,
    isLoading: true,
    currentAction: 'uploading' as CurrentActionType,
    error: null,
  })),

  on(SharedActions.loadImagesSuccess, (state, { images }) => ({
    ...state,
    galleryImages: images,
    isLoading: false,
    currentAction: 'idle' as CurrentActionType,
    error: null,
  })),

  on(SharedActions.loadImagesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    currentAction: 'idle' as CurrentActionType,
    error,
  })),

  on(SharedActions.fetchAllImages, state => ({
    ...state,
    isFetching: true,
    currentAction: 'fetching' as CurrentActionType,
    error: null,
  })),

  on(SharedActions.fetchAllImagesSuccess, (state, { images }) => ({
    ...state,
    galleryImages: images,
    isFetching: false,
    currentAction: 'idle' as CurrentActionType,
    error: null,
  })),

  on(SharedActions.fetchAllImagesFailure, (state, { error }) => ({
    ...state,
    currentAction: 'idle' as CurrentActionType,
    isFetching: false,
    error,
  }))
);
