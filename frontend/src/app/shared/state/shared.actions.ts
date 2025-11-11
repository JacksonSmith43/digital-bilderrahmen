import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { ImageType } from '../model/image-type.model';
import { CurrentActionType } from '../model/current-action.model';

export const SharedActions = createActionGroup({
  source: 'Shared',
  events: {
    'Toggle Image Selection': props<{ src: string }>(),
    'Clear Selection': emptyProps(),

    'Set Current Action': props<{ action: CurrentActionType }>(),

    'Load Images': emptyProps(),
    'Load Images Success': props<{ images: ImageType[] }>(),
    'Load Images Failure': props<{ error: string }>(),

    'Fetch All Images': emptyProps(),
    'Fetch All Images Success': props<{ images: ImageType[] }>(),
    'Fetch All Images Failure': props<{ error: string }>(),
  },
});
