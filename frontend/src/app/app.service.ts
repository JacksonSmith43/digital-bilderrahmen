import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class AppService {

    selectedView: "viewAll" | "viewPictures" | "viewDragDrop" | "deviceSettings" = "viewAll";
    isAddImage = false;

    getSelectedViewLabel() {
        switch (this.selectedView) {
            case "viewAll":
                return "View All";

            case "viewPictures":
                return "View Pictures";

            case "viewDragDrop":
                return "View Drag Drop";

            case "deviceSettings":
                return "View Device Settings";

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
        this.selectedView = "viewDragDrop";
        return this.isAddImage;
    }

    getDeviceSettingsView() {
        this.selectedView = "deviceSettings"
    }
}