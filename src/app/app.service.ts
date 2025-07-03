import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class AppService {

    selectedView: "viewAll" | "viewPictures" | "viewDragDrop" = "viewAll";
    isAddImage = false;

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

    getPictureView() {
        this.selectedView = "viewPictures";
    }

    getDragDropView() {
        this.selectedView = "viewDragDrop";
    }

    getAllView() {
        this.selectedView = "viewAll";
    }

    getIsAddImage() {
        this.isAddImage = true;
        return this.isAddImage;
    }
}