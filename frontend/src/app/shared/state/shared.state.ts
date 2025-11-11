import { CurrentActionType } from '../model/current-action.model';

export interface SharedState {
  selectedImageSrcs: string[];

  isLoading: boolean;
  isFetching: boolean;

  currentAction: CurrentActionType;

  error: string | null;
}

export const initialSharedState: SharedState = {
  selectedImageSrcs: [],

  isLoading: false,
  isFetching: false,

  currentAction: 'idle',

  error: null,
};
