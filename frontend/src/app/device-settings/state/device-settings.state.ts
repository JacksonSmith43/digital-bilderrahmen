import { CurrentActionType } from '../../shared/model/current-action.model';
import { ImageType } from '../../shared/model/image-type.model';

export interface DeviceSettingsState {
  deviceImages: ImageType[];

  removedImages: ImageType[];

  isSelecting: boolean;
  isRemoving: boolean;
  isDeleting: boolean;

  isDevice: boolean;
}

export const initialDeviceSettingsState: DeviceSettingsState = {
  deviceImages: [],

  removedImages: [],

  isSelecting: false,
  isRemoving: false,
  isDeleting: false,

  isDevice: false,
};
