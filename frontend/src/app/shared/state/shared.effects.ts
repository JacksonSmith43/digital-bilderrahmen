import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, from, map, of, switchMap } from 'rxjs';

import { FetchImagesService } from '../services/fetch-images.service';
import { ImageProcessingService } from '../services/image-processing.service';
import { SharedActions } from './shared.actions';

Injectable();
export class SharedEffects {
  private actions$ = inject(Actions);
  private imageProcessingService = inject(ImageProcessingService);
  private fetchImagesService = inject(FetchImagesService);
 
  loadImages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SharedActions.loadImages),
      switchMap(() =>
        from(this.imageProcessingService.loadImages()).pipe(
          map(images => SharedActions.loadImagesSuccess({ images })),
          catchError(error => of(SharedActions.loadImagesFailure({ error: error.message })))
        )
      )
    )
  );

  fetchAllImages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SharedActions.fetchAllImages),
      switchMap(() =>
        from(this.fetchImagesService.fetchAllImages()).pipe(
          map(images => SharedActions.fetchAllImagesSuccess({ images })),
          catchError(error => of(SharedActions.fetchAllImagesFailure({ error: error.message })))
        )
      )
    )
  );
}
