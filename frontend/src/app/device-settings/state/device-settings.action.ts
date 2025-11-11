import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ImageType } from '../../shared/model/image-type.model';

export const DeviceSettingsActions = createActionGroup({
  source: 'DeviceSettings',
  events: {
    'Update Device Images': props<{ updatedImages: ImageType[] }>(),

    'Load Selected Images': emptyProps(),
    'Load Selected Images Success': props<{ images: ImageType[] }>(),
    'Load Selected Images Failure': props<{ error: string }>(),

    'Upload For Device': props<{ image: ImageType[] }>(),
    'Upload For Device Success': props<{ deviceImages: ImageType[] }>(),
    'Upload For Device Failure': props<{ error: string }>(),

    'Copy Image To Device': props<{ selectedSrcs: string[] }>(),
    'Copy Image To Device Success': props<{ copiedImages: ImageType[] }>(),
    'Copy Image To Device Failure': props<{ error: string }>(),

    'Delete Device Images': emptyProps(),
    'Delete Device Images Success': props<{
      deletedSrcs: string[];
      remainingImages: ImageType[];
      updatedDeviceImages: ImageType[];
    }>(),
    'Delete Device Images Failure': props<{ error: string }>(),

    'Remove Image': props<{ srcsToRemove: string[] }>(),
    'Remove Image Success': props<{ images: ImageType[] }>(),
    'Remove Image Failure': props<{ error: string }>(),
  },
});
