import { Component, inject } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  private appService = inject(AppService);

  onAllView() {
    return this.appService.getAllView();
  }

  onPicturesView() {
    return this.appService.getPictureView();
  }

  onDragDropView() {
    return this.appService.getDragDropView();
  }

  getSelectedViewLabel() {
    return this.appService.getSelectedViewLabel();
  }

  onIsAddImage() {
    console.log(this.appService.getIsAddImage());
    return this.appService.getIsAddImage();
  }
}

