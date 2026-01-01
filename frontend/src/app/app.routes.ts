import { Routes } from '@angular/router';

import { GalleryComponent } from './gallery/components/gallery.component';
import { DragDropUploadComponent } from './drag-drop-upload/drag-drop-upload.component';
import { DeviceSettingsComponent } from './device-settings/components/device-settings.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: GalleryComponent, canActivate: [authGuard] },
  { path: 'gallery', component: GalleryComponent, canActivate: [authGuard] },
  { path: 'addImages', component: DragDropUploadComponent, canActivate: [authGuard] },
  { path: 'deviceSettings', component: DeviceSettingsComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'logout', component: LogoutComponent },
];
