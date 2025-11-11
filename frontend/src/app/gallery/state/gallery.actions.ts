import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { ImageType } from '../../shared/model/image-type.model';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { CurrentActionType } from '../../shared/model/current-action.model';

export const GalleryActions = createActionGroup({
  source: 'Gallery',
  events: {
    'Update Gallery Images': props<{ images: ImageType[] }>(),

    'Add Images': props<{ image: ImageType }>(),
    'Add Dropped Files': props<{ files: NgxFileDropEntry[] }>(),
    'Add Images Success': props<{ addedImages: ImageType[] }>(),
    'Add Images Failure': props<{ error: string }>(),

    'Upload To Gallery': props<{ selectedSrcs: string[] }>(),
    'Upload To Gallery Success': props<{ uploadedImages: ImageType[]; targetFolder: 'uploadedAllImages' }>(),
    'Upload To Gallery Failure': props<{ error: string }>(),

    'Upload To Device': props<{ selectedSrcs: string[] }>(),
    'Upload To Device Success': props<{ uploadedImages: ImageType[]; targetFolder: 'selectForDevice' }>(),
    'Upload To Device Failure': props<{ error: string }>(),

    'Delete Gallery Images': props<{ selectedSrcs: string[] }>(),
    'Delete Gallery Images Success': props<{
      deletedSrcs: string[];
      remainingImages: ImageType[];
      updatedDeviceImages: ImageType[];
    }>(),
    'Delete Gallery Images Failure': props<{ error: string }>(),

    'Remove Added Images': props<{ srcsToRemove: string[] }>(),
    'Remove Added Images Success': props<{
      remainingAddedImages: ImageType[];
    }>(),
    'Remove Added Images Failure': props<{ error: string }>(),
  },
});
