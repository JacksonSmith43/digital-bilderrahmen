import { createFeatureSelector, createSelector } from '@ngrx/store';

import { DeviceSettingsState } from './device-settings.state';

export const selectDeviceSettingsState = createFeatureSelector<DeviceSettingsState>('DeviceSettings'); // The name should be the same as source: DeviceSettings.

export const selectUpdateDeviceImages = createSelector(selectDeviceSettingsState, state => state.deviceImages || []);
export const selectDeviceImagesLength = createSelector(
  selectDeviceSettingsState,
  state => state.deviceImages.length || []
);

export const selectIsSelecting = createSelector(selectDeviceSettingsState, state => state.isSelecting);
export const selectIsRemoving = createSelector(selectDeviceSettingsState, state => state.isRemoving);
export const selectIsDeleting = createSelector(selectDeviceSettingsState, state => state.isDeleting);

export const selectIsDevice = createSelector(selectDeviceSettingsState, state => state.isDevice);
