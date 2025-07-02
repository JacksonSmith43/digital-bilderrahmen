import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  selectedView: "viewAll" | "viewPictures" | "viewDragDrop" = "viewAll";

  getSelectedViewLabel() {
    switch (this.selectedView) {
      case "viewAll":
        return "View All";

      case "viewPictures":
        return "View Pictures";

      case "viewDragDrop":
        return "View Drag Drop";

      default:
        return "View";
    }
  }

  onPicturesView() {
    this.selectedView = "viewPictures";
  }

  onDragDropView() {
    this.selectedView = "viewDragDrop";
  }

  onAllView() {
    this.selectedView = "viewAll";
  }
}

