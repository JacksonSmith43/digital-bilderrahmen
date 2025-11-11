import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SharedState } from './shared.state';

export const selectSharedState = createFeatureSelector<SharedState>('Shared');

export const selectSelectedSrcs = createSelector(selectSharedState, state => state.selectedImageSrcs || []);

export const selectIsLoading = createSelector(selectSharedState, state => state.isLoading);
export const selectIsFetching = createSelector(selectSharedState, state => state.isFetching);
export const selectCurrentAction = createSelector(selectSharedState, state => state.currentAction || 'idle');
export const selectError = createSelector(selectSharedState, state => state.error);
