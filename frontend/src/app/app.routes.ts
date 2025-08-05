import { Routes } from '@angular/router';

import { GalleryComponent } from './gallery/gallery.component';
import { DragDropUploadComponent } from './drag-drop-upload/drag-drop-upload.component';
import { ViewAllComponent } from './view-all/view-all.component';
import { DeviceSettingsComponent } from './device-settings/device-settings.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { LogoutComponent } from './auth/logout/logout.component';

export const routes: Routes = [
    { path: "", component: ViewAllComponent },
    { path: "gallery", component: GalleryComponent },
    { path: "dragDrop", component: DragDropUploadComponent },
    { path: "viewAll", component: ViewAllComponent },
    { path: "deviceSettings", component: DeviceSettingsComponent },
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent },
    { path: "logout", component: LogoutComponent },

];
