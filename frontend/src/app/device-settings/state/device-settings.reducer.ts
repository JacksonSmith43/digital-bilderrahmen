import { createReducer, on } from '@ngrx/store';

import { initialDeviceSettingsState } from './device-settings.state';
import { DeviceSettingsActions } from './device-settings.action';
import { CurrentActionType } from '../../shared/model/current-action.model';

export const deviceSettingsReducer = createReducer(
  initialDeviceSettingsState,

  on(DeviceSettingsActions.updateDeviceImages, (state, { updatedImages }) => ({
    ...state,
    deviceImages: updatedImages,
    error: null,
  })),

  on(DeviceSettingsActions.deleteDeviceImages, state => ({
    ...state,
    isDeleting: true,
    isDevice: true,
    currentAction: 'deleting' as CurrentActionType,
    error: null,
  })),

  on(
    DeviceSettingsActions.deleteDeviceImagesSuccess,
    (state, { deletedSrcs, remainingImages, updatedDeviceImages }) => ({
      ...state,
      selectedImageSrcs: [],
      galleryImages: remainingImages,
      deviceImages: updatedDeviceImages,
      isDeleting: false,
      isDevice: false,

      currentAction: 'idle' as CurrentActionType,
      error: null,
    })
  ),

  on(DeviceSettingsActions.deleteDeviceImagesFailure, (state, { error }) => ({
    ...state,
    isDeleting: false,
    isDevice: false,
    currentAction: 'idle' as CurrentActionType,
    error,
  })),

  on(DeviceSettingsActions.removeImage, (state, { srcsToRemove }) => ({
    ...state,
    deviceImages: state.deviceImages.filter(img => !srcsToRemove.includes(img.src)),
    isRemoving: true,
    isDevice: true,
    currentAction: 'removing' as CurrentActionType,
    error: null,
  })),

  on(DeviceSettingsActions.removeImageSuccess, (state, { images }) => ({
    ...state,
    removedImages: images,
    isRemoving: false,
    isDevice: false,
    currentAction: 'idle' as CurrentActionType,
    error: null,
  })),

  on(DeviceSettingsActions.removeImageFailure, (state, { error }) => ({
    ...state,
    isRemoving: false,
    isDevice: false,
    currentAction: 'idle' as CurrentActionType,
    error,
  })),

  on(DeviceSettingsActions.updateDeviceImages, state => ({
    ...state,
    isSelecting: true,
    isDevice: true,
    currentAction: 'selecting' as CurrentActionType,
    error: null,
  })),

  on(DeviceSettingsActions.uploadForDeviceSuccess, (state, { deviceImages }) => ({
    ...state,
    deviceImages: deviceImages,
    selectedImageSrcs: [],
    isSelecting: false,
    isDevice: false,
    currentAction: 'idle' as CurrentActionType,
    error: null,
  })),

  on(DeviceSettingsActions.uploadForDeviceFailure, (state, { error }) => ({
    ...state,
    isSelecting: false,
    isDevice: false,
    currentAction: 'idle' as CurrentActionType,
    error,
  }))
);
